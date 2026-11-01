
import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock3,
  Search,
  RefreshCw,
  BrainCircuit,
  TrendingUp,
} from "lucide-react";
import api from "../../services/api";

const SCREENING_THRESHOLD = 85;

export default function ScreeningResultsPage() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  async function fetchResults() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/recruiter/applicants");

      setApplicants(response.data.applicants || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load screening results."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResults();
  }, []);

  function getDecision(applicant) {
    if (applicant.match_score == null) return "pending";

    return Number(applicant.match_score) >= SCREENING_THRESHOLD
      ? "qualified"
      : "not_selected";
  }

  const results = useMemo(() => {
    return applicants.filter((applicant) => {
      const candidateName = applicant.candidate?.name || "";
      const candidateEmail = applicant.candidate?.email || "";
      const jobTitle = applicant.job?.title || "";

      const searchText = search.toLowerCase();

      const matchesSearch = [
        candidateName,
        candidateEmail,
        jobTitle,
      ].some((value) =>
        value.toLowerCase().includes(searchText)
      );

      const decision = getDecision(applicant);

      const matchesFilter =
        filter === "all" || decision === filter;

      return matchesSearch && matchesFilter;
    });
  }, [applicants, search, filter]);

  const qualified = applicants.filter(
    (item) => getDecision(item) === "qualified"
  ).length;

  const notSelected = applicants.filter(
    (item) => getDecision(item) === "not_selected"
  ).length;

  const pending = applicants.filter(
    (item) => getDecision(item) === "pending"
  ).length;

  const evaluated = qualified + notSelected;

  const qualificationRate =
    evaluated > 0
      ? Math.round((qualified / evaluated) * 100)
      : 0;

  function getStatusStyle(decision) {
    if (decision === "qualified") {
      return {
        label: "Qualified",
        color: "#16804a",
        background: "#eaf7ef",
        Icon: CheckCircle2,
      };
    }

    if (decision === "not_selected") {
      return {
        label: "Not Selected",
        color: "#bd4141",
        background: "#fff0f0",
        Icon: XCircle,
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

  const cardStyle = {
    background: "#fff",
    border: "1px solid #e7ebf1",
    borderRadius: 12,
    padding: 18,
  };

  return (
    <div style={{ color: "#26364b" }}>
      <style>{`
        .screening-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin: 22px 0;
        }

        .screening-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .screening-table {
          width: 100%;
          min-width: 700px;
          border-collapse: collapse;
        }

        .screening-table th {
          text-align: left;
          padding: 14px;
          background: #f8fafc;
          color: #748196;
          font-size: 10px;
          letter-spacing: .5px;
          border-bottom: 1px solid #edf0f5;
        }

        .screening-table td {
          padding: 15px 14px;
          border-bottom: 1px solid #edf0f5;
          font-size: 12px;
        }

        .screening-table tr:last-child td {
          border-bottom: none;
        }

        @media (max-width: 850px) {
          .screening-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>

      {/* Page heading */}
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
            AI RECRUITMENT ANALYSIS
          </div>

          <h1
            style={{
              fontSize: 26,
              color: "#172b49",
              margin: 0,
              fontWeight: 750,
            }}
          >
            Screening Results
          </h1>

          <p
            style={{
              color: "#7a8798",
              fontSize: 12,
              marginTop: 7,
            }}
          >
            Review AI-powered candidate screening decisions.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchResults}
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
      <div className="screening-summary">
        {[
          {
            label: "Total Applicants",
            value: applicants.length,
            Icon: ClipboardCheck,
            color: "#285bb8",
          },
          {
            label: "Qualified",
            value: qualified,
            Icon: CheckCircle2,
            color: "#16804a",
          },
          {
            label: "Not Selected",
            value: notSelected,
            Icon: XCircle,
            color: "#bd4141",
          },
          {
            label: "Pending",
            value: pending,
            Icon: Clock3,
            color: "#a16a17",
          },
        ].map((item) => {
          const Icon = item.Icon;

          return (
            <div style={cardStyle} key={item.label}>
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

      {/* AI threshold information */}
      <div
        style={{
          ...cardStyle,
          background: "#eef4ff",
          borderColor: "#dce8fb",
          marginBottom: 17,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <BrainCircuit size={23} color="#285bb8" />

        <div>
          <strong style={{ fontSize: 12, color: "#28518a" }}>
            AI Screening Threshold: {SCREENING_THRESHOLD}%
          </strong>

          <p
            style={{
              margin: "5px 0 0",
              color: "#58708f",
              fontSize: 11,
              lineHeight: 1.6,
            }}
          >
            Candidates scoring {SCREENING_THRESHOLD}% or above
            qualify. Candidates below this score are not selected.
            Decisions are generated automatically.
          </p>
        </div>
      </div>

      {/* Qualification rate */}
      <div
        style={{
          ...cardStyle,
          marginBottom: 17,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div>
            <div
              style={{
                color: "#718096",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              Qualification Rate
            </div>

            <div
              style={{
                fontSize: 25,
                color: "#172b49",
                fontWeight: 750,
                marginTop: 7,
              }}
            >
              {qualificationRate}%
            </div>
          </div>

          <TrendingUp size={22} color="#285bb8" />
        </div>

        <div
          style={{
            height: 8,
            background: "#edf0f5",
            borderRadius: 20,
            marginTop: 14,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${qualificationRate}%`,
              background: "#285bb8",
              borderRadius: 20,
              transition: "width .3s ease",
            }}
          />
        </div>

        <p
          style={{
            fontSize: 10,
            color: "#8290a3",
            margin: "9px 0 0",
          }}
        >
          Based on {evaluated} completed screening results.
          Pending applications are excluded.
        </p>
      </div>

      {/* Search and filter */}
      <div
        style={{
          ...cardStyle,
          display: "flex",
          gap: 11,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 17,
          padding: 13,
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
          <option value="all">All results</option>
          <option value="qualified">Qualified</option>
          <option value="not_selected">Not Selected</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Results table */}
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
            Candidate Screening Report
          </h2>

          <span style={{ color: "#8290a3", fontSize: 11 }}>
            {results.length} results
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
            <p>Loading screening results...</p>
          </div>
        ) : results.length === 0 ? (
          <div
            style={{
              padding: 45,
              textAlign: "center",
            }}
          >
            <ClipboardCheck
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
              No screening results found
            </h3>

            <p
              style={{
                color: "#8793a3",
                fontSize: 12,
                margin: 0,
              }}
            >
              Screening results will appear when candidates apply
              and their resumes are evaluated.
            </p>
          </div>
        ) : (
          <div className="screening-table-wrap">
            <table className="screening-table">
              <thead>
                <tr>
                  <th>CANDIDATE</th>
                  <th>JOB TITLE</th>
                  <th>APPLIED ON</th>
                  <th>MATCH SCORE</th>
                  <th>AI DECISION</th>
                </tr>
              </thead>

              <tbody>
                {results.map((applicant) => {
                  const decision = getDecision(applicant);
                  const status = getStatusStyle(decision);
                  const StatusIcon = status.Icon;

                  return (
                    <tr key={applicant.application_id}>
                      <td>
                        <div
                          style={{
                            color: "#203653",
                            fontWeight: 700,
                          }}
                        >
                          {applicant.candidate?.name || "Unknown"}
                        </div>

                        <div
                          style={{
                            color: "#8290a3",
                            fontSize: 10,
                            marginTop: 4,
                          }}
                        >
                          {applicant.candidate?.email || "No email"}
                        </div>
                      </td>

                      <td>
                        {applicant.job?.title || "Unknown job"}
                      </td>

                      <td>{formatDate(applicant.applied_at)}</td>

                      <td>
                        <strong
                          style={{
                            color:
                              applicant.match_score == null
                                ? "#8290a3"
                                : Number(applicant.match_score) >=
                                  SCREENING_THRESHOLD
                                ? "#16804a"
                                : "#bd4141",
                          }}
                        >
                          {applicant.match_score == null
                            ? "Pending"
                            : `${Number(applicant.match_score).toFixed(1)}%`}
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
                            background: status.background,
                            color: status.color,
                            fontSize: 10,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </td>
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
