from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_

from app.extensions import db
from app.models.job import Job
from app.models.user import User

jobs_bp = Blueprint("jobs", __name__)


# GET ALL ACTIVE JOBS
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


# GET A SINGLE JOB
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


# POST A NEW JOB - RECRUITER ONLY
@jobs_bp.post("/")
@jwt_required()
def create_job():

    user_id = get_jwt_identity()
    recruiter = db.session.get(User, int(user_id))

    if not recruiter:
        return jsonify({
            "status": "error",
            "message": "User not found."
        }), 404

    if recruiter.role != "recruiter":
        return jsonify({
            "status": "error",
            "message": "Only recruiters can post jobs."
        }), 403

    data = request.get_json(silent=True) or {}

    title = str(data.get("title", "")).strip()
    company_name = str(data.get("company_name", "")).strip()
    description = str(data.get("description", "")).strip()
    required_skills = data.get("required_skills")
    qualification = str(data.get("qualification", "")).strip()
    location = str(data.get("location", "")).strip()
    employment_type = str(data.get("employment_type", "")).strip()

    try:
        min_experience = float(data.get("min_experience", 0))
        max_value = data.get("max_experience")
        max_experience = (
            float(max_value) if max_value is not None else None
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
        required_skills=[skill.strip() for skill in required_skills],
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