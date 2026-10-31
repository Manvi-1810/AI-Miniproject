import re


def normalize_skill(skill):
    """
    Normalize skill names to make comparison consistent.
    Example: ' REST API ' becomes 'rest api'.
    """
    if not isinstance(skill, str):
        return ""

    skill = skill.strip().lower()
    skill = re.sub(r"\s+", " ", skill)

    return skill


def compare_skills(candidate_skills, required_skills):
    """
    Compare candidate skills with job requirements.

    Returns:
        match_score: Matching percentage
        matched_skills: Skills found in both lists
        missing_skills: Required skills not found in resume
    """

    if not isinstance(candidate_skills, list):
        candidate_skills = []

    if not isinstance(required_skills, list):
        required_skills = []

    candidate_map = {
        normalize_skill(skill): skill.strip()
        for skill in candidate_skills
        if isinstance(skill, str) and normalize_skill(skill)
    }

    required_map = {
        normalize_skill(skill): skill.strip()
        for skill in required_skills
        if isinstance(skill, str) and normalize_skill(skill)
    }

    if not required_map:
        return {
            "match_score": 0.0,
            "matched_skills": [],
            "missing_skills": [],
            "message": "This job has no required skills configured."
        }

    matched_skills = []
    missing_skills = []

    for normalized_skill, original_skill in required_map.items():

        if normalized_skill in candidate_map:
            matched_skills.append(original_skill)
        else:
            missing_skills.append(original_skill)

    match_score = round(
        (len(matched_skills) / len(required_map)) * 100,
        2
    )

    return {
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "total_required_skills": len(required_map),
        "total_matched_skills": len(matched_skills),
        "message": "Skill comparison completed successfully."
    }