
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  UserRound,
  BriefcaseBusiness,
  CheckCircle2,
  XCircle,
  Clock3,
  ChevronDown,
  ChevronUp,
  Mail,
} from "lucide-react";
import api from "../../services/api";

const THRESHOLD = 85;

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  async function fetchApplicants() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/recruiter/applicants");

      setApplicants(response.data.applicants || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load applicants. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplicants();
  }, []);

  const getDecision = (applicant) => {
    if (applicant.match_score == null) {
      return "pending";
    }

    return applicant.match_score >= THRESHOLD
      ? "qualified"
      : "not_selected";
  };

  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const name = applicant.candidate?.name || "";
      const email = applicant.candidate?.email || "";
      const job = applicant.job?.title || "";
      const company = applicant.job?.company_name || "";

      const searchValue = search.toLowerCase();

      const matchesSearch = [
        name,
        email,
        job,
        company,
      ].some((value) =>
        value.toLowerCase().includes(searchValue)
      );

      const matchesDecision =
        decisionFilter === "all" ||
        getDecision(applicant) === decisionFilter;

      return matchesSearch && matchesDecision;
    });
  }, [applicants, search, decisionFilter]);

  const qualifiedCount = applicants.filter(
    (item) => getDecision(item) === "qualified"
  ).length;

  const notSelectedCount = applicants.filter(
    (item) => getDecision(item) === "not_selected"
  ).length;

  const pendingCount = applicants.filter(
    (item) => getDecision(item) === "pending"
  ).length;

  function formatDate(value) {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function decisionDetails(decision) {
    if (decision === "qualified") {
      return {
        label: "Qualified",
        color: "#16804a",
        background: "#eaf7ef",
        icon: CheckCircle2,
      };
    }

    if (decision === "not_selected") {
      return {
        label: "Not Selected",
        color: "#bd4141",
        background: "#fff0f0",
        icon: XCircle,
      };
    }

    return {
      label: "Pending",
      color: "#a16a17",
      background: "#fff6e5",
      icon: Clock3,
    };
  }

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e7ebf1",
    borderRadius: "12px",
    padding: "18px",
    minWidth: 0,
  };

  const buttonStyle = {
    border: "1px solid #e1e7ef",
    background: "#ffffff",
    color: "#40536b",
    borderRadius: "8px",
    padding: "9px 12px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
  };

  return (
    <div style={{ color: "#26364b" }}>
      <style>{`
        .applicants-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin: 22px 0;
        }

        .applicants-table-wrap {
          overflow-x: auto;
          width: 100%;
        }

        .applicants-table {
          width: 100%;
          min-width: 750px;
          border-collapse: collapse;
        }

        .applicants-table th {
          background: #f8fafc;
          color: #748196;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .45px;
          text-align: left;
          padding: 14px 15px;
          border-bottom: 1px solid #edf0f5;
        }

        .applicants-table td {
          padding: 15px;
          border-bottom: 1px solid #edf0f5;
          font-size: 12px;
          vertical-align: middle;
        }

        .applicants-table tr:last-child td {
          border-bottom: none;
        }

        .applicant-expand {
          width: 100%;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #285bb8;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 650;
        }

        .applicant-detail {
          background: #f8fafc;
          padding: 18px;
          border-top: 1px solid #edf0f5;
        }

        .applicant-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .applicant-skill {
          display: inline-block;
          padding: 6px 9px;
          margin: 5px 5px 0 0;
          background: #edf3fc;
          color: #285bb8;
          border-radius: 6px;
          font-size: 11px;
        }

        .applicant-skill.missing {
          background: #fff0f0;
          color: #bd4141;
        }

        @media (max-width: 900px) {
          .applicants-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 560px) {
          .applicants-summary {
            grid-template-columns: 1fr 1fr;
            gap: 9px;
          }

          .applicant-detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Heading */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "#285bb8",
              fontSize: 10,
              fontWeight: 750,
              letterSpacing: "1.3px",
              marginBottom: 7,
            }}
          >
            CANDIDATE MANAGEMENT
          </div>

          <h1
            style={{
              color: "#172b49",
              fontSize: 26,
              margin: 0,
              fontWeight: 750,
            }}
          >
            Applicants
          </h1>

          <p
            style={{
              color: "#7a8798",
              fontSize: 12,
              marginTop: 7,
            }}
          >
            View candidates who have applied to your job openings.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchApplicants}
          disabled={loading}
          style={{
            ...buttonStyle,
            color: "#285bb8",
            background: "#eef3fb",
            border: "none",
          }}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: 16,
            padding: 13,
            borderRadius: 8,
            background: "#fff1f1",
            color: "#b42318",
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="applicants-summary">
        {[
          {
            label: "Total Applicants",
            value: applicants.length,
            icon: Users,
            color: "#285bb8",
          },
          {
            label: "Qualified",
            value: qualifiedCount,
            icon: CheckCircle2,
            color: "#16804a",
          },
          {
            label: "Not Selected",
            value: notSelectedCount,
            icon: XCircle,
            color: "#bd4141",
          },
          {
            label: "Pending",
            value: pendingCount,
            icon: Clock3,
            color: "#a16a17",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div style={cardStyle} key={item.label}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
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

      {/* Screening information */}
      <div
        style={{
          background: "#eef4ff",
          border: "1px solid #dce8fb",
          borderRadius: 10,
          padding: "13px 16px",
          marginBottom: 18,
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <CheckCircle2 size={18} color="#285bb8" />

        <p
          style={{
            color: "#345477",
            fontSize: 12,
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          AI screening threshold: <strong>{THRESHOLD}%</strong>.
          Candidates scoring {THRESHOLD}% or above are qualified.
          Screening decisions are generated automatically.
        </p>
      </div>

      {/* Search and filter */}
      <div
        style={{
          ...cardStyle,
          padding: 13,
          display: "flex",
          gap: 11,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 17,
        }}
      >
        <div style={{ flex: "1 1 230px", position: "relative" }}>
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
          value={decisionFilter}
          onChange={(event) => setDecisionFilter(event.target.value)}
          style={{
            padding: "11px 12px",
            border: "1px solid #dce3ed",
            borderRadius: 8,
            color: "#40536b",
            fontSize: 12,
            background: "#fff",
            minWidth: 155,
          }}
        >
          <option value="all">All decisions</option>
          <option value="qualified">Qualified</option>
          <option value="not_selected">Not Selected</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Applicants table */}
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
            gap: 10,
          }}
        >
          <h2
            style={{
              color: "#172b49",
              fontSize: 15,
              margin: 0,
            }}
          >
            Applicant List
          </h2>

          <span style={{ color: "#8290a3", fontSize: 11 }}>
            {filteredApplicants.length} results
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
            <RefreshCw size={23} className="animate-spin" />
            <p>Loading applicants...</p>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div
            style={{
              padding: "45px 20px",
              textAlign: "center",
            }}
          >
            <Users
              size={32}
              color="#9aa7b8"
              style={{ marginBottom: 10 }}
            />

            <h3
              style={{
                color: "#34445a",
                fontSize: 15,
                margin: "0 0 7px",
              }}
            >
              No applicants found
            </h3>

            <p
              style={{
                color: "#8793a3",
                fontSize: 12,
                margin: 0,
              }}
            >
              Applicants will appear here when candidates apply to your jobs.
            </p>
          </div>
        ) : (
          <div className="applicants-table-wrap">
            <table className="applicants-table">
              <thead>
                <tr>
                  <th>CANDIDATE</th>
                  <th>JOB</th>
                  <th>APPLIED ON</th>
                  <th>AI MATCH</th>
                  <th>DECISION</th>
                  <th>DETAILS</th>
                </tr>
              </thead>

              <tbody>
                {filteredApplicants.map((applicant) => {
                  const decision = getDecision(applicant);
                  const details = decisionDetails(decision);
                  const DecisionIcon = details.icon;
                  const isExpanded =
                    expandedId === applicant.application_id;

                  return (
                    <tr key={applicant.application_id}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: "50%",
                              background: "#edf3fc",
                              color: "#285bb8",
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                              fontWeight: 700,
                            }}
                          >
                            {(applicant.candidate?.name || "C")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <div
                              style={{
                                color: "#203653",
                                fontWeight: 700,
                                fontSize: 12,
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
                          </div>
                        </div>
                      </td>

                      <td>
                        <div
                          style={{
                            color: "#34445a",
                            fontWeight: 650,
                          }}
                        >
                          {applicant.job?.title || "Unknown job"}
                        </div>

                        <div
                          style={{
                            color: "#8290a3",
                            fontSize: 10,
                            marginTop: 4,
                          }}
                        >
                          {applicant.job?.company_name || ""}
                        </div>
                      </td>

                      <td>{formatDate(applicant.applied_at)}</td>

                      <td>
                        <span
                          style={{
                            color:
                              applicant.match_score == null
                                ? "#8290a3"
                                : applicant.match_score >= THRESHOLD
                                ? "#16804a"
                                : "#bd4141",
                            fontWeight: 750,
                            fontSize: 13,
                          }}
                        >
                          {applicant.match_score == null
                            ? "Pending"
                            : `${Number(applicant.match_score).toFixed(1)}%`}
                        </span>
                      </td>

                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "6px 9px",
                            borderRadius: 20,
                            background: details.background,
                            color: details.color,
                            fontSize: 10,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <DecisionIcon size={12} />
                          {details.label}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="applicant-expand"
                          onClick={() =>
                            setExpandedId(
                              isExpanded
                                ? null
                                : applicant.application_id
                            )
                          }
                        >
                          {isExpanded ? "Hide" : "View"}
                          {isExpanded ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Expanded applicant details */}
            {filteredApplicants.map((applicant) => {
              if (expandedId !== applicant.application_id) {
                return null;
              }

              return (
                <div
                  className="applicant-detail"
                  key={`details-${applicant.application_id}`}
                >
                  <div className="applicant-detail-grid">
                    <div>
                      <h3
                        style={{
                          color: "#203653",
                          fontSize: 13,
                          margin: "0 0 10px",
                        }}
                      >
                        <CheckCircle2
                          size={15}
                          style={{
                            display: "inline",
                            verticalAlign: "middle",
                            marginRight: 6,
                          }}
                        />
                        Matched Skills
                      </h3>

                      {(applicant.matched_skills || []).length > 0 ? (
                        applicant.matched_skills.map((skill, index) => (
                          <span
                            className="applicant-skill"
                            key={`${skill}-${index}`}
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p
                          style={{
                            color: "#8290a3",
                            fontSize: 12,
                          }}
                        >
                          No matched skills recorded.
                        </p>
                      )}
                    </div>

                    <div>
                      <h3
                        style={{
                          color: "#203653",
                          fontSize: 13,
                          margin: "0 0 10px",
                        }}
                      >
                        <XCircle
                          size={15}
                          style={{
                            display: "inline",
                            verticalAlign: "middle",
                            marginRight: 6,
                          }}
                        />
                        Missing Skills
                      </h3>

                      {(applicant.missing_skills || []).length > 0 ? (
                        applicant.missing_skills.map((skill, index) => (
                          <span
                            className="applicant-skill missing"
                            key={`${skill}-${index}`}
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p
                          style={{
                            color: "#8290a3",
                            fontSize: 12,
                          }}
                        >
                          No missing skills recorded.
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      marginTop: 18,
                      color: "#718096",
                      fontSize: 11,
                    }}
                  >
                    <span>
                      Application ID: #{applicant.application_id}
                    </span>

                    <span>·</span>

                    <span>
                      Screening threshold: {THRESHOLD}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
