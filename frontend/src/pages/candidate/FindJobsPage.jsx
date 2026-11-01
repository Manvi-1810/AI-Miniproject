
import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  BriefcaseBusiness,
  Clock3,
  GraduationCap,
  BrainCircuit,
  X,
  RefreshCw,
  Building2,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

export default function FindJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [applicationError, setApplicationError] = useState("");

  async function fetchJobs(searchValue = search, locationValue = location) {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/jobs/", {
        params: {
          search: searchValue.trim(),
          location: locationValue.trim(),
        },
      });

      setJobs(response.data.jobs || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load jobs. Please check whether the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs("", "");
  }, []);

  function handleSearch(event) {
    event.preventDefault();
    fetchJobs(search, location);
  }

  function clearFilters() {
    setSearch("");
    setLocation("");
    fetchJobs("", "");
  }

  function formatExperience(job) {
    const minimum = Number(job.min_experience || 0);
    const maximum = job.max_experience;

    if (maximum === null || maximum === undefined) {
      return `${minimum} year${minimum === 1 ? "" : "s"}+`;
    }

    return `${minimum}–${Number(maximum)} years`;
  }

  function formatDate(dateValue) {
    if (!dateValue) return "Recently posted";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Recently posted";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  async function handleApply(job) {
    try {
      setApplying(true);
      setApplicationMessage("");
      setApplicationError("");

      const response = await api.post("/applications/", {
        job_id: job.id,
      });

      setApplicationMessage(
        response.data.message || "Application submitted successfully!"
      );
    } catch (err) {
      if (err.response?.status === 409) {
        setApplicationError(
          "You have already applied for this job."
        );
      } else {
        setApplicationError(
          err.response?.data?.message ||
            "Unable to submit your application. Please try again."
        );
      }
    } finally {
      setApplying(false);
    }
  }

  function closeJobDetails() {
    setSelectedJob(null);
    setApplicationMessage("");
    setApplicationError("");
  }

  return (
    <div className="find-jobs-page shared-jobs-page">
      <main className="jobs-page-content">
        <section className="jobs-hero">
          <span className="jobs-eyebrow">
            <BriefcaseBusiness size={15} />
            CAREER OPPORTUNITIES
          </span>

          <h1>Find your next opportunity.</h1>

          <p>
            Explore available jobs and discover opportunities
            that match your skills, qualifications and career goals.
          </p>
        </section>

        <section className="jobs-search-section">
          <form className="jobs-search-form" onSubmit={handleSearch}>
            <div className="jobs-search-field">
              <Search size={19} />
              <input
                type="text"
                placeholder="Job title, company or keyword"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="jobs-search-field">
              <MapPin size={19} />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </div>

            <button type="submit" className="jobs-search-button">
              <Search size={17} />
              Search jobs
            </button>
          </form>
        </section>

        <section className="jobs-results-section">
          <div className="jobs-results-heading">
            <div>
              <span className="jobs-section-kicker">
                OPPORTUNITIES
              </span>

              <h2>Available jobs</h2>

              <p>
                {loading
                  ? "Loading available opportunities..."
                  : `${jobs.length} job${jobs.length === 1 ? "" : "s"} found`}
              </p>
            </div>

            <button
              className="jobs-clear-button"
              onClick={clearFilters}
              type="button"
            >
              <RefreshCw size={15} />
              Clear filters
            </button>
          </div>

          {loading && (
            <div className="jobs-state-card">
              <RefreshCw className="jobs-loading-icon" size={27} />
              <h3>Finding opportunities</h3>
              <p>Connecting to the TalentLens job database...</p>
            </div>
          )}

          {!loading && error && (
            <div className="jobs-state-card jobs-error-card">
              <h3>Unable to load jobs</h3>
              <p>{error}</p>

              <button
                className="jobs-search-button"
                onClick={() => fetchJobs()}
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <div className="jobs-state-card">
              <BriefcaseBusiness size={35} />
              <h3>No jobs found</h3>

              <p>
                There are no matching active jobs right now.
                Try changing your search or location.
              </p>

              <button
                className="jobs-search-button"
                onClick={clearFilters}
              >
                View all jobs
              </button>
            </div>
          )}

          {!loading && !error && jobs.length > 0 && (
            <div className="jobs-list">
              {jobs.map((job) => (
                <article className="job-card" key={job.id}>
                  <div className="job-card-top">
                    <div className="job-company-icon">
                      <Building2 size={23} />
                    </div>

                    <div className="job-posted-date">
                      {formatDate(job.created_at)}
                    </div>
                  </div>

                  <h3>{job.title}</h3>

                  <p className="job-company-name">
                    {job.company_name}
                  </p>

                  <div className="job-meta-list">
                    <span>
                      <MapPin size={15} />
                      {job.location || "Location not specified"}
                    </span>

                    <span>
                      <BriefcaseBusiness size={15} />
                      {job.employment_type || "Not specified"}
                    </span>

                    <span>
                      <Clock3 size={15} />
                      {formatExperience(job)}
                    </span>
                  </div>

                  <p className="job-description-preview">
                    {job.description}
                  </p>

                  <div className="job-skills">
                    {(Array.isArray(job.required_skills)
                      ? job.required_skills
                      : []
                    )
                      .slice(0, 5)
                      .map((skill, index) => (
                        <span key={`${job.id}-${index}`}>
                          {skill}
                        </span>
                      ))}
                  </div>

                  <div className="job-card-footer">
                    <span className="job-active-label">
                      <span />
                      Active
                    </span>

                    <button
                      className="job-view-button"
                      onClick={() => {
                        setSelectedJob(job);
                        setApplicationMessage("");
                        setApplicationError("");
                      }}
                    >
                      View details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="jobs-page-footer">
          <span>TalentLens · IS026 Mini Project</span>
          <span>AI-powered recruitment with transparency.</span>
        </footer>
      </main>

      {selectedJob && (
        <div
          className="job-modal-overlay"
          onClick={closeJobDetails}
        >
          <section
            className="job-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="job-modal-close"
              onClick={closeJobDetails}
              aria-label="Close job details"
            >
              <X size={21} />
            </button>

            <span className="jobs-section-kicker">
              JOB DETAILS
            </span>

            <h2 id="job-modal-title">
              {selectedJob.title}
            </h2>

            <p className="job-company-name">
              {selectedJob.company_name}
            </p>

            <div className="job-modal-meta">
              <span>
                <MapPin size={16} />
                {selectedJob.location || "Location not specified"}
              </span>

              <span>
                <BriefcaseBusiness size={16} />
                {selectedJob.employment_type || "Not specified"}
              </span>

              <span>
                <Clock3 size={16} />
                {formatExperience(selectedJob)}
              </span>
            </div>

            <div className="job-modal-divider" />

            <h3>Job description</h3>

            <p className="job-modal-description">
              {selectedJob.description}
            </p>

            <h3>
              <BrainCircuit size={18} />
              Required skills
            </h3>

            <div className="job-skills job-modal-skills">
              {(Array.isArray(selectedJob.required_skills)
                ? selectedJob.required_skills
                : []
              ).map((skill, index) => (
                <span key={index}>{skill}</span>
              ))}
            </div>

            <h3>
              <GraduationCap size={19} />
              Qualification
            </h3>

            <p className="job-modal-description">
              {selectedJob.qualification || "Not specified"}
            </p>

            <div className="job-apply-section">
              {applicationMessage ? (
                <div className="job-application-success">
                  <CheckCircle2 size={22} />

                  <div>
                    <strong>Application submitted!</strong>
                    <p>{applicationMessage}</p>
                  </div>
                </div>
              ) : applicationError ? (
                <div className="job-application-error">
                  <AlertCircle size={21} />
                  <p>{applicationError}</p>
                </div>
              ) : (
                <div className="job-apply-notice">
                  <SlidersHorizontal size={19} />

                  <p>
                    Review the job requirements before submitting
                    your application.
                  </p>
                </div>
              )}

              <button
                type="button"
                className="jobs-search-button job-apply-button"
                onClick={() => handleApply(selectedJob)}
                disabled={applying || Boolean(applicationMessage)}
              >
                {applying ? (
                  <>
                    <RefreshCw
                      size={17}
                      className="jobs-loading-icon"
                    />
                    Submitting...
                  </>
                ) : applicationMessage ? (
                  <>
                    <CheckCircle2 size={17} />
                    Applied Successfully
                  </>
                ) : (
                  <>
                    <BriefcaseBusiness size={17} />
                    Apply Now
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
