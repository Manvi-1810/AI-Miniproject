from pathlib import Path

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User, Job, Resume, Application

from app.services.matching.matching_service import compare_skills

from app.services.skill_gap.recommendation_service import (
    generate_skill_recommendations
)

from app.services.skill_gap.report_generator import (
    generate_skill_gap_pdf
)

from app.services.email.email_service import (
    send_skill_gap_report_email
)


matching_bp = Blueprint("matching", __name__)

# Temporary testing threshold.
# Restore to 75.0 after testing.
SCREENING_THRESHOLD = 85.0


@matching_bp.post("/jobs/<int:job_id>")
@jwt_required()
def match_candidate_with_job(job_id):

    try:
        # 1. Identify logged-in candidate
        user_id = get_jwt_identity()
        user = db.session.get(User, user_id)

        if not user:
            return jsonify({
                "status": "error",
                "message": "User not found."
            }), 404

        if user.role != "candidate":
            return jsonify({
                "status": "error",
                "message": "Only candidates can use skill matching."
            }), 403

        # 2. Retrieve job
        job = db.session.get(Job, job_id)

        if not job or job.status != "active":
            return jsonify({
                "status": "error",
                "message": "Job not found or inactive."
            }), 404

        # 3. Check whether candidate applied
        application = Application.query.filter_by(
            candidate_id=user.id,
            job_id=job.id
        ).first()

        if not application:
            return jsonify({
                "status": "error",
                "message": "Please apply for this job before screening."
            }), 400

        # 4. Retrieve latest resume
        resume = (
            Resume.query
            .filter_by(candidate_id=user.id)
            .order_by(Resume.uploaded_at.desc())
            .first()
        )

        if not resume:
            return jsonify({
                "status": "error",
                "message": "Please upload a resume before screening."
            }), 400

        # 5. Extract candidate and job skills
        candidate_skills = resume.extracted_skills or []
        required_skills = job.required_skills or []

        # 6. Calculate matching score
        result = compare_skills(
            candidate_skills,
            required_skills
        )

        match_score = result["match_score"]

        recommendations = []

        # 7. Automatic AI screening decision
        if match_score >= SCREENING_THRESHOLD:

            application.status = "qualified"
            screening_status = "qualified"

            decision_message = (
                "Congratulations! You have qualified "
                "for the next selection round."
            )

        else:

            application.status = "not_selected"
            screening_status = "not_selected"

            decision_message = (
                "You have not met the screening threshold. "
                "Learning recommendations have been generated."
            )

            # 8. Generate course recommendations
            recommendations = generate_skill_recommendations(
                result["missing_skills"]
            )

        # 9. Save matching results
        application.match_score = match_score
        application.matched_skills = result["matched_skills"]
        application.missing_skills = result["missing_skills"]

        db.session.commit()

        # 10. Initialize report and email response
        skill_gap_report = None

        email_status = {
            "sent": False,
            "message": "Email not required."
        }

        # 11. Generate report only for candidates below threshold
        if screening_status == "not_selected":

            # Check whether email was already sent
            if application.skill_gap_email_sent:

                skill_gap_report = {
                    "generated": bool(
                        application.skill_gap_report_path
                    ),
                    "file_name": (
                        Path(application.skill_gap_report_path).name
                        if application.skill_gap_report_path
                        else None
                    )
                }

                email_status = {
                    "sent": True,
                    "message": (
                        "Report email was already sent. "
                        "Duplicate email prevented."
                    )
                }

            else:

                try:
                    # 12. Generate personalized PDF
                    report_buffer = generate_skill_gap_pdf(
                        candidate_name=user.name,
                        candidate_email=user.email,
                        job_title=job.title,
                        company_name=job.company_name,
                        match_score=match_score,
                        matched_skills=result["matched_skills"],
                        missing_skills=result["missing_skills"],
                        recommendations=recommendations
                    )

                    pdf_bytes = report_buffer.getvalue()

                    # 13. Create report storage folder
                    backend_folder = (
                        Path(__file__).resolve().parents[2]
                    )

                    report_folder = (
                        backend_folder
                        / "uploads"
                        / "skill_gap_reports"
                    )

                    report_folder.mkdir(
                        parents=True,
                        exist_ok=True
                    )

                    report_filename = (
                        f"skill_gap_application_{application.id}.pdf"
                    )

                    report_path = (
                        report_folder / report_filename
                    )

                    # 14. Save PDF
                    with open(report_path, "wb") as pdf_file:
                        pdf_file.write(pdf_bytes)

                    # Save report location
                    application.skill_gap_report_path = str(
                        report_path
                    )

                    db.session.commit()

                    skill_gap_report = {
                        "generated": True,
                        "file_name": report_filename
                    }

                    # 15. Send email with PDF attachment
                    try:
                        send_skill_gap_report_email(
                            recipient_email=user.email,
                            candidate_name=user.name,
                            job_title=job.title,
                            match_score=match_score,
                            pdf_bytes=pdf_bytes,
                            pdf_filename=report_filename
                        )

                        # Record successful email delivery
                        application.skill_gap_email_sent = True
                        application.skill_gap_report_path = str(
                            report_path
                        )

                        db.session.commit()

                        email_status = {
                            "sent": True,
                            "recipient": user.email,
                            "message": (
                                "Skill gap report emailed successfully."
                            )
                        }

                    except Exception as email_error:

                        db.session.rollback()

                        print(
                            "Skill gap email error:",
                            email_error
                        )

                        email_status = {
                            "sent": False,
                            "message": (
                                "PDF generated, but email delivery failed."
                            )
                        }

                except Exception as report_error:

                    db.session.rollback()

                    print(
                        "Skill gap report generation error:",
                        report_error
                    )

                    skill_gap_report = {
                        "generated": False,
                        "message": "PDF report generation failed."
                    }

                    email_status = {
                        "sent": False,
                        "message": (
                            "Email not sent because PDF generation failed."
                        )
                    }

        # 16. Return complete screening response
        return jsonify({

            "status": "success",

            "message": "AI screening completed successfully.",

            "job": {
                "id": job.id,
                "title": job.title,
                "company_name": job.company_name
            },

            "resume": {
                "id": resume.id,
                "file_name": resume.file_name
            },

            "matching_result": result,

            "screening": {
                "threshold": SCREENING_THRESHOLD,
                "match_score": match_score,
                "decision": screening_status,
                "decision_message": decision_message
            },

            "skill_gap_recommendations": recommendations,

            "skill_gap_report": skill_gap_report,

            "email_delivery": email_status

        }), 200

    except Exception as error:

        db.session.rollback()

        print("AI screening error:", error)

        return jsonify({
            "status": "error",
            "message": "An error occurred during AI screening."
        }), 500