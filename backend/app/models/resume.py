from datetime import datetime

from app.extensions import db


class Resume(db.Model):
    __tablename__ = "resumes"

    id = db.Column(db.Integer, primary_key=True)

    candidate_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    file_name = db.Column(db.String(255), nullable=False)

    file_path = db.Column(db.String(500), nullable=False)

    file_type = db.Column(db.String(20), nullable=False)

    extracted_text = db.Column(db.Text, nullable=True)

    extracted_skills = db.Column(db.JSON, nullable=True)

    education = db.Column(db.JSON, nullable=True)

    experience = db.Column(db.JSON, nullable=True)

    uploaded_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    candidate = db.relationship(
        "User",
        backref=db.backref("resumes", lazy=True),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "candidate_id": self.candidate_id,
            "file_name": self.file_name,
            "file_type": self.file_type,
            "extracted_skills": self.extracted_skills,
            "education": self.education,
            "experience": self.experience,
            "uploaded_at": self.uploaded_at.isoformat(),
        }