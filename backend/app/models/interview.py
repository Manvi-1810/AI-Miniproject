from datetime import datetime

from app.extensions import db


class Interview(db.Model):
    __tablename__ = "interviews"

    id = db.Column(db.Integer, primary_key=True)

    application_id = db.Column(
        db.Integer,
        db.ForeignKey("applications.id"),
        nullable=False,
        index=True,
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default="pending",
    )

    questions = db.Column(db.JSON, nullable=True)

    responses = db.Column(db.JSON, nullable=True)

    overall_score = db.Column(db.Float, nullable=True)

    performance_report = db.Column(db.JSON, nullable=True)

    started_at = db.Column(db.DateTime, nullable=True)

    completed_at = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    application = db.relationship(
        "Application",
        backref=db.backref("interviews", lazy=True),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "application_id": self.application_id,
            "status": self.status,
            "questions": self.questions,
            "responses": self.responses,
            "overall_score": self.overall_score,
            "performance_report": self.performance_report,
            "started_at": (
                self.started_at.isoformat()
                if self.started_at else None
            ),
            "completed_at": (
                self.completed_at.isoformat()
                if self.completed_at else None
            ),
            "created_at": self.created_at.isoformat(),
        }