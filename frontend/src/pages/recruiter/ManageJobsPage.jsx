
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  BriefcaseBusiness,
  MapPin,
  Users,
  Pencil,
  Trash2,
  Power,
  X,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";

const emptyForm = {
  title: "",
  company_name: "",
  description: "",
  required_skills: "",
  qualification: "",
  min_experience: "0",
  max_experience: "",
  location: "",
  employment_type: "Full-time",
};

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/recruiter/jobs");
      setJobs(response.data.jobs || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openCreateForm = () => {
    setEditingJob(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (job) => {
    setEditingJob(job);

    setForm({
      title: job.title || "",
      company_name: job.company_name || "",
      description: job.description || "",
      required_skills: (job.required_skills || []).join(", "),
      qualification: job.qualification || "",
      min_experience: String(job.min_experience ?? 0),
      max_experience:
        job.max_experience == null
          ? ""
          : String(job.max_experience),
      location: job.location || "",
      employment_type: job.employment_type || "Full-time",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const skills = form.required_skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (skills.length === 0) {
      setError("Please enter at least one required skill.");
      return;
    }

    const minExperience = Number(form.min_experience);
    const maxExperience =
      form.max_experience === ""
        ? null
        : Number(form.max_experience);

    if (
      !Number.isFinite(minExperience) ||
      minExperience < 0 ||
      (maxExperience !== null &&
        (!Number.isFinite(maxExperience) ||
          maxExperience < minExperience))
    ) {
      setError("Please enter valid experience values.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      company_name: form.company_name.trim(),
      description: form.description.trim(),
      required_skills: skills,
      qualification: form.qualification.trim(),
      min_experience: minExperience,
      max_experience: maxExperience,
      location: form.location.trim(),
      employment_type: form.employment_type,
    };

    try {
      setSaving(true);

      if (editingJob) {
        await api.patch(`/jobs/${editingJob.id}`, payload);
        setSuccess("Job updated successfully.");
      } else {
        await api.post("/jobs/", payload);
        setSuccess("Job created successfully.");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingJob(null);
      await fetchJobs();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save the job."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleJobStatus = async (job) => {
    const nextStatus =
      job.status === "active" ? "inactive" : "active";

    const confirmed = window.confirm(
      `Are you sure you want to ${nextStatus === "active" ? "activate" : "deactivate"} this job?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.patch(`/jobs/${job.id}/status`, {
        status: nextStatus,
      });

      setSuccess(
        `Job ${nextStatus === "active" ? "activated" : "deactivated"} successfully.`
      );

      await fetchJobs();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update job status."
      );
    }
  };

  const deleteJob = async (job) => {
    const confirmed = window.confirm(
      `Delete "${job.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/jobs/${job.id}`);
      setSuccess("Job deleted successfully.");
      await fetchJobs();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete job."
      );
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      job.title?.toLowerCase().includes(searchText) ||
      job.company_name?.toLowerCase().includes(searchText) ||
      job.location?.toLowerCase().includes(searchText);

    const matchesFilter =
      filter === "all" || job.status === filter;

    return matchesSearch && matchesFilter;
  });

  const activeCount = jobs.filter(
    (job) => job.status === "active"
  ).length;

  const inactiveCount = jobs.filter(
    (job) => job.status === "inactive"
  ).length;

  const fieldStyle = {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #dce3ed",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#26364b",
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "7px",
    color: "#46566d",
    fontSize: "12px",
    fontWeight: 650,
  };

  const buttonStyle = {
    border: "none",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "12px",
    fontWeight: 650,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
  };

  return (
    <div style={{ color: "#26364b" }}>
      <style>{`
        .manage-jobs-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin: 22px 0;
        }
        .manage-job-card {
          background: #fff;
          border: 1px solid #e7ebf1;
          border-radius: 12px;
          padding: 17px;
          min-width: 0;
        }
        .manage-job-actions {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          margin-top: 16px;
        }
        .manage-job-modal {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(15, 28, 48, .48);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 18px;
          overflow-y: auto;
        }
        .manage-job-modal-content {
          background: #fff;
          width: 100%;
          max-width: 650px;
          max-height: 92vh;
          overflow-y: auto;
          border-radius: 14px;
          padding: 24px;
          box-sizing: border-box;
        }
        .manage-job-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
        }
        .manage-job-table-wrap {
          overflow-x: auto;
        }
        .manage-job-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 650px;
        }
        .manage-job-table th,
        .manage-job-table td {
          padding: 14px 12px;
          border-bottom: 1px solid #edf0f5;
          text-align: left;
          font-size: 12px;
        }
        .manage-job-table th {
          color: #728096;
          font-weight: 650;
          background: #f8fafc;
        }
        .manage-job-table td {
          color: #34445a;
        }
        @media (max-width: 700px) {
          .manage-jobs-grid {
            grid-template-columns: 1fr;
          }
          .manage-job-form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Page heading */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 15,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "#285bb8",
              fontSize: "10px",
              fontWeight: 750,
              letterSpacing: "1.3px",
              marginBottom: 7,
            }}
          >
            RECRUITMENT MANAGEMENT
          </div>

          <h1
            style={{
              color: "#172b49",
              fontSize: "26px",
              margin: 0,
              fontWeight: 750,
            }}
          >
            Manage Jobs
          </h1>

          <p
            style={{
              color: "#7a8798",
              fontSize: "12px",
              marginTop: 7,
            }}
          >
            Create, update and manage your job openings.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          style={{
            ...buttonStyle,
            background: "#285bb8",
            color: "#fff",
            padding: "11px 16px",
          }}
        >
          <Plus size={16} />
          Create Job
        </button>
      </div>

      {/* Feedback messages */}
      {error && (
        <div
          style={{
            background: "#fff1f1",
            color: "#b42318",
            padding: "11px 14px",
            borderRadius: 8,
            marginTop: 16,
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            background: "#edf9f1",
            color: "#187341",
            padding: "11px 14px",
            borderRadius: 8,
            marginTop: 16,
            fontSize: 12,
          }}
        >
          {success}
        </div>
      )}

      {/* Summary cards */}
      <div className="manage-jobs-grid">
        {[
          {
            label: "Total Jobs",
            value: jobs.length,
            icon: BriefcaseBusiness,
          },
          {
            label: "Active Jobs",
            value: activeCount,
            icon: Power,
          },
          {
            label: "Inactive Jobs",
            value: inactiveCount,
            icon: Users,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div className="manage-job-card" key={item.label}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    color: "#748196",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </span>

                <Icon size={18} color="#285bb8" />
              </div>

              <div
                style={{
                  fontSize: 25,
                  fontWeight: 750,
                  color: "#172b49",
                  marginTop: 12,
                }}
              >
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and filter */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e7ebf1",
          borderRadius: 12,
          padding: 14,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 17,
        }}
      >
        <div style={{ flex: "1 1 220px", position: "relative" }}>
          <Search
            size={16}
            color="#8491a3"
            style={{
              position: "absolute",
              left: 12,
              top: 12,
            }}
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search job title, company or location"
            style={{ ...fieldStyle, paddingLeft: 36 }}
          />
        </div>

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          style={{ ...fieldStyle, width: "auto", minWidth: 140 }}
        >
          <option value="all">All jobs</option>
          <option value="active">Active jobs</option>
          <option value="inactive">Inactive jobs</option>
        </select>

        <button
          type="button"
          onClick={fetchJobs}
          title="Refresh jobs"
          style={{
            ...buttonStyle,
            background: "#eef3fb",
            color: "#285bb8",
            padding: 11,
          }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Jobs listing */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e7ebf1",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "17px 18px",
            borderBottom: "1px solid #edf0f5",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              color: "#172b49",
              fontSize: 15,
              margin: 0,
            }}
          >
            Your Job Openings
          </h2>

          <span style={{ color: "#8290a3", fontSize: 11 }}>
            {filteredJobs.length} jobs
          </span>
        </div>

        {loading ? (
          <div
            style={{
              padding: 45,
              textAlign: "center",
              color: "#718096",
              fontSize: 13,
            }}
          >
            <LoaderCircle
              size={22}
              style={{
                animation: "manageJobSpin 1s linear infinite",
                marginBottom: 9,
              }}
            />
            <div>Loading your jobs...</div>
            <style>
              {`@keyframes manageJobSpin { to { transform: rotate(360deg); } }`}
            </style>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div
            style={{
              padding: "48px 20px",
              textAlign: "center",
            }}
          >
            <BriefcaseBusiness
              size={30}
              color="#9aa7b8"
              style={{ marginBottom: 12 }}
            />

            <h3
              style={{
                color: "#34445a",
                fontSize: 15,
                margin: "0 0 7px",
              }}
            >
              No jobs found
            </h3>

            <p
              style={{
                color: "#8793a3",
                fontSize: 12,
                margin: 0,
              }}
            >
              Create a new job opening or change your search filters.
            </p>
          </div>
        ) : (
          <div className="manage-job-table-wrap">
            <table className="manage-job-table">
              <thead>
                <tr>
                  <th>JOB DETAILS</th>
                  <th>LOCATION</th>
                  <th>APPLICANTS</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <div
                        style={{
                          color: "#203653",
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {job.title}
                      </div>

                      <div
                        style={{
                          color: "#8290a3",
                          marginTop: 5,
                        }}
                      >
                        {job.company_name}
                      </div>

                      <div
                        style={{
                          color: "#8290a3",
                          marginTop: 5,
                        }}
                      >
                        {job.employment_type || "Not specified"}
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <MapPin size={13} />
                        {job.location || "Not specified"}
                      </span>
                    </td>

                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Users size={14} />
                        {job.applicant_count ?? 0}
                      </span>
                    </td>

                    <td>
                      <span
                        style={{
                          background:
                            job.status === "active"
                              ? "#eaf7ef"
                              : "#f0f1f4",
                          color:
                            job.status === "active"
                              ? "#187341"
                              : "#667085",
                          borderRadius: 20,
                          padding: "5px 10px",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {job.status === "active"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          title="Edit job"
                          onClick={() => openEditForm(job)}
                          style={{
                            ...buttonStyle,
                            padding: 8,
                            color: "#285bb8",
                            background: "#eef3fb",
                          }}
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          title={
                            job.status === "active"
                              ? "Deactivate job"
                              : "Activate job"
                          }
                          onClick={() => toggleJobStatus(job)}
                          style={{
                            ...buttonStyle,
                            padding: 8,
                            color: "#805b18",
                            background: "#fff6e5",
                          }}
                        >
                          <Power size={14} />
                        </button>

                        <button
                          type="button"
                          title="Delete job"
                          onClick={() => deleteJob(job)}
                          style={{
                            ...buttonStyle,
                            padding: 8,
                            color: "#b42318",
                            background: "#fff0ef",
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit job modal */}
      {showForm && (
        <div
          className="manage-job-modal"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowForm(false);
            }
          }}
        >
          <div className="manage-job-modal-content">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 22,
              }}
            >
              <div>
                <h2
                  style={{
                    color: "#172b49",
                    fontSize: 19,
                    margin: 0,
                  }}
                >
                  {editingJob ? "Edit Job" : "Create New Job"}
                </h2>

                <p
                  style={{
                    color: "#8491a3",
                    fontSize: 11,
                    margin: "6px 0 0",
                  }}
                >
                  Enter the job information below.
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => setShowForm(false)}
                style={{
                  border: "none",
                  background: "#f0f3f8",
                  borderRadius: 8,
                  padding: 8,
                  cursor: "pointer",
                }}
              >
                <X size={17} color="#526176" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="manage-job-form-grid">
                <label>
                  <span style={labelStyle}>Job Title *</span>
                  <input
                    required
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Python Developer"
                    style={fieldStyle}
                  />
                </label>

                <label>
                  <span style={labelStyle}>Company Name *</span>
                  <input
                    required
                    name="company_name"
                    value={form.company_name}
                    onChange={handleChange}
                    placeholder="Company name"
                    style={fieldStyle}
                  />
                </label>

                <label>
                  <span style={labelStyle}>Qualification</span>
                  <input
                    name="qualification"
                    value={form.qualification}
                    onChange={handleChange}
                    placeholder="e.g. B.E. / B.Tech"
                    style={fieldStyle}
                  />
                </label>

                <label>
                  <span style={labelStyle}>Location</span>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Mangalore"
                    style={fieldStyle}
                  />
                </label>

                <label>
                  <span style={labelStyle}>Minimum Experience (years)</span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.5"
                    name="min_experience"
                    value={form.min_experience}
                    onChange={handleChange}
                    style={fieldStyle}
                  />
                </label>

                <label>
                  <span style={labelStyle}>Maximum Experience (years)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    name="max_experience"
                    value={form.max_experience}
                    onChange={handleChange}
                    placeholder="Optional"
                    style={fieldStyle}
                  />
                </label>

                <label>
                  <span style={labelStyle}>Employment Type</span>
                  <select
                    name="employment_type"
                    value={form.employment_type}
                    onChange={handleChange}
                    style={fieldStyle}
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Internship</option>
                    <option>Contract</option>
                    <option>Remote</option>
                  </select>
                </label>

                <label>
                  <span style={labelStyle}>Required Skills *</span>
                  <input
                    required
                    name="required_skills"
                    value={form.required_skills}
                    onChange={handleChange}
                    placeholder="Python, Flask, MySQL"
                    style={fieldStyle}
                  />
                </label>
              </div>

              <label
                style={{
                  display: "block",
                  marginTop: 16,
                }}
              >
                <span style={labelStyle}>Job Description *</span>
                <textarea
                  required
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the job responsibilities and requirements..."
                  style={{
                    ...fieldStyle,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </label>

              {error && (
                <p
                  style={{
                    color: "#b42318",
                    fontSize: 12,
                    marginTop: 12,
                  }}
                >
                  {error}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 22,
                }}
              >
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowForm(false)}
                  style={{
                    ...buttonStyle,
                    background: "#f0f3f8",
                    color: "#526176",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    ...buttonStyle,
                    background: "#285bb8",
                    color: "#fff",
                    minWidth: 125,
                  }}
                >
                  {saving ? "Saving..." : editingJob ? "Save Changes" : "Create Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
