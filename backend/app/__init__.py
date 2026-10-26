from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from app.config import Config
from app.extensions import cors, db, jwt
from app.routes import api_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)

    # Allow requests from the local Vite development server.
    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": ["http://localhost:5173"]
            }
        },
    )

    app.register_blueprint(api_bp, url_prefix="/api")

    @app.errorhandler(HTTPException)
    def handle_http_error(error):
        return jsonify({
            "status": "error",
            "message": error.description,
        }), error.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        app.logger.exception("Unexpected application error")
        return jsonify({
            "status": "error",
            "message": "An unexpected server error occurred.",
        }), 500

    @app.get("/")
    def index():
        return jsonify({
            "message": "IS026 Recruitment System API",
            "health": "/api/health",
        }), 200

    return app