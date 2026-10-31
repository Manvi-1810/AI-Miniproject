from datetime import datetime

from app.extensions import db


class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)

    candidate_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    job_id = db.Column(
        db.Integer,
        db.ForeignKey("jobs.id"),
        nullable=False,
        index=True,
    )

    resume_path = db.Column(
        db.String(255),
        nullable=True
    )

    match_score = db.Column(
        db.Float,
        nullable=True
    )

    matched_skills = db.Column(
        db.JSON,
        nullable=True
    )

    missing_skills = db.Column(
        db.JSON,
        nullable=True
    )

    # Skill gap report email tracking
    skill_gap_email_sent = db.Column(
        db.Boolean,
        nullable=False,
        default=False
    )

    skill_gap_report_path = db.Column(
        db.String(500),
        nullable=True
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default="submitted",
    )

    applied_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    candidate = db.relationship(
        "User",
        backref=db.backref("applications", lazy=True),
    )

    job = db.relationship(
        "Job",
        backref=db.backref("applications", lazy=True),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "candidate_id": self.candidate_id,
            "job_id": self.job_id,
            "resume_path": self.resume_path,
            "match_score": self.match_score,
            "matched_skills": self.matched_skills,
            "missing_skills": self.missing_skills,
            "skill_gap_email_sent": self.skill_gap_email_sent,
            "skill_gap_report_path": self.skill_gap_report_path,
            "status": self.status,
            "applied_at": self.applied_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }