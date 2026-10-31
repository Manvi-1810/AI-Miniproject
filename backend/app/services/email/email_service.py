import os
import smtplib
import ssl

from email.message import EmailMessage


def send_skill_gap_report_email(
    recipient_email,
    candidate_name,
    job_title,
    match_score,
    pdf_bytes,
    pdf_filename
):
    """
    Send the personalized skill gap report
    as a PDF email attachment.
    """

    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "465"))

    if not smtp_email or not smtp_password:
        raise ValueError(
            "SMTP credentials are missing. "
            "Configure SMTP_EMAIL and SMTP_PASSWORD."
        )

    if not recipient_email:
        raise ValueError("Candidate email address is missing.")

    message = EmailMessage()

    message["Subject"] = (
        f"Your Skill Gap Analysis Report - {job_title}"
    )

    message["From"] = smtp_email
    message["To"] = recipient_email

    message.set_content(
        f"""
Hello {candidate_name},

Thank you for applying for the position of {job_title}.

After analyzing your resume against the job requirements,
your AI skill matching score is {match_score}%.

Unfortunately, you did not meet the required screening
threshold for this position.

We have attached your personalized Skill Gap Analysis
Report to this email.

The report contains:
- Your matched skills
- Skills that need improvement
- Recommended learning resources
- Suggestions to improve your job readiness

We encourage you to explore these learning resources
and continue developing your skills.

Best wishes,
TalentLens
AI-Powered Recruitment System
"""
    )

    message.add_attachment(
        pdf_bytes,
        maintype="application",
        subtype="pdf",
        filename=pdf_filename
    )

    context = ssl.create_default_context()

    with smtplib.SMTP_SSL(
        smtp_host,
        smtp_port,
        context=context
    ) as server:

        server.login(smtp_email, smtp_password)
        server.send_message(message)

    return True