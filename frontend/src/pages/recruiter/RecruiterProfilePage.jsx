
import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  ShieldCheck,
  CalendarDays,
  RefreshCw,
  BriefcaseBusiness,
} from "lucide-react";
import api from "../../services/api";

export default function RecruiterProfilePage() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/auth/me");

      const profile =
        response.data.user || response.data;

      setUser(profile);

      // Keep the local user information in sync.
      localStorage.setItem("user", JSON.stringify(profile));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to refresh profile information."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  function formatDate(value) {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const profileFields = [
    {
      label: "Full Name",
      value: user?.name || "Not available",
      Icon: UserRound,
    },
    {
      label: "Email Address",
      value: user?.email || "Not available",
      Icon: Mail,
    },
    {
      label: "Account Role",
      value: user?.role
        ? user.role.charAt(0).toUpperCase() +
          user.role.slice(1)
        : "Recruiter",
      Icon: ShieldCheck,
    },
    {
      label: "Member Since",
      value: formatDate(user?.created_at),
      Icon: CalendarDays,
    },
  ];

  return (
    <div style={{ color: "#26364b" }}>
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
            ACCOUNT INFORMATION
          </div>

          <h1
            style={{
              fontSize: 26,
              color: "#172b49",
              margin: 0,
              fontWeight: 750,
            }}
          >
            My Profile
          </h1>

          <p
            style={{
              color: "#7a8798",
              fontSize: 12,
              marginTop: 7,
            }}
          >
            View your recruiter account information.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchProfile}
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
            background: "#fff6e5",
            color: "#a16a17",
            borderRadius: 8,
            fontSize: 12,
          }}
        >
          {error}
          <div style={{ marginTop: 5 }}>
            Showing the saved account information, if available.
          </div>
        </div>
      )}

      {/* Profile header */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e7ebf1",
          borderRadius: 12,
          padding: 24,
          marginTop: 22,
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            background: "#eaf1ff",
            color: "#285bb8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 25,
            fontWeight: 750,
          }}
        >
          {(user?.name || "R").charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 180 }}>
          <h2
            style={{
              color: "#172b49",
              fontSize: 20,
              margin: "0 0 6px",
            }}
          >
            {user?.name || "Recruiter"}
          </h2>

          <p
            style={{
              color: "#7a8798",
              fontSize: 12,
              margin: 0,
            }}
          >
            {user?.email || "Email not available"}
          </p>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              marginTop: 11,
              padding: "5px 10px",
              borderRadius: 20,
              background: "#eaf7ef",
              color: "#16804a",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={12} />
            Recruiter Account
          </span>
        </div>
      </div>

      {/* Account details */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e7ebf1",
          borderRadius: 12,
          marginTop: 18,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #edf0f5",
          }}
        >
          <h3
            style={{
              color: "#172b49",
              fontSize: 15,
              margin: 0,
            }}
          >
            Personal Information
          </h3>

          <p
            style={{
              color: "#8290a3",
              fontSize: 11,
              margin: "5px 0 0",
            }}
          >
            Your registered account details.
          </p>
        </div>

        <div style={{ padding: "5px 20px" }}>
          {profileFields.map((field, index) => {
            const Icon = field.Icon;

            return (
              <div
                key={field.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 13,
                  padding: "17px 0",
                  borderBottom:
                    index !== profileFields.length - 1
                      ? "1px solid #edf0f5"
                      : "none",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 9,
                    background: "#f1f5fb",
                    color: "#285bb8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={18} />
                </div>

                <div>
                  <div
                    style={{
                      color: "#8290a3",
                      fontSize: 10,
                      marginBottom: 5,
                    }}
                  >
                    {field.label}
                  </div>

                  <div
                    style={{
                      color: "#34445a",
                      fontSize: 13,
                      fontWeight: 650,
                    }}
                  >
                    {field.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account security */}
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e7ebf1",
          borderRadius: 12,
          padding: 18,
          marginTop: 18,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <BriefcaseBusiness size={20} color="#285bb8" />

        <div>
          <strong
            style={{
              color: "#34445a",
              fontSize: 12,
            }}
          >
            TalentLens Recruiter Workspace
          </strong>

          <p
            style={{
              color: "#8290a3",
              fontSize: 11,
              lineHeight: 1.6,
              margin: "6px 0 0",
            }}
          >
            Your recruiter account provides access to job
            management, applicant information, AI screening
            results, and interview reports.
          </p>
        </div>
      </div>

      {loading && (
        <p
          style={{
            color: "#8290a3",
            fontSize: 11,
            marginTop: 12,
          }}
        >
          Refreshing profile information...
        </p>
      )}
    </div>
  );
}
