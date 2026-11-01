
import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  FileText,
  BrainCircuit,
  ClipboardList,
  UserRound,
  Search,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function CandidateDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(false);

  const [overview, setOverview] = useState({
    availableJobs: null,
    applications: null,
    resumes: null,
  });

  let savedUser = {};

  try {
    savedUser = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    savedUser = {};
  }

  const candidateName = savedUser?.name || "Candidate";
  const firstName = candidateName.split(" ")[0];

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setDashboardError(false);

      const results = await Promise.allSettled([
        api.get("/jobs/"),
        api.get("/applications/my"),
        api.get("/resumes/my"),
      ]);

      const [jobsResult, applicationsResult, resumesResult] = results;

      setOverview({
        availableJobs:
          jobsResult.status === "fulfilled"
            ? jobsResult.value.data.jobs?.length ??
              jobsResult.value.data.count ??
              0
            : null,

        applications:
          applicationsResult.status === "fulfilled"
            ? applicationsResult.value.data.applications?.length ??
              applicationsResult.value.data.count ??
              0
            : null,

        resumes:
          resumesResult.status === "fulfilled"
            ? resumesResult.value.data.resumes?.length ??
              resumesResult.value.data.count ??
              0
            : null,
      });

      if (results.some((result) => result.status === "rejected")) {
        setDashboardError(true);
      }
    } catch (err) {
      console.error("Unable to load dashboard:", err);
      setDashboardError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  function renderCount(value) {
    if (loading) return "...";
    if (value === null) return "--";
    return value;
  }

  return (
    <>
      <section className="welcome-section">
        <div>
          <span className="welcome-kicker">
            <Sparkles size={15} />
            YOUR CAREER JOURNEY
          </span>

          <h1>Welcome back, {firstName}!</h1>

          <p>
            Discover opportunities, understand your skills,
            and move closer to your next career goal.
          </p>
        </div>

        <div className="welcome-decoration">
          <BrainCircuit size={65} />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-title-row">
          <div>
            <h2>Your overview</h2>
            <p>A quick look at your recruitment activity.</p>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            title="Refresh dashboard"
            style={{
              border: "none",
              background: "transparent",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              color: "inherit",
            }}
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {dashboardError && (
          <p
            style={{
              color: "#dc6b42",
              marginBottom: "14px",
            }}
          >
            Some dashboard information could not be loaded.
            Please check your backend server and refresh.
          </p>
        )}

        <div className="overview-grid">
          <article className="overview-card">
            <div className="overview-card-top">
              <span className="overview-icon blue">
                <BriefcaseBusiness size={21} />
              </span>
              <ArrowUpRight
                size={18}
                className="overview-arrow"
              />
            </div>

            <strong className="overview-number">
              {renderCount(overview.availableJobs)}
            </strong>

            <span className="overview-label">
              Available jobs
            </span>

            <small>Explore new opportunities</small>
          </article>

          <article className="overview-card">
            <div className="overview-card-top">
              <span className="overview-icon purple">
                <ClipboardList size={21} />
              </span>
              <ArrowUpRight
                size={18}
                className="overview-arrow"
              />
            </div>

            <strong className="overview-number">
              {renderCount(overview.applications)}
            </strong>

            <span className="overview-label">
              Applications
            </span>

            <small>Track your applications</small>
          </article>

          <article className="overview-card">
            <div className="overview-card-top">
              <span className="overview-icon green">
                <FileText size={21} />
              </span>
              <ArrowUpRight
                size={18}
                className="overview-arrow"
              />
            </div>

            <strong className="overview-number">
              {renderCount(overview.resumes)}
            </strong>

            <span className="overview-label">
              Resumes uploaded
            </span>

            <small>Manage your resume</small>
          </article>

          <article className="overview-card">
            <div className="overview-card-top">
              <span className="overview-icon orange">
                <BrainCircuit size={21} />
              </span>
              <TrendingUp
                size={18}
                className="overview-arrow"
              />
            </div>

            <strong className="overview-number">--</strong>

            <span className="overview-label">
              AI match score
            </span>

            <small>AI matching is coming next</small>
          </article>
        </div>
      </section>

      <section className="dashboard-lower-grid">
        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Quick actions</h2>
              <p>Continue building your career profile.</p>
            </div>
          </div>

          <div className="quick-action-list">
            <button
              className="quick-action"
              onClick={() => navigate("/candidate/resume")}
            >
              <span className="quick-action-icon">
                <FileText size={21} />
              </span>

              <span>
                <strong>Upload your resume</strong>
                <small>
                  Add your latest resume for AI analysis.
                </small>
              </span>

              <ArrowUpRight size={18} />
            </button>

            <button
              className="quick-action"
              onClick={() => navigate("/candidate/jobs")}
            >
              <span className="quick-action-icon">
                <Search size={21} />
              </span>

              <span>
                <strong>Explore opportunities</strong>
                <small>
                  Find jobs that match your interests.
                </small>
              </span>

              <ArrowUpRight size={18} />
            </button>

            <button
              className="quick-action"
              onClick={() => navigate("/candidate/matching")}
            >
              <span className="quick-action-icon">
                <BrainCircuit size={21} />
              </span>

              <span>
                <strong>Check your skill match</strong>
                <small>
                  Discover your strengths and skill gaps.
                </small>
              </span>

              <ArrowUpRight size={18} />
            </button>
          </div>
        </article>

        <article className="dashboard-panel profile-panel">
          <div className="panel-heading">
            <div>
              <h2>Profile summary</h2>
              <p>Your account information.</p>
            </div>

            <UserRound size={20} />
          </div>

          <div className="profile-avatar">
            {candidateName.charAt(0).toUpperCase()}
          </div>

          <h3>{candidateName}</h3>

          <p className="profile-email">
            {savedUser?.email || "No email available"}
          </p>

          <div className="profile-details">
            <div>
              <span>Account type</span>
              <strong>Candidate</strong>
            </div>

            <div>
              <span>Account status</span>
              <strong className="active-status">Active</strong>
            </div>
          </div>
        </article>
      </section>

      <footer className="dashboard-footer">
        <span>TalentLens · IS026 Mini Project</span>
        <span>
          AI-powered recruitment with transparency.
        </span>
      </footer>
    </>
  );
}
