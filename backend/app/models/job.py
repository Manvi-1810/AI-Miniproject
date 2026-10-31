from datetime import datetime

from app.extensions import db


class Job(db.Model):
    __tablename__ = "jobs"

    id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    recruiter_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    title = db.Column(
        db.String(150),
        nullable=False
    )

    company_name = db.Column(
        db.String(150),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=False
    )

    required_skills = db.Column(
        db.JSON,
        nullable=False
    )

    qualification = db.Column(
        db.String(255),
        nullable=True
    )

    min_experience = db.Column(
        db.Float,
        nullable=False,
        default=0.0
    )

    max_experience = db.Column(
        db.Float,
        nullable=True
    )

    location = db.Column(
        db.String(150),
        nullable=True
    )

    employment_type = db.Column(
        db.String(50),
        nullable=True
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="active"
    )

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "recruiter_id": self.recruiter_id,
            "title": self.title,
            "company_name": self.company_name,
            "description": self.description,
            "required_skills": self.required_skills,
            "qualification": self.qualification,
            "min_experience": self.min_experience,
            "max_experience": self.max_experience,
            "location": self.location,
            "employment_type": self.employment_type,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }