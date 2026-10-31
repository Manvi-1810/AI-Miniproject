import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BrainCircuit,
  Target,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ExternalLink,
  RefreshCw,
  BriefcaseBusiness,
  FileText,
} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function AISkillMatchingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(
    location.state?.jobId ? String(location.state.jobId) : ""
  );

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");

  async function loadApplications() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/applications/my");
      const applicationList = response.data.applications || [];

      setApplications(applicationList);

      setSelectedJob((current) => {
        const requestedJob = location.state?.jobId;

        if (
          requestedJob &&
          applicationList.some(
            (item) => String(item.job_id) === String(requestedJob)
          )
        ) {
          return String(requestedJob);
        }

        if (
          current &&
          applicationList.some(
            (item) => String(item.job_id) === String(current)
          )
        ) {
          return current;
        }

        return applicationList.length
          ? String(applicationList[0].job_id)
          : "";
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your application information."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  const selectedApplication = applications.find(
    (application) =>
      String(application.job_id) === String(selectedJob)
  );

  const matchingResult = result?.matching_result;

  const score =
    matchingResult?.match_score ??
    selectedApplication?.match_score;

  const hasScore = score !== null && score !== undefined;

  const matchedSkills =
    matchingResult?.matched_skills ??
    selectedApplication?.matched_skills ??
    [];

  const missingSkills =
    matchingResult?.missing_skills ??
    selectedApplication?.missing_skills ??
    [];

  const recommendations =
    result?.skill_gap_recommendations ??
    selectedApplication?.skill_gap_recommendations ??
    [];

  const decision = (
    result?.screening?.decision ||
    selectedApplication?.status ||
    ""
  ).toLowerCase();

  const isQualified = ["qualified", "selected"].includes(decision);

  const isNotSelected = [
    "not_selected",
    "rejected",
  ].includes(decision);

  async function runMatching() {
    if (!selectedJob) {
      setError("Please select an applied job.");
      return;
    }

    setMatching(true);
    setError("");

    try {
      const response = await api.post(
        `/matching/jobs/${selectedJob}`
      );

      setResult(response.data);

      // Refresh saved application information.
      const updatedResponse = await api.get("/applications/my");

      setApplications(
        updatedResponse.data.applications || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "AI skill analysis could not be completed."
      );
    } finally {
      setMatching(false);
    }
  }

  function handleJobChange(event) {
    setSelectedJob(event.target.value);
    setResult(null);
    setError("");
  }

  return (
    <main className="matching-page">
      <div className="matching-container">

        {/* Navigation */}

        <button
          className="jobs-back-button"
          onClick={() => navigate("/candidate/dashboard")}
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        {/* Page heading */}

        <header className="matching-header">
          <div>
            <span className="matching-eyebrow">
              TALENTLENS INTELLIGENCE
            </span>

            <h1>AI Skill Matching</h1>

            <p>
              Understand how your skills match the requirements
              of a job and identify areas for improvement.
            </p>
          </div>

          <button
            className="matching-refresh-button"
            onClick={loadApplications}
            disabled={loading || matching}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </header>

        {error && (
          <div className="matching-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="matching-empty">
            Loading your skill analysis...
          </div>
        ) : applications.length === 0 ? (
          <section className="matching-empty">
            <BriefcaseBusiness size={32} />

            <h3>No applications found</h3>

            <p>
              Apply for a job before using AI Skill Matching.
            </p>

            <Link to="/candidate/jobs">
              Browse Available Jobs
            </Link>
          </section>
        ) : (
          <>
            {/* Job selection */}

            <section className="matching-selection-card">
              <div className="matching-section-heading">
                <h2>Select an Applied Job</h2>

                <p>
                  Choose a job to view its skill compatibility
                  analysis.
                </p>
              </div>

              <div className="matching-field">
                <label htmlFor="matching-job">
                  Applied Job
                </label>

                <select
                  id="matching-job"
                  value={selectedJob}
                  onChange={handleJobChange}
                >
                  {applications.map((application) => (
                    <option
                      key={application.id}
                      value={application.job_id}
                    >
                      {application.job?.title ||
                        `Job #${application.job_id}`}
                      {" - "}
                      {application.job?.company_name || "Company"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="matching-resume-display">
                <div className="matching-resume-file">
                  <FileText size={21} />

                  <div>
                    <strong>Latest uploaded resume</strong>

                    <span>
                      This resume is automatically used for
                      AI skill analysis.
                    </span>
                  </div>
                </div>

                <Link to="/candidate/resume">
                  Manage Resume
                </Link>
              </div>

              <button
                className="matching-run-button"
                onClick={runMatching}
                disabled={!selectedJob || matching}
              >
                <BrainCircuit size={18} />

                {matching
                  ? "Analyzing your skills..."
                  : "Run AI Skill Analysis"}
              </button>

              <p className="matching-threshold-note">
                Screening threshold: 85% compatibility.
              </p>
            </section>

            {/* Detailed analysis */}

            {selectedApplication && (
              <section className="matching-result-section">

                <div className="matching-section-heading">
                  <h2>Skill Compatibility Analysis</h2>

                  <p>
                    {selectedApplication.job?.title ||
                      "Selected Job"}
                    {" · "}
                    {selectedApplication.job?.company_name || ""}
                  </p>
                </div>

                {!hasScore ? (
                  <div className="matching-empty">
                    <Target size={30} />

                    <h3>Analysis not available yet</h3>

                    <p>
                      Run AI Skill Analysis to compare your
                      uploaded resume with this job's requirements.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Score */}

                    <div className="matching-score-card">
                      <div className="matching-score-information">
                        <span>Overall Skill Compatibility</span>

                        <strong>{score}%</strong>

                        <p>
                          Required screening threshold: 85%
                        </p>
                      </div>

                      <div className="matching-score-track">
                        <div
                          className="matching-score-fill"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, Number(score))
                            )}%`,
                          }}
                        />
                      </div>

                      <span
                        className={`matching-decision ${
                          isQualified
                            ? "decision-qualified"
                            : isNotSelected
                            ? "decision-not-selected"
                            : "decision-pending"
                        }`}
                      >
                        {isQualified
                          ? "Qualified for next round"
                          : isNotSelected
                          ? "Not selected"
                          : "Screening pending"}
                      </span>
                    </div>

                    {/* Skill comparison */}

                    <div className="matching-skills-grid">

                      <div className="matching-skills-card">
                        <div className="matching-card-heading">
                          <CheckCircle2 size={19} />
                          <h3>Matched Skills</h3>
                        </div>

                        {matchedSkills.length > 0 ? (
                          <div className="matching-skill-tags matched">
                            {matchedSkills.map((skill) => (
                              <span key={skill}>{skill}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="matching-no-skills">
                            No matched skills identified.
                          </p>
                        )}
                      </div>

                      <div className="matching-skills-card">
                        <div className="matching-card-heading">
                          <Target size={19} />
                          <h3>Skills to Improve</h3>
                        </div>

                        {missingSkills.length > 0 ? (
                          <div className="matching-skill-tags missing">
                            {missingSkills.map((skill) => (
                              <span key={skill}>{skill}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="matching-no-skills">
                            No missing skills identified.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Recommendations */}

                    {isNotSelected && (
                      <section className="matching-recommendations">
                        <div className="matching-section-heading">
                          <h2>Learning Recommendations</h2>

                          <p>
                            Resources to help improve the skills
                            identified in your analysis.
                          </p>
                        </div>

                        {recommendations.length > 0 ? (
                          <div className="matching-recommendation-grid">
                            {recommendations.map((item, index) => (
                              <article
                                className="matching-recommendation-card"
                                key={`${item.skill}-${index}`}
                              >
                                <div className="matching-recommendation-title">
                                  <BookOpen size={19} />
                                  <h3>{item.course_name}</h3>
                                </div>

                                <p>{item.description}</p>

                                <div className="matching-recommendation-meta">
                                  <span>Skill: {item.skill}</span>
                                  <span>Level: {item.level}</span>
                                </div>

                                <p className="matching-platform">
                                  Platform: {item.platform}
                                </p>

                                {item.url && (
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="matching-course-link"
                                  >
                                    Explore course
                                    <ExternalLink size={15} />
                                  </a>
                                )}
                              </article>
                            ))}
                          </div>
                        ) : (
                          <p className="matching-no-skills">
                            No learning recommendations are currently
                            available.
                          </p>
                        )}
                      </section>
                    )}

                    {/* Qualified result */}

                    {isQualified && (
                      <div className="matching-decision-message">
                        <CheckCircle2 size={19} />
                        You have met the screening threshold and
                        qualified for the next round.
                      </div>
                    )}

                    {/* Report and email information */}

                    {isNotSelected && (
                      <div className="matching-report-status">
                        {selectedApplication.skill_gap_report_path
                          ? "Your personalized skill-gap PDF report has been generated."
                          : "Your skill-gap report is not currently available."}
                      </div>
                    )}

                    {isNotSelected &&
                      selectedApplication.skill_gap_email_sent && (
                        <div className="matching-email-status">
                          Your skill-gap report has been emailed
                          to your registered email address.
                        </div>
                      )}
                  </>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}