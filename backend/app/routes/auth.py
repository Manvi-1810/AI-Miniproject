from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models.user import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")
    role = str(data.get("role", "candidate")).strip().lower()

    if not name or len(name) < 2:
        return jsonify({
            "status": "error",
            "message": "Please enter a valid name."
        }), 400

    if not email or "@" not in email:
        return jsonify({
            "status": "error",
            "message": "Please enter a valid email."
        }), 400

    if not isinstance(password, str) or len(password) < 8:
        return jsonify({
            "status": "error",
            "message": "Password must contain at least 8 characters."
        }), 400

    if role not in ("candidate", "recruiter"):
        return jsonify({
            "status": "error",
            "message": "Role must be candidate or recruiter."
        }), 400

    if User.query.filter_by(email=email).first():
        return jsonify({
            "status": "error",
            "message": "An account with this email already exists."
        }), 409

    user = User(
        name=name,
        email=email,
        role=role,
    )
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()

        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role},
        )

        return jsonify({
            "status": "success",
            "message": "Account created successfully.",
            "access_token": access_token,
            "user": user.to_dict(),
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "An account with this email already exists."
        }), 409

    except Exception:
        db.session.rollback()
        raise


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}

    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")

    if not email or not isinstance(password, str) or not password:
        return jsonify({
            "status": "error",
            "message": "Email and password are required."
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({
            "status": "error",
            "message": "Invalid email or password."
        }), 401

    if not user.is_active:
        return jsonify({
            "status": "error",
            "message": "This account is inactive."
        }), 403

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role},
    )

    return jsonify({
        "status": "success",
        "message": "Login successful.",
        "access_token": access_token,
        "user": user.to_dict(),
    }), 200


@auth_bp.get("/me")
@jwt_required()
def current_user():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))

    if not user:
        return jsonify({
            "status": "error",
            "message": "User not found."
        }), 404

    return jsonify({
        "status": "success",
        "user": user.to_dict(),
    }), 200
@auth_bp.post("/change-password")
@jwt_required()
def change_password():
    data = request.get_json(silent=True) or {}

    current_password = data.get("current_password", "")
    new_password = data.get("new_password", "")

    if not current_password or not new_password:
        return jsonify({
            "status": "error",
            "message": "Current and new passwords are required."
        }), 400

    if not isinstance(new_password, str) or len(new_password) < 8:
        return jsonify({
            "status": "error",
            "message": "New password must contain at least 8 characters."
        }), 400

    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))

    if not user:
        return jsonify({
            "status": "error",
            "message": "User not found."
        }), 404

    if not user.check_password(current_password):
        return jsonify({
            "status": "error",
            "message": "Your current password is incorrect."
        }), 400

    if user.check_password(new_password):
        return jsonify({
            "status": "error",
            "message": "Your new password must be different."
        }), 400

    try:
        user.set_password(new_password)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Password changed successfully."
        }), 200

    except Exception:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Unable to update password. Please try again."
        }), 500