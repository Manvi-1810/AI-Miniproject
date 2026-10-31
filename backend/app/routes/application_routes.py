from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User, Job, Application

from app.services.skill_gap.recommendation_service import (
    generate_skill_recommendations
)


applications_bp = Blueprint("applications", __name__)


# Get all applications submitted by the logged-in candidate
@applications_bp.get("/my")
@jwt_required()
def get_my_applications():
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
            "message": "Only candidates can view their applications"
        }), 403

    applications = (
        Application.query
        .filter_by(candidate_id=user.id)
        .order_by(Application.applied_at.desc())
        .all()
    )

    results = []

    for application in applications:
        job = db.session.get(Job, application.job_id)

        missing_skills = application.missing_skills or []

        # Generate recommendations for missing skills
        recommendations = []

        if (
            application.status == "not_selected"
            and missing_skills
        ):
            recommendations = generate_skill_recommendations(
                missing_skills
            )

        application_data = application.to_dict()

        application_data.update({
            "job": job.to_dict() if job else None,
            "skill_gap_recommendations": recommendations
        })

        results.append(application_data)

    return jsonify({
        "status": "success",
        "count": len(results),
        "applications": results
    }), 200


# Submit a new job application
@applications_bp.post("/")
@jwt_required()
def apply_for_job():
    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    if user.role != "candidate":
        return jsonify({
            "message": "Only candidates can apply for jobs"
        }), 403

    data = request.get_json() or {}
    job_id = data.get("job_id")

    if not job_id:
        return jsonify({
            "message": "Job ID is required"
        }), 400

    job = db.session.get(Job, job_id)

    if not job or job.status != "active":
        return jsonify({
            "message": "Job not found or inactive"
        }), 404

    existing_application = Application.query.filter_by(
        candidate_id=user.id,
        job_id=job.id
    ).first()

    if existing_application:
        return jsonify({
            "message": "You have already applied for this job"
        }), 409

    application = Application(
        candidate_id=user.id,
        job_id=job.id,
        status="submitted"
    )

    db.session.add(application)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Application submitted successfully",
        "application": application.to_dict()
    }), 201