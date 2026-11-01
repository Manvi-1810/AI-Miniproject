
from flask import Blueprint, jsonify

from app.routes.job_routes import jobs_bp
from app.routes.application_routes import applications_bp
from app.routes.resume_routes import resumes_bp
from app.routes.matching_routes import matching_bp
from app.routes.notification_routes import notifications_bp
from app.routes.recruiter_routes import recruiter_bp


api_bp = Blueprint("api", __name__)


@api_bp.get("/health")
def health_check():
    return jsonify({
        "status": "success",
        "message": "API is running"
    }), 200


# Existing candidate APIs
api_bp.register_blueprint(jobs_bp, url_prefix="/jobs")
api_bp.register_blueprint(applications_bp, url_prefix="/applications")
api_bp.register_blueprint(resumes_bp, url_prefix="/resumes")
api_bp.register_blueprint(matching_bp, url_prefix="/matching")
api_bp.register_blueprint(notifications_bp)

# Recruiter APIs
api_bp.register_blueprint(
    recruiter_bp,
    url_prefix="/recruiter"
)
