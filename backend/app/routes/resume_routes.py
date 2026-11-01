
import os
import re
import uuid
from pathlib import Path

import pymupdf
import spacy

from docx import Document
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models import User, Resume


# Resume blueprint
resumes_bp = Blueprint("resumes", __name__)


# Store uploaded resumes in backend/uploads/resumes
BASE_DIR = Path(__file__).resolve().parents[2]
UPLOAD_FOLDER = BASE_DIR / "uploads" / "resumes"

ALLOWED_EXTENSIONS = {"pdf", "docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)


# Load spaCy model once
nlp = spacy.load("en_core_web_sm")


# Technical skills recognized by the skill extractor
SKILL_KEYWORDS = [
    "Python", "Java", "JavaScript", "TypeScript", "C", "C++",
    "React", "Node.js", "Express.js", "Flask", "Django",
    "HTML", "CSS", "Tailwind CSS",
    "MySQL", "PostgreSQL", "MongoDB", "SQL",
    "REST API", "GraphQL",
    "Machine Learning", "Deep Learning",
    "Artificial Intelligence", "NLP",
    "Data Analysis", "Pandas", "NumPy",
    "TensorFlow", "PyTorch", "Scikit-learn",
    "Git", "GitHub", "Docker",
    "AWS", "Azure", "Linux",
    "Communication", "Problem Solving",
]


# Check whether the uploaded file has an allowed extension
def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


# Resolve a stored resume path safely.
# This prevents deleting files outside the resume upload folder.
def get_safe_resume_path(stored_path):
    if not stored_path:
        return None

    stored = Path(stored_path)

    if stored.is_absolute():
        resolved_path = stored.resolve()
    else:
        resolved_path = (BASE_DIR / stored).resolve()

    allowed_folder = UPLOAD_FOLDER.resolve()

    try:
        resolved_path.relative_to(allowed_folder)
    except ValueError:
        raise ValueError("Invalid resume storage path.")

    return resolved_path


# Extract text from PDF
def extract_pdf_text(file_path):
    text_parts = []

    with pymupdf.open(str(file_path)) as document:
        for page in document:
            text_parts.append(page.get_text("text"))

    return "\n".join(text_parts)


# Extract text from DOCX
def extract_docx_text(file_path):
    document = Document(str(file_path))

    paragraphs = [
        paragraph.text
        for paragraph in document.paragraphs
        if paragraph.text.strip()
    ]

    table_text = []

    for table in document.tables:
        for row in table.rows:
            for cell in row.cells:
                if cell.text.strip():
                    table_text.append(cell.text.strip())

    return "\n".join(paragraphs + table_text)


# Select the extraction method based on file type
def extract_resume_text(file_path, extension):

    if extension == "pdf":
        return extract_pdf_text(file_path)

    if extension == "docx":
        return extract_docx_text(file_path)

    raise ValueError("Unsupported resume format")


# Extract technical skills using spaCy and keyword matching
def extract_skills(text):

    # Process resume text using spaCy
    nlp(text[:100000])

    found_skills = []
    normalized_text = text.lower()

    for skill in SKILL_KEYWORDS:

        pattern = (
            r"(?<![a-z0-9])"
            + re.escape(skill.lower())
            + r"(?![a-z0-9])"
        )

        if re.search(pattern, normalized_text):
            found_skills.append(skill)

    return found_skills


# =====================================================
# GET: View all resumes uploaded by the logged-in user
# Endpoint: GET /api/resumes/my
# =====================================================

@resumes_bp.get("/my")
@jwt_required()
def get_my_resumes():

    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if not user:
        return jsonify({
            "status": "error",
            "message": "User not found"
        }), 404

    if user.role != "candidate":
        return jsonify({
            "status": "error",
            "message": "Only candidates can view resumes"
        }), 403

    resumes = (
        Resume.query
        .filter_by(candidate_id=user.id)
        .order_by(Resume.uploaded_at.desc())
        .all()
    )

    return jsonify({
        "status": "success",
        "count": len(resumes),
        "resumes": [
            resume.to_dict()
            for resume in resumes
        ]
    }), 200


# =====================================================
# DELETE: Delete a resume belonging to the logged-in user
# Endpoint: DELETE /api/resumes/<resume_id>
# =====================================================

@resumes_bp.delete("/<int:resume_id>")
@jwt_required()
def delete_resume(resume_id):

    try:
        user_id = get_jwt_identity()

        user = db.session.get(User, user_id)

        if not user:
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404

        if user.role != "candidate":
            return jsonify({
                "status": "error",
                "message": "Only candidates can delete resumes"
            }), 403

        # Find only a resume belonging to this candidate
        resume = Resume.query.filter_by(
            id=resume_id,
            candidate_id=user.id
        ).first()

        if not resume:
            return jsonify({
                "status": "error",
                "message": "Resume not found or you do not have permission to delete it."
            }), 404

        # Resolve and validate the file location
        file_path = get_safe_resume_path(resume.file_path)

        # Delete the database record first
        db.session.delete(resume)
        db.session.commit()

        # Delete the physical file after the database commit
        file_deleted = False

        if file_path and file_path.exists() and file_path.is_file():
            try:
                file_path.unlink()
                file_deleted = True
            except OSError as file_error:
                # The database record is already deleted.
                # Log the file cleanup failure for maintenance.
                print("Resume file deletion error:", file_error)

        return jsonify({
            "status": "success",
            "message": "Resume deleted successfully.",
            "resume_id": resume_id,
            "file_deleted": file_deleted
        }), 200

    except ValueError as error:

        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 400

    except Exception as error:

        db.session.rollback()

        print("Resume deletion error:", str(error))

        return jsonify({
            "status": "error",
            "message": "An error occurred while deleting the resume."
        }), 500


# =====================================================
# POST: Upload and analyze a resume
# Endpoint: POST /api/resumes/upload
# =====================================================

@resumes_bp.post("/upload")
@jwt_required()
def upload_resume():

    saved_file_path = None

    try:

        user_id = get_jwt_identity()

        user = db.session.get(User, user_id)

        if not user:
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404

        if user.role != "candidate":
            return jsonify({
                "status": "error",
                "message": "Only candidates can upload resumes"
            }), 403

        # Check whether a file was submitted
        if "resume" not in request.files:
            return jsonify({
                "status": "error",
                "message": "Please select a resume file"
            }), 400

        file = request.files["resume"]

        if not file or not file.filename:
            return jsonify({
                "status": "error",
                "message": "No file selected"
            }), 400

        # Validate file extension
        if not allowed_file(file.filename):
            return jsonify({
                "status": "error",
                "message": "Only PDF and DOCX files are allowed"
            }), 400

        # Validate file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)

        if file_size == 0:
            return jsonify({
                "status": "error",
                "message": "The uploaded file is empty"
            }), 400

        if file_size > MAX_FILE_SIZE:
            return jsonify({
                "status": "error",
                "message": "Resume size must not exceed 5 MB"
            }), 400

        # Generate a unique filename
        original_filename = secure_filename(file.filename)

        extension = original_filename.rsplit(".", 1)[1].lower()

        unique_filename = (
            f"{user.id}_{uuid.uuid4().hex}.{extension}"
        )

        saved_file_path = UPLOAD_FOLDER / unique_filename

        # Save uploaded file
        file.save(str(saved_file_path))

        # Extract resume text
        extracted_text = extract_resume_text(
            saved_file_path,
            extension
        )

        if not extracted_text.strip():

            saved_file_path.unlink(missing_ok=True)

            return jsonify({
                "status": "error",
                "message": (
                    "No readable text found. "
                    "Please upload a text-based PDF or DOCX resume."
                )
            }), 400

        # Extract technical skills
        extracted_skills = extract_skills(extracted_text)

        # Save resume details in MySQL
        resume = Resume(
            candidate_id=user.id,
            file_name=original_filename,
            file_path=str(
                Path("uploads") / "resumes" / unique_filename
            ),
            file_type=extension,
            extracted_text=extracted_text,
            extracted_skills=extracted_skills,
            education=None,
            experience=None,
        )

        db.session.add(resume)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Resume uploaded and analyzed successfully",
            "resume": resume.to_dict(),
        }), 201

    except Exception as error:

        db.session.rollback()

        if saved_file_path and saved_file_path.exists():
            saved_file_path.unlink(missing_ok=True)

        print("Resume upload error:", str(error))

        return jsonify({
            "status": "error",
            "message": "An error occurred while processing the resume"
        }), 500
