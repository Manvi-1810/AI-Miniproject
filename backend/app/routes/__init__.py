from flask import Blueprint, jsonify

api_bp = Blueprint("api", __name__)


@api_bp.get("/health")
def health_check():
    return jsonify({
        "status": "success",
        "message": "Recruitment API is running",
        "team": "IS026",
        "version": "1.0.0",
    }), 200