
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_

from app.extensions import db
from app.models import User, Job, Application


jobs_bp = Blueprint("jobs", __name__)


def get_current_recruiter():
    user_id = get_jwt_identity()
    recruiter = db.session.get(User, int(user_id))

    if not recruiter:
        return None, (jsonify({
            "status": "error",
            "message": "User not found."
        }), 404)

    if recruiter.role != "recruiter":
        return None, (jsonify({
            "status": "error",
            "message": "Only recruiters can perform this action."
        }), 403)

    return recruiter, None


def get_recruiter_job(job_id, recruiter_id):
    job = Job.query.filter_by(
        id=job_id,
        recruiter_id=recruiter_id
    ).first()

    if not job:
        return None, (jsonify({
            "status": "error",
            "message": "Job not found or you do not have permission."
        }), 404)

    return job, None


# --------------------------------------------------
# GET ALL ACTIVE JOBS - CANDIDATE
# --------------------------------------------------

@jobs_bp.get("/")
def get_jobs():
    search = request.args.get("search", "").strip()
    location = request.args.get("location", "").strip()

    query = Job.query.filter_by(status="active")

    if search:
        query = query.filter(
            or_(
                Job.title.ilike(f"%{search}%"),
                Job.company_name.ilike(f"%{search}%"),
                Job.description.ilike(f"%{search}%")
            )
        )

    if location:
        query = query.filter(
            Job.location.ilike(f"%{location}%")
        )

    jobs = query.order_by(Job.created_at.desc()).all()

    return jsonify({
        "status": "success",
        "count": len(jobs),
        "jobs": [job.to_dict() for job in jobs]
    }), 200


# --------------------------------------------------
# GET A SINGLE ACTIVE JOB - CANDIDATE
# --------------------------------------------------

@jobs_bp.get("/<int:job_id>")
def get_job(job_id):
    job = Job.query.filter_by(
        id=job_id,
        status="active"
    ).first()

    if not job:
        return jsonify({
            "status": "error",
            "message": "Job not found."
        }), 404

    return jsonify({
        "status": "success",
        "job": job.to_dict()
    }), 200


# --------------------------------------------------
# CREATE JOB - RECRUITER
# --------------------------------------------------

@jobs_bp.post("/")
@jwt_required()
def create_job():

    recruiter, error = get_current_recruiter()

    if error:
        return error

    data = request.get_json(silent=True) or {}

    title = str(data.get("title", "")).strip()
    company_name = str(data.get("company_name", "")).strip()
    description = str(data.get("description", "")).strip()

    required_skills = data.get("required_skills")

    qualification = str(
        data.get("qualification", "")
    ).strip()

    location = str(data.get("location", "")).strip()

    employment_type = str(
        data.get("employment_type", "")
    ).strip()

    try:
        min_experience = float(
            data.get("min_experience", 0)
        )

        max_value = data.get("max_experience")

        max_experience = (
            float(max_value)
            if max_value is not None
            else None
        )

    except (TypeError, ValueError):
        return jsonify({
            "status": "error",
            "message": "Experience must be a valid number."
        }), 400

    if not title or not company_name or not description:
        return jsonify({
            "status": "error",
            "message": "Title, company name and description are required."
        }), 400

    if not isinstance(required_skills, list) or not required_skills:
        return jsonify({
            "status": "error",
            "message": "Provide at least one required skill."
        }), 400

    if not all(
        isinstance(skill, str) and skill.strip()
        for skill in required_skills
    ):
        return jsonify({
            "status": "error",
            "message": "Every skill must be a non-empty string."
        }), 400

    if min_experience < 0:
        return jsonify({
            "status": "error",
            "message": "Minimum experience cannot be negative."
        }), 400

    if max_experience is not None:
        if max_experience < min_experience:
            return jsonify({
                "status": "error",
                "message": "Maximum experience cannot be less than minimum experience."
            }), 400

    job = Job(
        recruiter_id=recruiter.id,
        title=title,
        company_name=company_name,
        description=description,
        required_skills=[
            skill.strip() for skill in required_skills
        ],
        qualification=qualification or None,
        min_experience=min_experience,
        max_experience=max_experience,
        location=location or None,
        employment_type=employment_type or None,
        status="active"
    )

    try:
        db.session.add(job)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Job posted successfully.",
            "job": job.to_dict()
        }), 201

    except Exception:
        db.session.rollback()
        raise


# --------------------------------------------------
# EDIT JOB - RECRUITER
# PATCH /api/jobs/<job_id>
# --------------------------------------------------

@jobs_bp.patch("/<int:job_id>")
@jwt_required()
def update_job(job_id):

    recruiter, error = get_current_recruiter()

    if error:
        return error

    job, error = get_recruiter_job(
        job_id,
        recruiter.id
    )

    if error:
        return error

    data = request.get_json(silent=True)

    if not isinstance(data, dict) or not data:
        return jsonify({
            "status": "error",
            "message": "Provide job details to update."
        }), 400

    if "title" in data:
        if not isinstance(data["title"], str) or not data["title"].strip():
            return jsonify({
                "status": "error",
                "message": "Job title cannot be empty."
            }), 400
        job.title = data["title"].strip()

    if "company_name" in data:
        if not isinstance(data["company_name"], str) or not data["company_name"].strip():
            return jsonify({
                "status": "error",
                "message": "Company name cannot be empty."
            }), 400
        job.company_name = data["company_name"].strip()

    if "description" in data:
        if not isinstance(data["description"], str) or not data["description"].strip():
            return jsonify({
                "status": "error",
                "message": "Description cannot be empty."
            }), 400
        job.description = data["description"].strip()

    if "required_skills" in data:
        skills = data["required_skills"]

        if (
            not isinstance(skills, list)
            or not skills
            or not all(
                isinstance(skill, str) and skill.strip()
                for skill in skills
            )
        ):
            return jsonify({
                "status": "error",
                "message": "Provide a valid list of required skills."
            }), 400

        job.required_skills = [
            skill.strip() for skill in skills
        ]

    if "qualification" in data:
        value = data["qualification"]
        if value is not None and not isinstance(value, str):
            return jsonify({
                "status": "error",
                "message": "Qualification must be text."
            }), 400
        job.qualification = value.strip() or None if value else None

    if "location" in data:
        value = data["location"]
        if value is not None and not isinstance(value, str):
            return jsonify({
                "status": "error",
                "message": "Location must be text."
            }), 400
        job.location = value.strip() or None if value else None

    if "employment_type" in data:
        value = data["employment_type"]
        if value is not None and not isinstance(value, str):
            return jsonify({
                "status": "error",
                "message": "Employment type must be text."
            }), 400
        job.employment_type = value.strip() or None if value else None

    try:
        min_exp = (
            float(data["min_experience"])
            if "min_experience" in data
            else job.min_experience
        )

        max_exp = (
            float(data["max_experience"])
            if "max_experience" in data
            and data["max_experience"] is not None
            else (
                None if "max_experience" in data
                else job.max_experience
            )
        )

    except (TypeError, ValueError):
        return jsonify({
            "status": "error",
            "message": "Experience must be a valid number."
        }), 400

    if min_exp < 0:
        return jsonify({
            "status": "error",
            "message": "Minimum experience cannot be negative."
        }), 400

    if max_exp is not None and max_exp < min_exp:
        return jsonify({
            "status": "error",
            "message": "Maximum experience cannot be less than minimum experience."
        }), 400

    job.min_experience = min_exp
    job.max_experience = max_exp

    try:
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Job updated successfully.",
            "job": job.to_dict()
        }), 200

    except Exception:
        db.session.rollback()
        raise


# --------------------------------------------------
# ACTIVATE / DEACTIVATE JOB
# PATCH /api/jobs/<job_id>/status
# --------------------------------------------------

@jobs_bp.patch("/<int:job_id>/status")
@jwt_required()
def update_job_status(job_id):

    recruiter, error = get_current_recruiter()

    if error:
        return error

    job, error = get_recruiter_job(
        job_id,
        recruiter.id
    )

    if error:
        return error

    data = request.get_json(silent=True) or {}
    new_status = data.get("status")

    if new_status not in ("active", "inactive"):
        return jsonify({
            "status": "error",
            "message": "Status must be active or inactive."
        }), 400

    job.status = new_status

    try:
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": f"Job {new_status} successfully.",
            "job": job.to_dict()
        }), 200

    except Exception:
        db.session.rollback()
        raise


# --------------------------------------------------
# DELETE JOB - ONLY IF NO APPLICATIONS EXIST
# DELETE /api/jobs/<job_id>
# --------------------------------------------------

@jobs_bp.delete("/<int:job_id>")
@jwt_required()
def delete_job(job_id):

    recruiter, error = get_current_recruiter()

    if error:
        return error

    job, error = get_recruiter_job(
        job_id,
        recruiter.id
    )

    if error:
        return error

    application_count = Application.query.filter_by(
        job_id=job.id
    ).count()

    if application_count > 0:
        return jsonify({
            "status": "error",
            "message": (
                "This job has applications and cannot be deleted. "
                "Deactivate it instead to preserve application history."
            ),
            "application_count": application_count
        }), 409

    try:
        db.session.delete(job)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Job deleted successfully."
        }), 200

    except Exception:
        db.session.rollback()
        raise
