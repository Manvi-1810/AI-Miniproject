
import { useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  UserRound,
  BriefcaseBusiness,
  Award,
} from "lucide-react";
import api from "../../services/api";

export default function AIInterviewResultsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  async function fetchInterviews() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/recruiter/interviews");

      setInterviews(response.data.interview_results || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load AI interview results."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInterviews();
  }, []);

  function getStatus(interview) {
    const status = String(
      interview.status ||
        interview.interview_status ||
        "pending"
    ).toLowerCase();

    if (
      status === "completed" ||
      status === "complete"
    ) {
      return "completed";
    }

    if (
      status === "in_progress" ||
      status === "started"
    ) {
      return "in_progress";
    }

    return "pending";
  }

  function getCandidate(interview) {
    return (
      interview.candidate?.name ||
      interview.candidate_name ||
      interview.applicant?.name ||
      "Unknown Candidate"
    );
  }

  function getEmail(interview) {
    return (
      interview.candidate?.email ||
      interview.candidate_email ||
      interview.applicant?.email ||
      "No email available"
    );
  }

  function getJobTitle(interview) {
    return (
      interview.job?.title ||
      interview.job_title ||
      interview.position ||
      "Unknown Job"
    );
  }

  function getScore(interview) {
    const score =
      interview.overall_score ??
      interview.performance_report?.overall_score ??
      interview.performance_report?.score;

    return score == null ? null : Number(score);
  }

  function getReport(interview) {
    return (
      interview.performance_report ||
      interview.report ||
      {}
    );
  }

  const completedCount = interviews.filter(
    (item) => getStatus(item) === "completed"
  ).length;

  const inProgressCount = interviews.filter(
    (item) => getStatus(item) === "in_progress"
  ).length;

  const pendingCount = interviews.filter(
    (item) => getStatus(item) === "pending"
  ).length;

  const averageScore = (() => {
    const scores = interviews
      .filter((item) => getScore(item) !== null)
      .map((item) => getScore(item))
      .filter((score) => Number.isFinite(score));

    if (!scores.length) return null;

    return (
      scores.reduce((total, score) => total + score, 0) /
      scores.length
    );
  })();

  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview) => {
      const searchText = search.toLowerCase();

      const matchesSearch = [
        getCandidate(interview),
        getEmail(interview),
        getJobTitle(interview),
      ].some((value) =>
        value.toLowerCase().includes(searchText)
      );

      const matchesFilter =
        filter === "all" ||
        getStatus(interview) === filter;

      return matchesSearch && matchesFilter;
    });
  }, [interviews, search, filter]);

  function getStatusStyle(status) {
    if (status === "completed") {
      return {
        label: "Completed",
        color: "#16804a",
        background: "#eaf7ef",
        Icon: CheckCircle2,
      };
    }

    if (status === "in_progress") {
      return {
        label: "In Progress",
        color: "#285bb8",
        background: "#eef4ff",
        Icon: Clock3,
      };
    }

    return {
      label: "Pending",
      color: "#a16a17",
      background: "#fff6e5",
      Icon: Clock3,
    };
  }

  function formatDate(value) {
    if (!value) return "Unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Unavailable";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function renderReport(report) {
    if (!report || typeof report !== "object") {
      return (
        <p style={{ color: "#8290a3", fontSize: 12 }}>
          No performance report available.
        </p>
      );
    }

    const excludedKeys = [
      "overall_score",
      "score",
      "questions",
      "responses",
    ];

    const entries = Object.entries(report).filter(
      ([key, value]) =>
        !excludedKeys.includes(key) &&
        value !== null &&
        value !== undefined &&
        typeof value !== "object"
    );

    if (!entries.length) {
      return (
        <p style={{ color: "#8290a3", fontSize: 12 }}>
          No additional performance details available.
        </p>
      );
    }

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        {entries.map(([key, value]) => (
          <div
            key={key}
            style={{
              background: "#fff",
              border: "1px solid #e7ebf1",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div
              style={{
                color: "#8290a3",
                fontSize: 10,
                marginBottom: 6,
                textTransform: "capitalize",
              }}
            >
              {key.replaceAll("_", " ")}
            </div>

            <div
              style={{
                color: "#34445a",
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
              }}
            >
              {String(value)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ color: "#26364b" }}>
      <style>{`
        .interview-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin: 22px 0;
        }

        .interview-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .interview-table {
          width: 100%;
          min-width: 700px;
          border-collapse: collapse;
        }

        .interview-table th {
          text-align: left;
          padding: 14px;
          background: #f8fafc;
          color: #748196;
          font-size: 10px;
          letter-spacing: .5px;
          border-bottom: 1px solid #edf0f5;
        }

        .interview-table td {
          padding: 15px 14px;
          border-bottom: 1px solid #edf0f5;
          font-size: 12px;
        }

        .interview-table tr:last-child td {
          border-bottom: none;
        }

        @media (max-width: 850px) {
          .interview-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>

      {/* Heading */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "#285bb8",
              fontSize: 10,
              fontWeight: 750,
              letterSpacing: 1.2,
              marginBottom: 7,
            }}
          >
            AI-POWERED EVALUATION
          </div>

          <h1
            style={{
              fontSize: 26,
              color: "#172b49",
              margin: 0,
              fontWeight: 750,
            }}
          >
            AI Interview Results
          </h1>

          <p
            style={{
              color: "#7a8798",
              fontSize: 12,
              marginTop: 7,
            }}
          >
            Review candidate interview performance and AI evaluation.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchInterviews}
          disabled={loading}
          style={{
            border: "none",
            borderRadius: 8,
            padding: "10px 13px",
            background: "#eef3fb",
            color: "#285bb8",
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontWeight: 650,
            cursor: "pointer",
          }}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: 13,
            background: "#fff0f0",
            color: "#bd4141",
            borderRadius: 8,
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="interview-summary">
        {[
          {
            label: "Total Interviews",
            value: interviews.length,
            Icon: ClipboardList,
            color: "#285bb8",
          },
          {
            label: "Completed",
            value: completedCount,
            Icon: CheckCircle2,
            color: "#16804a",
          },
          {
            label: "In Progress",
            value: inProgressCount,
            Icon: Clock3,
            color: "#285bb8",
          },
          {
            label: "Average Score",
            value:
              averageScore === null
                ? "—"
                : `${averageScore.toFixed(1)}%`,
            Icon: Award,
            color: "#a16a17",
          },
        ].map((item) => {
          const Icon = item.Icon;

          return (
            <div
              key={item.label}
              style={{
                background: "#fff",
                border: "1px solid #e7ebf1",
                borderRadius: 12,
                padding: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "#748196",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </span>

                <Icon size={18} color={item.color} />
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

      {/* Information */}
      <div
        style={{
          background: "#eef4ff",
          border: "1px solid #dce8fb",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 17,
        }}
      >
        <BrainCircuit size={23} color="#285bb8" />

        <div>
          <strong style={{ fontSize: 12, color: "#28518a" }}>
            AI Interview Evaluation
          </strong>

          <p
            style={{
              margin: "5px 0 0",
              color: "#58708f",
              fontSize: 11,
              lineHeight: 1.6,
            }}
          >
            Interview scores and performance details are displayed
            from the AI interview evaluation records.
          </p>
        </div>
      </div>

      {/* Search and filter */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e7ebf1",
          borderRadius: 12,
          padding: 13,
          display: "flex",
          gap: 11,
          alignItems: "center",
          flexWrap: "wrap",
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
            placeholder="Search candidate or job..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "11px 12px 11px 36px",
              border: "1px solid #dce3ed",
              borderRadius: 8,
              fontSize: 12,
              outline: "none",
            }}
          />
        </div>

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          style={{
            padding: "11px 12px",
            border: "1px solid #dce3ed",
            borderRadius: 8,
            background: "#fff",
            color: "#40536b",
            fontSize: 12,
            minWidth: 155,
          }}
        >
          <option value="all">All interviews</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Interview table */}
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
            Interview Performance
          </h2>

          <span style={{ color: "#8290a3", fontSize: 11 }}>
            {filteredInterviews.length} results
          </span>
        </div>

        {loading ? (
          <div
            style={{
              padding: 45,
              textAlign: "center",
              color: "#718096",
              fontSize: 12,
            }}
          >
            <RefreshCw size={23} />
            <p>Loading interview results...</p>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div style={{ padding: 45, textAlign: "center" }}>
            <BrainCircuit
              size={32}
              color="#9aa7b8"
              style={{ marginBottom: 10 }}
            />

            <h3
              style={{
                color: "#34445a",
                fontSize: 14,
                margin: "0 0 7px",
              }}
            >
              No interview results found
            </h3>

            <p
              style={{
                color: "#8793a3",
                fontSize: 12,
                margin: 0,
              }}
            >
              Interview records will appear here after candidates
              complete their AI interviews.
            </p>
          </div>
        ) : (
          <div className="interview-table-wrap">
            <table className="interview-table">
              <thead>
                <tr>
                  <th>CANDIDATE</th>
                  <th>JOB TITLE</th>
                  <th>INTERVIEW DATE</th>
                  <th>OVERALL SCORE</th>
                  <th>STATUS</th>
                  <th>REPORT</th>
                </tr>
              </thead>

              <tbody>
                {filteredInterviews.map((interview, index) => {
                  const status = getStatus(interview);
                  const statusStyle = getStatusStyle(status);
                  const StatusIcon = statusStyle.Icon;
                  const score = getScore(interview);

                  const id =
                    interview.id ??
                    interview.interview_id ??
                    interview.application_id ??
                    index;

                  const expanded = expandedId === id;

                  return (
                    <tr key={id}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <UserRound size={17} color="#718096" />

                          <div>
                            <div
                              style={{
                                color: "#203653",
                                fontWeight: 700,
                              }}
                            >
                              {getCandidate(interview)}
                            </div>

                            <div
                              style={{
                                color: "#8290a3",
                                fontSize: 10,
                                marginTop: 4,
                              }}
                            >
                              {getEmail(interview)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                          }}
                        >
                          <BriefcaseBusiness
                            size={14}
                            color="#8290a3"
                          />
                          {getJobTitle(interview)}
                        </div>
                      </td>

                      <td>
                        {formatDate(
                          interview.completed_at ||
                            interview.started_at ||
                            interview.created_at
                        )}
                      </td>

                      <td>
                        <strong
                          style={{
                            color:
                              score === null
                                ? "#8290a3"
                                : "#285bb8",
                          }}
                        >
                          {score === null
                            ? "—"
                            : `${score.toFixed(1)}%`}
                        </strong>
                      </td>

                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "6px 9px",
                            borderRadius: 20,
                            background: statusStyle.background,
                            color: statusStyle.color,
                            fontSize: 10,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <StatusIcon size={12} />
                          {statusStyle.label}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(expanded ? null : id)
                          }
                          style={{
                            border: "1px solid #dce3ed",
                            borderRadius: 7,
                            background: "#fff",
                            color: "#285bb8",
                            padding: "7px 9px",
                            fontSize: 10,
                            fontWeight: 650,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            cursor: "pointer",
                          }}
                        >
                          {expanded ? "Hide" : "View"}
                          {expanded ? (
                            <ChevronUp size={13} />
                          ) : (
                            <ChevronDown size={13} />
                          )}
                        </button>
                      </td>

                      {expanded && (
                        <td
                          colSpan={5}
                          style={{
                            background: "#f8fafc",
                            padding: 18,
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 700,
                              color: "#203653",
                              fontSize: 12,
                              marginBottom: 12,
                            }}
                          >
                            AI Performance Report
                          </div>

                          {renderReport(getReport(interview))}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
