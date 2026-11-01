from app.models import Interview
from flask import Blueprint, jsonify ,request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User, Job, Application


recruiter_bp = Blueprint("recruiter", __name__)

SCREENING_THRESHOLD = 85.0


def get_current_recruiter():
    """Retrieve and validate the logged-in recruiter."""

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
            "message": "Recruiter access only."
        }), 403)

    return recruiter, None


# --------------------------------------------------
# 1. RECRUITER DASHBOARD STATISTICS
# GET /api/recruiter/dashboard
# --------------------------------------------------

@recruiter_bp.get("/dashboard")
@jwt_required()
def recruiter_dashboard():

    recruiter, error = get_current_recruiter()

    if error:
        return error

    jobs_query = Job.query.filter_by(
        recruiter_id=recruiter.id
    )

    job_ids = db.session.query(Job.id).filter_by(
        recruiter_id=recruiter.id
    ).subquery()

    applications_query = Application.query.filter(
        Application.job_id.in_(job_ids)
    )

    total_jobs = jobs_query.count()

    active_jobs = jobs_query.filter_by(
        status="active"
    ).count()

    inactive_jobs = jobs_query.filter_by(
        status="inactive"
    ).count()

    total_applicants = applications_query.count()

    qualified = applications_query.filter_by(
        status="qualified"
    ).count()

    not_selected = applications_query.filter_by(
        status="not_selected"
    ).count()

    pending_screening = applications_query.filter(
        Application.match_score.is_(None)
    ).count()

    return jsonify({
        "status": "success",
        "dashboard": {
            "recruiter": recruiter.to_dict(),
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "inactive_jobs": inactive_jobs,
            "total_applicants": total_applicants,
            "qualified_candidates": qualified,
            "not_qualified_candidates": not_selected,
            "pending_screening": pending_screening,
            "screening_threshold": SCREENING_THRESHOLD
        }
    }), 200


# --------------------------------------------------
# 2. GET JOBS POSTED BY LOGGED-IN RECRUITER
# GET /api/recruiter/jobs
# --------------------------------------------------

@recruiter_bp.get("/jobs")
@jwt_required()
def recruiter_jobs():

    recruiter, error = get_current_recruiter()

    if error:
        return error

    jobs = (
        Job.query
        .filter_by(recruiter_id=recruiter.id)
        .order_by(Job.created_at.desc())
        .all()
    )

    results = []

    for job in jobs:

        applicant_count = Application.query.filter_by(
            job_id=job.id
        ).count()

        job_data = job.to_dict()

        job_data["applicant_count"] = applicant_count

        results.append(job_data)

    return jsonify({
        "status": "success",
        "count": len(results),
        "jobs": results
    }), 200


# --------------------------------------------------
# 3. GET APPLICANTS FOR RECRUITER'S JOBS
# GET /api/recruiter/applicants
# --------------------------------------------------

@recruiter_bp.get("/applicants")
@jwt_required()
def recruiter_applicants():

    recruiter, error = get_current_recruiter()

    if error:
        return error

    applications = (
        Application.query
        .join(Job, Application.job_id == Job.id)
        .filter(Job.recruiter_id == recruiter.id)
        .order_by(Application.applied_at.desc())
        .all()
    )

    results = []

    for application in applications:

        candidate = db.session.get(
            User,
            application.candidate_id
        )

        job = application.job

        if not candidate or not job:
            continue

        score = application.match_score

        if score is None:
            screening_decision = "pending"
        elif score >= SCREENING_THRESHOLD:
            screening_decision = "qualified"
        else:
            screening_decision = "not_selected"

        results.append({
            "application_id": application.id,

            "candidate": {
                "id": candidate.id,
                "name": candidate.name,
                "email": candidate.email
            },

            "job": {
                "id": job.id,
                "title": job.title,
                "company_name": job.company_name
            },

            "applied_at": (
                application.applied_at.isoformat()
            ),

            "match_score": score,

            "screening_decision": screening_decision,

            "screening_threshold": SCREENING_THRESHOLD,

            "matched_skills": (
                application.matched_skills or []
            ),

            "missing_skills": (
                application.missing_skills or []
            ),

            "application_status": application.status
        })

    return jsonify({
        "status": "success",
        "count": len(results),
        "applicants": results
    }), 200

# --------------------------------------------------
# 4. AI SCREENING RESULTS
# GET /api/recruiter/screening-results
# --------------------------------------------------

@recruiter_bp.get("/screening-results")
@jwt_required()
def recruiter_screening_results():

    recruiter, error = get_current_recruiter()

    if error:
        return error

    # Retrieve only applications for this recruiter's jobs
    query = (
        Application.query
        .join(Job, Application.job_id == Job.id)
        .filter(Job.recruiter_id == recruiter.id)
    )

    # Optional job filter
    job_id = request.args.get("job_id")

    if job_id:
        try:
            job_id = int(job_id)
        except (TypeError, ValueError):
            return jsonify({
                "status": "error",
                "message": "Invalid job ID."
            }), 400

        query = query.filter(Job.id == job_id)

    applications = (
        query
        .order_by(Application.applied_at.desc())
        .all()
    )

    results = []

    for application in applications:

        candidate = application.candidate
        job = application.job

        if not candidate or not job:
            continue

        score = application.match_score

        if score is None:
            decision = "pending"
        elif score >= SCREENING_THRESHOLD:
            decision = "qualified"
        else:
            decision = "not_selected"

        results.append({
            "application_id": application.id,

            "candidate": {
                "id": candidate.id,
                "name": candidate.name,
                "email": candidate.email
            },

            "job": {
                "id": job.id,
                "title": job.title,
                "company_name": job.company_name
            },

            "match_score": score,

            "screening_threshold": SCREENING_THRESHOLD,

            "screening_decision": decision,

            "matched_skills": (
                application.matched_skills or []
            ),

            "missing_skills": (
                application.missing_skills or []
            ),

            "applied_at": application.applied_at.isoformat()
        })

    return jsonify({
        "status": "success",
        "count": len(results),
        "screening_results": results
    }), 200



# --------------------------------------------------
# 5. AI INTERVIEW RESULTS
# GET /api/recruiter/interview-results
# --------------------------------------------------

@recruiter_bp.get("/interview-results")
@jwt_required()
def recruiter_interview_results():

    recruiter, error = get_current_recruiter()

    if error:
        return error

    # Retrieve interviews belonging to this recruiter's jobs
    interviews = (
        Interview.query
        .join(Application, Interview.application_id == Application.id)
        .join(Job, Application.job_id == Job.id)
        .filter(Job.recruiter_id == recruiter.id)
        .order_by(Interview.created_at.desc())
        .all()
    )

    results = []

    for interview in interviews:

        application = interview.application

        if not application:
            continue

        candidate = application.candidate
        job = application.job

        if not candidate or not job:
            continue

        results.append({

            "interview_id": interview.id,

            "application_id": application.id,

            "candidate": {
                "id": candidate.id,
                "name": candidate.name,
                "email": candidate.email
            },

            "job": {
                "id": job.id,
                "title": job.title,
                "company_name": job.company_name
            },

            "interview_status": interview.status,

            "questions": interview.questions or [],

            "responses": interview.responses or [],

            "overall_score": interview.overall_score,

            "performance_report": (
                interview.performance_report or {}
            ),

            "started_at": (
                interview.started_at.isoformat()
                if interview.started_at else None
            ),

            "completed_at": (
                interview.completed_at.isoformat()
                if interview.completed_at else None
            ),

            "created_at": interview.created_at.isoformat()

        })

    return jsonify({
        "status": "success",
        "count": len(results),
        "interview_results": results
    }), 200
