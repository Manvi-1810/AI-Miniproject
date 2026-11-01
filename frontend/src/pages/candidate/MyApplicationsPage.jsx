
import { useEffect, useState } from "react";
import {
  BrainCircuit,
  BriefcaseBusiness,
  MapPin,
  CalendarDays,
  Clock3,
  Building2,
  FileText,
  RefreshCw,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  XCircle,
  GraduationCap,
  Mail,
  ExternalLink,
  BookOpen,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function MyApplicationsPage() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchApplications() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/applications/my");
      setApplications(response.data.applications || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your applications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications();
  }, []);

  function formatDate(dateValue) {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatStatus(status) {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function getStatusClass(status) {
    const normalized = (status || "").toLowerCase();

    if (["submitted", "under_review"].includes(normalized)) {
      return "submitted";
    }

    if (["qualified", "selected"].includes(normalized)) {
      return "qualified";
    }

    if (["not_selected", "rejected"].includes(normalized)) {
      return "not-selected";
    }

    return "default";
  }

  const qualifiedCount = applications.filter((app) =>
    ["qualified", "selected"].includes(
      (app.status || "").toLowerCase()
    )
  ).length;

  const notSelectedCount = applications.filter((app) =>
    ["not_selected", "rejected"].includes(
      (app.status || "").toLowerCase()
    )
  ).length;

  const pendingCount = applications.filter((app) =>
    ["submitted", "under_review"].includes(
      (app.status || "").toLowerCase()
    )
  ).length;

  return (
    <div className="my-applications-page shared-applications-page">
      <main className="applications-content">
        <section className="applications-hero">
          <span className="jobs-eyebrow">
            <ClipboardList size={16} />
            APPLICATION TRACKER
          </span>

          <h1>My Applications</h1>

          <p>
            Track your job applications, review AI screening
            decisions, and explore recommendations to improve
            your career readiness.
          </p>
        </section>

        {/* Application summary */}
        <section className="applications-summary">
          <div className="application-summary-card">
            <span className="application-summary-icon">
              <BriefcaseBusiness size={22} />
            </span>

            <div>
              <span>Total Applications</span>
              <strong>{loading ? "—" : applications.length}</strong>
            </div>
          </div>

          <div className="application-summary-card">
            <span className="application-summary-icon">
              <Clock3 size={22} />
            </span>

            <div>
              <span>Pending Screening</span>
              <strong>{loading ? "—" : pendingCount}</strong>
            </div>
          </div>

          <div className="application-summary-card">
            <span className="application-summary-icon">
              <CheckCircle2 size={22} />
            </span>

            <div>
              <span>Qualified</span>
              <strong>{loading ? "—" : qualifiedCount}</strong>
            </div>
          </div>

          <div className="application-summary-card">
            <span className="application-summary-icon">
              <XCircle size={22} />
            </span>

            <div>
              <span>Not Selected</span>
              <strong>{loading ? "—" : notSelectedCount}</strong>
            </div>
          </div>
        </section>

        {/* Applied jobs */}
        <section className="applications-list-section">
          <div className="applications-section-heading">
            <div>
              <span className="jobs-section-kicker">
                YOUR ACTIVITY
              </span>

              <h2>Applied Jobs</h2>

              <p>
                {loading
                  ? "Loading your applications..."
                  : `${applications.length} application${
                      applications.length === 1 ? "" : "s"
                    } found`}
              </p>
            </div>

            <button
              className="jobs-clear-button"
              onClick={fetchApplications}
              disabled={loading}
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          {loading && (
            <div className="applications-state-card">
              <RefreshCw
                size={28}
                className="jobs-loading-icon"
              />
              <h3>Loading applications</h3>
              <p>Fetching your application records...</p>
            </div>
          )}

          {!loading && error && (
            <div className="applications-state-card applications-error">
              <AlertCircle size={32} />
              <h3>Unable to load applications</h3>
              <p>{error}</p>

              <button
                className="jobs-search-button"
                onClick={fetchApplications}
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && applications.length === 0 && (
            <div className="applications-state-card">
              <FileText size={38} />
              <h3>No applications yet</h3>

              <p>
                You haven't applied for any jobs yet. Explore
                available opportunities and apply for a job
                that matches your interests.
              </p>

              <button
                className="jobs-search-button"
                onClick={() => navigate("/candidate/jobs")}
              >
                <BriefcaseBusiness size={17} />
                Find Jobs
              </button>
            </div>
          )}

          {!loading && !error && applications.length > 0 && (
            <div className="applications-list">
              {applications.map((application) => {
                const job = application.job;

                const status = (
                  application.status || ""
                ).toLowerCase();

                const isQualified = [
                  "qualified",
                  "selected",
                ].includes(status);

                const isNotSelected = [
                  "not_selected",
                  "rejected",
                ].includes(status);

                const isPending = [
                  "submitted",
                  "under_review",
                ].includes(status);

                const matchedSkills =
                  application.matched_skills || [];

                const missingSkills =
                  application.missing_skills || [];

                const recommendations =
                  application.skill_gap_recommendations || [];

                const hasScore =
                  application.match_score !== null &&
                  application.match_score !== undefined;

                return (
                  <article
                    className="application-card"
                    key={application.id}
                  >
                    {/* Job heading */}
                    <div className="application-card-header">
                      <div className="application-company-icon">
                        <Building2 size={24} />
                      </div>

                      <span
                        className={`application-status ${getStatusClass(
                          status
                        )}`}
                      >
                        {formatStatus(status)}
                      </span>
                    </div>

                    <h3>
                      {job?.title || "Job details unavailable"}
                    </h3>

                    <p className="application-company-name">
                      {job?.company_name || "Company unavailable"}
                    </p>

                    <div className="application-meta">
                      <span>
                        <MapPin size={16} />
                        {job?.location || "Location not specified"}
                      </span>

                      <span>
                        <BriefcaseBusiness size={16} />
                        {job?.employment_type || "Not specified"}
                      </span>
                    </div>

                    <div className="application-divider" />

                    {/* Application details */}
                    <div className="application-details-grid">
                      <div>
                        <span>
                          <CalendarDays size={16} />
                          Applied on
                        </span>

                        <strong>
                          {formatDate(application.applied_at)}
                        </strong>
                      </div>

                      <div>
                        <span>
                          <BrainCircuit size={16} />
                          AI Match Score
                        </span>

                        <strong>
                          {hasScore
                            ? `${application.match_score}%`
                            : "Pending"}
                        </strong>
                      </div>
                    </div>

                    {/* Compatibility progress */}
                    {hasScore && (
                      <div className="application-match-progress">
                        <div className="application-match-progress-label">
                          <span>Skill compatibility</span>
                          <strong>
                            {application.match_score}%
                          </strong>
                        </div>

                        <div className="application-match-track">
                          <div
                            className="application-match-fill"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  Number(application.match_score)
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* AI screening decision */}
                    <div
                      className={`application-screening-result ${
                        isQualified
                          ? "screening-qualified"
                          : isNotSelected
                          ? "screening-not-selected"
                          : "screening-pending"
                      }`}
                    >
                      {isQualified ? (
                        <CheckCircle2 size={21} />
                      ) : isNotSelected ? (
                        <XCircle size={21} />
                      ) : (
                        <Clock3 size={21} />
                      )}

                      <div>
                        <strong>
                          {isQualified
                            ? "Qualified for the next round"
                            : isNotSelected
                            ? "Not selected for this position"
                            : "AI screening pending"}
                        </strong>

                        <p>
                          {isQualified
                            ? "Congratulations! You have met the AI screening threshold."
                            : isNotSelected
                            ? "Your current skill match is below the required screening threshold. Review your learning recommendations."
                            : "Your application is awaiting AI screening."}
                        </p>
                      </div>
                    </div>

                    {/* Required skills */}
                    {Array.isArray(job?.required_skills) &&
                      job.required_skills.length > 0 && (
                        <div className="application-required-skills">
                          <strong>Required Skills</strong>

                          <div className="job-skills">
                            {job.required_skills.map(
                              (skill, index) => (
                                <span key={`${skill}-${index}`}>
                                  {skill}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Matched skills */}
                    {matchedSkills.length > 0 && (
                      <div className="application-skill-section">
                        <strong className="application-skill-heading">
                          <CheckCircle2 size={17} />
                          Matched Skills
                        </strong>

                        <div className="application-skill-tags matched-tags">
                          {matchedSkills.map((skill, index) => (
                            <span key={`${skill}-${index}`}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing skills */}
                    {missingSkills.length > 0 && (
                      <div className="application-skill-section">
                        <strong className="application-skill-heading">
                          <AlertCircle size={17} />
                          Skills to Improve
                        </strong>

                        <div className="application-skill-tags missing-tags">
                          {missingSkills.map((skill, index) => (
                            <span key={`${skill}-${index}`}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skill gap report */}
                    {isNotSelected && (
                      <div className="skill-gap-panel">
                        <div className="skill-gap-panel-heading">
                          <span className="skill-gap-icon">
                            <GraduationCap size={23} />
                          </span>

                          <div>
                            <h4>Your Skill Gap Report</h4>
                            <p>
                              Learning resources to help strengthen
                              your missing skills.
                            </p>
                          </div>
                        </div>

                        {application.skill_gap_report_path && (
                          <p className="skill-gap-report-generated">
                            <FileText size={16} />
                            Your personalized skill-gap PDF report
                            has been generated.
                          </p>
                        )}

                        {recommendations.length > 0 ? (
                          <div className="skill-recommendation-list">
                            {recommendations.map(
                              (recommendation, index) => (
                                <div
                                  className="skill-recommendation-card"
                                  key={`${recommendation.skill}-${index}`}
                                >
                                  <div className="recommendation-title-row">
                                    <BookOpen size={19} />
                                    <strong>
                                      {recommendation.course_name}
                                    </strong>
                                  </div>

                                  <p>
                                    {recommendation.description}
                                  </p>

                                  <div className="recommendation-meta">
                                    <span>
                                      Skill: {recommendation.skill}
                                    </span>

                                    <span>
                                      Level: {recommendation.level}
                                    </span>
                                  </div>

                                  <div className="recommendation-platform">
                                    Platform: {recommendation.platform}
                                  </div>

                                  {recommendation.url && (
                                    <a
                                      href={recommendation.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="recommendation-link"
                                    >
                                      Explore course
                                      <ExternalLink size={15} />
                                    </a>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="recommendation-empty">
                            Learning recommendations will appear
                            here when available.
                          </p>
                        )}

                        {/* Email confirmation */}
                        {application.skill_gap_email_sent && (
                          <div className="application-email-confirmation">
                            <CheckCircle2 size={17} />
                            <span>
                              Your personalized skill-gap report
                              has been emailed to your registered
                              email address.
                            </span>
                          </div>
                        )}

                        {!application.skill_gap_email_sent && (
                          <div className="skill-gap-email-pending">
                            <Mail size={17} />
                            Email delivery has not yet been confirmed.
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="jobs-page-footer">
          <span>TalentLens · IS026 Mini Project</span>
          <span>AI-powered recruitment with transparency.</span>
        </footer>
      </main>
    </div>
  );
}
