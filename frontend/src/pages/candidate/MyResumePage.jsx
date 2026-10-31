import { useEffect, useState } from "react";
import {
  FileText,
  Upload,
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileCheck2,
  Clock3,
  ArrowLeft,
  FileUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function MyResumePage() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchResumes() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/resumes/my");

      setResumes(response.data.resumes || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your resumes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResumes();
  }, []);

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    setError("");
    setSuccess("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const extension = file.name.split(".").pop().toLowerCase();

    if (!["pdf", "docx"].includes(extension)) {
      setError("Only PDF and DOCX files are supported.");
      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must not exceed 5 MB.");
      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select a PDF or DOCX resume first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("resume", selectedFile);

      const response = await api.post(
        "/resumes/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess(
        response.data.message ||
        "Resume uploaded and analyzed successfully."
      );

      setSelectedFile(null);

      const fileInput = document.getElementById("resume-file-input");
      if (fileInput) fileInput.value = "";

      await fetchResumes();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Resume upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  }

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

  function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <div className="my-resume-page">
      <header className="resume-page-header">
        <button
          className="resume-back-button"
          onClick={() => navigate("/candidate/dashboard")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="resume-brand">
          <BrainCircuit size={23} />
          <div>
            <strong>TalentLens</strong>
            <small>Recruitment Intelligence</small>
          </div>
        </div>
      </header>

      <main className="resume-page-content">
        <section className="resume-page-hero">
          <span className="resume-eyebrow">
            <FileText size={15} />
            CANDIDATE PROFILE
          </span>

          <h1>My Resume</h1>

          <p>
            Upload your latest resume and let TalentLens
            analyze your skills for better career opportunities.
          </p>
        </section>

        <section className="resume-upload-panel">
          <div className="resume-panel-heading">
            <div className="resume-panel-icon">
              <FileUp size={23} />
            </div>

            <div>
              <h2>Upload your resume</h2>
              <p>
                Supported formats: PDF and DOCX · Maximum size: 5 MB
              </p>
            </div>
          </div>

          <form onSubmit={handleUpload}>
            <label
              htmlFor="resume-file-input"
              className="resume-dropzone"
            >
              <Upload size={32} />

              <strong>
                {selectedFile
                  ? selectedFile.name
                  : "Choose your resume file"}
              </strong>

              <span>
                {selectedFile
                  ? `${formatFileSize(selectedFile.size)} · Ready to upload`
                  : "Click here to browse PDF or DOCX files"}
              </span>

              <input
                id="resume-file-input"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
              />
            </label>

            {selectedFile && (
              <div className="resume-selected-file">
                <FileCheck2 size={19} />
                <span>{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    document.getElementById("resume-file-input").value = "";
                  }}
                >
                  Remove
                </button>
              </div>
            )}

            <button
              type="submit"
              className="resume-upload-button"
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <RefreshCw className="resume-spin" size={18} />
                  Uploading and analyzing...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload and analyze resume
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="resume-message resume-error">
              <AlertCircle size={19} />
              {error}
            </div>
          )}

          {success && (
            <div className="resume-message resume-success">
              <CheckCircle2 size={19} />
              {success}
            </div>
          )}
        </section>

        <section className="resume-list-section">
          <div className="resume-list-heading">
            <div>
              <span className="resume-section-kicker">
                YOUR DOCUMENTS
              </span>

              <h2>Uploaded resumes</h2>

              <p>
                {loading
                  ? "Loading your resumes..."
                  : `${resumes.length} resume${resumes.length === 1 ? "" : "s"} uploaded`}
              </p>
            </div>

            <button
              className="resume-refresh-button"
              onClick={fetchResumes}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {loading && (
            <div className="resume-empty-state">
              <RefreshCw className="resume-spin" size={27} />
              <p>Loading your resume details...</p>
            </div>
          )}

          {!loading && !error && resumes.length === 0 && (
            <div className="resume-empty-state">
              <FileText size={39} />
              <h3>No resumes uploaded yet</h3>
              <p>
                Upload your first resume to begin AI-powered
                skill extraction.
              </p>
            </div>
          )}

          {!loading && resumes.length > 0 && (
            <div className="resume-list">
              {resumes.map((resume) => (
                <article className="resume-card" key={resume.id}>
                  <div className="resume-card-top">
                    <div className="resume-file-icon">
                      <FileText size={25} />
                    </div>

                    <span className="resume-file-type">
                      {resume.file_type?.toUpperCase()}
                    </span>
                  </div>

                  <h3>{resume.file_name}</h3>

                  <p className="resume-uploaded-date">
                    <Clock3 size={15} />
                    Uploaded on {formatDate(resume.uploaded_at)}
                  </p>

                  <div className="resume-analysis-divider" />

                  <div className="resume-skills-heading">
                    <BrainCircuit size={18} />
                    <strong>Extracted skills</strong>
                  </div>

                  {Array.isArray(resume.extracted_skills) &&
                  resume.extracted_skills.length > 0 ? (
                    <div className="resume-skills-list">
                      {resume.extracted_skills.map((skill, index) => (
                        <span key={`${resume.id}-${index}`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="resume-no-skills">
                      No recognized skills found in this resume.
                    </p>
                  )}

                  <div className="resume-card-footer">
                    <CheckCircle2 size={16} />
                    Resume analyzed successfully
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="resume-info-panel">
          <BrainCircuit size={23} />

          <div>
            <h3>How TalentLens analyzes your resume</h3>
            <p>
              The current analysis extracts readable text from your
              PDF or DOCX file and identifies recognized skills.
              These skills can be used in the upcoming job matching
              module.
            </p>
          </div>
        </section>

        <footer className="resume-page-footer">
          TalentLens · IS026 Mini Project
        </footer>
      </main>
    </div>
  );
}