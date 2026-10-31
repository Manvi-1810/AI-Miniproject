from io import BytesIO
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle
)
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether
)


def generate_skill_gap_pdf(
    candidate_name,
    candidate_email,
    job_title,
    company_name,
    match_score,
    matched_skills,
    missing_skills,
    recommendations
):
    """
    Generate a personalized Skill Gap Analysis PDF.

    Returns:
        BytesIO object containing the generated PDF.
    """

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=28,
        textColor=colors.HexColor("#243B64"),
        alignment=TA_CENTER,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=10,
        leading=15,
        textColor=colors.HexColor("#64748B"),
        alignment=TA_CENTER
    )

    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=18,
        textColor=colors.HexColor("#243B64"),
        spaceBefore=12,
        spaceAfter=7
    )

    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["BodyText"],
        fontSize=9.5,
        leading=15,
        textColor=colors.HexColor("#334155"),
        spaceAfter=5
    )

    small_style = ParagraphStyle(
        "SmallText",
        parent=body_style,
        fontSize=8,
        leading=11
    )

    link_style = ParagraphStyle(
        "CourseLink",
        parent=body_style,
        textColor=colors.HexColor("#2563EB")
    )

    story = []

    # Report heading
    story.append(
        Paragraph("TALENTLENS", title_style)
    )

    story.append(
        Paragraph(
            "PERSONALIZED SKILL GAP ANALYSIS REPORT",
            subtitle_style
        )
    )

    story.append(Spacer(1, 8 * mm))

    story.append(
        HRFlowable(
            width="100%",
            thickness=1,
            color=colors.HexColor("#DCE4EF")
        )
    )

    # Candidate information
    story.append(
        Paragraph("Candidate Information", heading_style)
    )

    candidate_data = [
        [
            Paragraph("<b>Candidate Name</b>", body_style),
            Paragraph(escape(str(candidate_name)), body_style)
        ],
        [
            Paragraph("<b>Email Address</b>", body_style),
            Paragraph(escape(str(candidate_email)), body_style)
        ],
        [
            Paragraph("<b>Applied Job</b>", body_style),
            Paragraph(escape(str(job_title)), body_style)
        ],
        [
            Paragraph("<b>Company</b>", body_style),
            Paragraph(escape(str(company_name)), body_style)
        ]
    ]

    candidate_table = Table(
        candidate_data,
        colWidths=[48 * mm, 115 * mm]
    )

    candidate_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (0, -1),
             colors.HexColor("#F1F5F9")),
            ("GRID", (0, 0), (-1, -1), 0.5,
             colors.HexColor("#E2E8F0")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 9),
            ("RIGHTPADDING", (0, 0), (-1, -1), 9),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8)
        ])
    )

    story.append(candidate_table)

    # Match score
    story.append(
        Paragraph("AI Matching Analysis", heading_style)
    )

    score_color = (
        "#DC2626" if float(match_score) < 75 else "#16A34A"
    )

    score_text = (
        f'<font color="{score_color}">'
        f'<b>{float(match_score):.2f}%</b>'
        f'</font>'
    )

    story.append(
        Paragraph(
            f"Your job skill matching score: {score_text}",
            body_style
        )
    )

    story.append(
        Paragraph(
            "The score represents the proportion of required job "
            "skills identified in your uploaded resume. It is not "
            "a complete assessment of your professional suitability.",
            small_style
        )
    )

    # Matched skills
    story.append(
        Paragraph("Skills You Already Have", heading_style)
    )

    if matched_skills:
        for skill in matched_skills:
            story.append(
                Paragraph(
                    f"&bull; {escape(str(skill))}",
                    body_style
                )
            )
    else:
        story.append(
            Paragraph("No required skills were matched.", body_style)
        )

    # Missing skills
    story.append(
        Paragraph("Skills to Improve", heading_style)
    )

    if missing_skills:
        for skill in missing_skills:
            story.append(
                Paragraph(
                    f"&bull; {escape(str(skill))}",
                    body_style
                )
            )
    else:
        story.append(
            Paragraph("No missing required skills.", body_style)
        )

    # Learning recommendations
    story.append(
        Paragraph(
            "Personalized Learning Recommendations",
            heading_style
        )
    )

    if recommendations:
        for index, recommendation in enumerate(
            recommendations, start=1
        ):
            skill = escape(str(recommendation.get("skill", "")))
            course = escape(
                str(recommendation.get("course_name", ""))
            )
            platform = escape(
                str(recommendation.get("platform", ""))
            )
            level = escape(
                str(recommendation.get("level", ""))
            )
            description = escape(
                str(recommendation.get("description", ""))
            )
            url = str(recommendation.get("url", ""))

            course_content = [
                Paragraph(
                    f"<b>{index}. Improve {skill}</b>",
                    body_style
                ),
                Paragraph(
                    f"<b>Recommended resource:</b> {course}",
                    body_style
                ),
                Paragraph(
                    f"<b>Platform:</b> {platform} | "
                    f"<b>Level:</b> {level}",
                    body_style
                ),
                Paragraph(description, body_style)
            ]

            if (
                url.startswith("https://")
                or url.startswith("http://")
            ):
                safe_url = escape(url, {'"': "&quot;"})

                course_content.append(
                    Paragraph(
                        f'<link href="{safe_url}" '
                        f'color="#2563EB">'
                        f'Open learning resource</link>',
                        link_style
                    )
                )

            story.append(
                KeepTogether(course_content)
            )

            story.append(Spacer(1, 3 * mm))

    else:
        story.append(
            Paragraph(
                "No additional learning recommendations are available.",
                body_style
            )
        )

    # Improvement plan
    story.append(
        Paragraph("Suggested Improvement Plan", heading_style)
    )

    improvement_steps = [
        "Start learning the missing skills using the recommended resources.",
        "Practise the concepts through hands-on exercises.",
        "Build practical projects related to the job requirements.",
        "Update your resume after gaining the relevant skills."
    ]

    for index, step in enumerate(improvement_steps, start=1):
        story.append(
            Paragraph(
                f"{index}. {escape(step)}",
                body_style
            )
        )

    # Disclaimer
    story.append(Spacer(1, 8 * mm))

    story.append(
        HRFlowable(
            width="100%",
            thickness=0.7,
            color=colors.HexColor("#DCE4EF")
        )
    )

    story.append(Spacer(1, 3 * mm))

    story.append(
        Paragraph(
            "<b>Important Note:</b> This report is generated "
            "automatically from the skills identified in your "
            "resume and the requirements of the selected job. "
            "Learning recommendations are provided to help you "
            "improve your job-related knowledge. Completing a "
            "course does not guarantee selection.",
            small_style
        )
    )

    story.append(Spacer(1, 5 * mm))

    story.append(
        Paragraph(
            "TalentLens | AI-Powered Recruitment System",
            subtitle_style
        )
    )

    document.build(story)

    buffer.seek(0)

    return buffer