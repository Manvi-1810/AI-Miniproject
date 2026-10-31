# Learning recommendations for missing skills.
# These are curated learning resources, not automatic course enrolments.

COURSE_RECOMMENDATIONS = {
    "python": {
        "course_name": "Python for Beginners",
        "platform": "freeCodeCamp",
        "level": "Beginner",
        "description": "Learn Python syntax, variables, functions, loops and object-oriented programming.",
        "url": "https://www.freecodecamp.org/learn/scientific-computing-with-python/"
    },
    "java": {
        "course_name": "Java Programming",
        "platform": "Oracle",
        "level": "Beginner",
        "description": "Learn Java fundamentals, object-oriented programming and application development.",
        "url": "https://dev.java/learn/"
    },
    "javascript": {
        "course_name": "JavaScript Guide",
        "platform": "MDN Web Docs",
        "level": "Beginner",
        "description": "Learn JavaScript fundamentals, functions, objects and browser programming.",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"
    },
    "react": {
        "course_name": "React Fundamentals",
        "platform": "React Official Documentation",
        "level": "Beginner",
        "description": "Learn components, props, state, hooks and building React applications.",
        "url": "https://react.dev/learn"
    },
    "node.js": {
        "course_name": "Node.js Learning Resources",
        "platform": "Node.js Official Documentation",
        "level": "Beginner",
        "description": "Understand server-side JavaScript, modules and backend development.",
        "url": "https://nodejs.org/en/learn"
    },
    "flask": {
        "course_name": "Flask Web Development",
        "platform": "Flask Official Documentation",
        "level": "Beginner",
        "description": "Learn routing, templates, request handling and building web applications.",
        "url": "https://flask.palletsprojects.com/en/stable/tutorial/"
    },
    "django": {
        "course_name": "Django Getting Started",
        "platform": "Django Official Documentation",
        "level": "Beginner",
        "description": "Learn how to build web applications using the Django framework.",
        "url": "https://docs.djangoproject.com/en/stable/intro/tutorial01/"
    },
    "mysql": {
        "course_name": "MySQL Tutorial",
        "platform": "MySQL Official Documentation",
        "level": "Beginner",
        "description": "Learn SQL queries, database creation, tables and data management.",
        "url": "https://dev.mysql.com/doc/mysql-tutorial-excerpt/8.0/en/"
    },
    "sql": {
        "course_name": "SQL Tutorial",
        "platform": "W3Schools",
        "level": "Beginner",
        "description": "Practise SQL queries, filtering, joins and database operations.",
        "url": "https://www.w3schools.com/sql/"
    },
    "mongodb": {
        "course_name": "MongoDB Learning Resources",
        "platform": "MongoDB University",
        "level": "Beginner",
        "description": "Learn document databases, collections, queries and data modelling.",
        "url": "https://learn.mongodb.com/"
    },
    "rest api": {
        "course_name": "REST API Fundamentals",
        "platform": "Postman Learning Center",
        "level": "Beginner",
        "description": "Learn HTTP methods, endpoints, API requests, responses and testing.",
        "url": "https://learning.postman.com/"
    },
    "html": {
        "course_name": "HTML Fundamentals",
        "platform": "MDN Web Docs",
        "level": "Beginner",
        "description": "Learn webpage structure, semantic HTML and forms.",
        "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content"
    },
    "css": {
        "course_name": "CSS Fundamentals",
        "platform": "MDN Web Docs",
        "level": "Beginner",
        "description": "Learn styling, layouts, responsive design and CSS properties.",
        "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics"
    },
    "git": {
        "course_name": "Git Version Control",
        "platform": "Git Official Documentation",
        "level": "Beginner",
        "description": "Learn commits, branches, merging and version control.",
        "url": "https://git-scm.com/doc"
    },
    "machine learning": {
        "course_name": "Machine Learning Crash Course",
        "platform": "Google",
        "level": "Beginner",
        "description": "Learn machine learning concepts, model training and evaluation.",
        "url": "https://developers.google.com/machine-learning/crash-course"
    },
    "artificial intelligence": {
        "course_name": "AI Learning Resources",
        "platform": "Microsoft Learn",
        "level": "Beginner",
        "description": "Explore AI fundamentals and practical artificial intelligence concepts.",
        "url": "https://learn.microsoft.com/en-us/training/ai/"
    },
    "communication": {
        "course_name": "Communication Skills",
        "platform": "Coursera",
        "level": "Beginner",
        "description": "Improve professional communication and workplace interaction.",
        "url": "https://www.coursera.org/search?query=communication%20skills"
    },
    "docker": {
        "course_name": "Docker Getting Started",
        "platform": "Docker Official Documentation",
        "level": "Beginner",
        "description": "Learn containers, images and application deployment.",
        "url": "https://docs.docker.com/get-started/"
    },
    "aws": {
        "course_name": "AWS Cloud Practitioner Learning Plan",
        "platform": "AWS Skill Builder",
        "level": "Beginner",
        "description": "Learn cloud computing fundamentals and core AWS services.",
        "url": "https://skillbuilder.aws/"
    }
}


def generate_skill_recommendations(missing_skills):
    """
    Generate learning recommendations for missing skills.
    """

    recommendations = []

    if not isinstance(missing_skills, list):
        return recommendations

    for skill in missing_skills:

        if not isinstance(skill, str):
            continue

        normalized_skill = skill.strip().lower()

        if not normalized_skill:
            continue

        recommendation = COURSE_RECOMMENDATIONS.get(
            normalized_skill
        )

        if recommendation:
            recommendations.append({
                "skill": skill,
                **recommendation
            })
        else:
            recommendations.append({
                "skill": skill,
                "course_name": f"Learn {skill}",
                "platform": "Learning resource search",
                "level": "Beginner",
                "description": (
                    f"Explore beginner learning resources "
                    f"and practical projects to improve {skill}."
                ),
                "url": (
                    "https://www.google.com/search?q="
                    + skill.replace(" ", "+")
                    + "+free+course"
                )
            })

    return recommendations