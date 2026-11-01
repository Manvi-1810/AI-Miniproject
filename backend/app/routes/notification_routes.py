from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.notification import Notification


notifications_bp = Blueprint(
    "notifications",
    __name__,
    url_prefix="/notifications"
)


@notifications_bp.get("/")
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()

    notifications = (
        Notification.query
        .filter_by(user_id=user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    unread_count = Notification.query.filter_by(
        user_id=user_id,
        is_read=False
    ).count()

    return jsonify({
        "status": "success",
        "notifications": [n.to_dict() for n in notifications],
        "unread_count": unread_count
    }), 200


@notifications_bp.patch("/<int:notification_id>/read")
@jwt_required()
def mark_notification_read(notification_id):
    user_id = get_jwt_identity()

    notification = Notification.query.filter_by(
        id=notification_id,
        user_id=user_id
    ).first()

    if not notification:
        return jsonify({
            "status": "error",
            "message": "Notification not found."
        }), 404

    notification.is_read = True
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Notification marked as read.",
        "notification": notification.to_dict()
    }), 200


@notifications_bp.patch("/read-all")
@jwt_required()
def mark_all_notifications_read():
    user_id = get_jwt_identity()

    Notification.query.filter_by(
        user_id=user_id,
        is_read=False
    ).update({"is_read": True})

    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "All notifications marked as read."
    }), 200