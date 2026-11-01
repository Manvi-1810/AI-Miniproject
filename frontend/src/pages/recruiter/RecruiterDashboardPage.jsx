
import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  RefreshCw,
  TrendingUp,
  BrainCircuit,
} from "lucide-react";
import api from "../../services/api";

export default function RecruiterDashboardPage() {
  const [stats, setStats] = useState({
    total_jobs: 0,
    active_jobs: 0,
    inactive_jobs: 0,
    total_applicants: 0,
    qualified: 0,
    not_selected: 0,
    pending_screening: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/recruiter/dashboard");

      setStats({
        total_jobs: response.data.total_jobs ?? 0,
        active_jobs: response.data.active_jobs ?? 0,
        inactive_jobs: response.data.inactive_jobs ?? 0,
        total_applicants: response.data.total_applicants ?? 0,
        qualified: response.data.qualified ?? 0,
        not_selected: response.data.not_selected ?? 0,
        pending_screening: response.data.pending_screening ?? 0,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cards = [
    {
      label: "Total Jobs",
      value: stats.total_jobs,
      description: `${stats.active_jobs} active · ${stats.inactive_jobs} inactive`,
      Icon: BriefcaseBusiness,
      color: "#285bb8",
      background: "#eef4ff",
    },
    {
      label: "Total Applicants",
      value: stats.total_applicants,
      description: "Candidates who applied",
      Icon: Users,
      color: "#8b5cc7",
      background: "#f4edff",
    },
    {
      label: "Qualified Candidates",
      value: stats.qualified,
      description: "Match score 85% or above",
      Icon: CheckCircle2,
      color: "#16804a",
      background: "#eaf7ef",
    },
    {
      label: "Not Selected",
      value: stats.not_selected,
      description: "Match score below 85%",
      Icon: XCircle,
      color: "#bd4141",
      background: "#fff0f0",
    },
    {
      label: "Pending Screening",
      value: stats.pending_screening,
      description: "Awaiting evaluation",
      Icon: Clock3,
      color: "#a16a17",
      background: "#fff6e5",
    },
  ];

  const evaluated = stats.qualified + stats.not_selected;

  const qualificationRate =
    evaluated > 0
      ? Math.round((stats.qualified / evaluated) * 100)
      : 0;

  return (
    <div style={{ color: "#26364b" }}>
      <style>{`
        .recruiter-dashboard-cards {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 24px;
        }

        @media (max-width: 900px) {
          .recruiter-dashboard-cards {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 550px) {
          .recruiter-dashboard-cards {
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
            RECRUITER WORKSPACE
          </div>

          <h1
            style={{
              fontSize: 26,
              color: "#172b49",
              margin: 0,
              fontWeight: 750,
            }}
          >
            Dashboard
          </h1>

          <p
            style={{
              color: "#7a8798",
              fontSize: 12,
              marginTop: 7,
            }}
          >
            Manage recruitment activities and monitor AI-powered screening.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboard}
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
            marginTop: 18,
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

      {/* Statistics */}
      <div className="recruiter-dashboard-cards">
        {cards.map((card) => {
          const Icon = card.Icon;

          return (
            <div
              key={card.label}
              style={{
                background: "#fff",
                border: "1px solid #e7ebf1",
                borderRadius: 12,
                padding: 19,
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
                    fontWeight: 650,
                  }}
                >
                  {card.label}
                </span>

                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: card.background,
                    color: card.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={19} />
                </div>
              </div>

              <div
                style={{
                  color: "#172b49",
                  fontSize: 27,
                  fontWeight: 750,
                  marginTop: 15,
                }}
              >
                {loading ? "—" : card.value}
              </div>

              <p
                style={{
                  color: "#8290a3",
                  fontSize: 10,
                  margin: "6px 0 0",
                }}
              >
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* AI screening overview */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e7ebf1",
          borderRadius: 12,
          padding: 20,
          marginTop: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 17,
          }}
        >
          <BrainCircuit size={21} color="#285bb8" />

          <div>
            <h2
              style={{
                color: "#172b49",
                fontSize: 15,
                margin: 0,
              }}
            >
              AI Screening Overview
            </h2>

            <p
              style={{
                color: "#8290a3",
                fontSize: 10,
                margin: "5px 0 0",
              }}
            >
              Candidate evaluation based on the 85% threshold.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 9,
          }}
        >
          <span style={{ color: "#16804a", fontSize: 11 }}>
            Qualified: {stats.qualified}
          </span>

          <span style={{ color: "#bd4141", fontSize: 11 }}>
            Not Selected: {stats.not_selected}
          </span>
        </div>

        <div
          style={{
            height: 11,
            background: "#edf0f5",
            borderRadius: 20,
            overflow: "hidden",
            display: "flex",
          }}
        >
          <div
            style={{
              width: `${qualificationRate}%`,
              background: "#16804a",
              transition: "width .3s ease",
            }}
          />

          <div
            style={{
              flex: 1,
              background: "#d96b6b",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 10,
            color: "#8290a3",
            fontSize: 10,
          }}
        >
          <span>{qualificationRate}% qualification rate</span>
          <span>{evaluated} evaluated applicants</span>
        </div>
      </div>

      {loading && (
        <p
          style={{
            color: "#8290a3",
            fontSize: 11,
            marginTop: 15,
          }}
        >
          Loading dashboard statistics...
        </p>
      )}
    </div>
  );
}
