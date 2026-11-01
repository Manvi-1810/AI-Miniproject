
import { useState } from "react";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";
import api from "../../services/api";

export default function RecruiterSettingsPage() {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFeedback({ type: "", message: "" });
  }

  function togglePassword(field) {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setFeedback({ type: "", message: "" });

    if (
      !form.current_password ||
      !form.new_password ||
      !form.confirm_password
    ) {
      setFeedback({
        type: "error",
        message: "Please fill in all password fields.",
      });
      return;
    }

    if (form.new_password.length < 8) {
      setFeedback({
        type: "error",
        message: "New password must contain at least 8 characters.",
      });
      return;
    }

    if (form.new_password !== form.confirm_password) {
      setFeedback({
        type: "error",
        message: "New password and confirm password do not match.",
      });
      return;
    }

    if (form.current_password === form.new_password) {
      setFeedback({
        type: "error",
        message: "New password must be different from current password.",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/change-password", {
        current_password: form.current_password,
        new_password: form.new_password,
      });

      setFeedback({
        type: "success",
        message:
          response.data.message || "Password changed successfully.",
      });

      setForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });

      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          "Unable to change password. Please check your current password.",
      });
    } finally {
      setLoading(false);
    }
  }

  function renderPasswordField({
    label,
    name,
    placeholder,
    visibilityKey,
  }) {
    const visible = showPasswords[visibilityKey];

    return (
      <div className="settings-password-field">
        <label
          htmlFor={name}
          style={{
            display: "block",
            color: "#34445a",
            fontSize: 12,
            fontWeight: 650,
            marginBottom: 8,
          }}
        >
          {label}
        </label>

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <input
            id={name}
            name={name}
            type={visible ? "text" : "password"}
            value={form[name]}
            onChange={handleChange}
            placeholder={placeholder}
            autoComplete="new-password"
            className="settings-password-input"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px 44px 12px 13px",
              border: "1px solid #dce3ed",
              borderRadius: 8,
              fontSize: 12,
              outline: "none",
              color: "#34445a",
              background: "#fff",
            }}
          />

          <button
            type="button"
            onClick={() => togglePassword(visibilityKey)}
            aria-label={visible ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: 12,
              border: "none",
              background: "transparent",
              color: "#8290a3",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: 3,
            }}
          >
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: "#26364b" }}>
      {/* Heading */}
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
          ACCOUNT PREFERENCES
        </div>

        <h1
          style={{
            fontSize: 26,
            color: "#172b49",
            margin: 0,
            fontWeight: 750,
          }}
        >
          Settings
        </h1>

        <p
          style={{
            color: "#7a8798",
            fontSize: 12,
            marginTop: 7,
          }}
        >
          Manage your account security and password.
        </p>
      </div>

      {/* Security information */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 13,
          padding: 17,
          background: "#eef4ff",
          border: "1px solid #dce8fb",
          borderRadius: 12,
          marginTop: 22,
        }}
      >
        <ShieldCheck size={22} color="#285bb8" />

        <div>
          <strong
            style={{
              color: "#28518a",
              fontSize: 12,
            }}
          >
            Keep your account secure
          </strong>

          <p
            style={{
              color: "#58708f",
              fontSize: 11,
              lineHeight: 1.6,
              margin: "5px 0 0",
            }}
          >
            Use a strong password with at least 8 characters.
            Never share your password with anyone.
          </p>
        </div>
      </div>

      {/* Change password card */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e7ebf1",
          borderRadius: 12,
          marginTop: 18,
          overflow: "hidden",
          maxWidth: 650,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "18px 20px",
            borderBottom: "1px solid #edf0f5",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 9,
              background: "#eef4ff",
              color: "#285bb8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LockKeyhole size={19} />
          </div>

          <div>
            <h2
              style={{
                color: "#172b49",
                fontSize: 15,
                margin: 0,
              }}
            >
              Change Password
            </h2>

            <p
              style={{
                color: "#8290a3",
                fontSize: 11,
                margin: "5px 0 0",
              }}
            >
              Update your recruiter account password.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="settings-password-form"
          style={{
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 17,
          }}
        >
          {renderPasswordField({
            label: "Current Password",
            name: "current_password",
            placeholder: "Enter your current password",
            visibilityKey: "current",
          })}

          {renderPasswordField({
            label: "New Password",
            name: "new_password",
            placeholder: "Enter your new password",
            visibilityKey: "new",
          })}

          {renderPasswordField({
            label: "Confirm New Password",
            name: "confirm_password",
            placeholder: "Re-enter your new password",
            visibilityKey: "confirm",
          })}

          {/* Feedback */}
          {feedback.message && (
            <div
              role="alert"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                padding: 12,
                borderRadius: 8,
                background:
                  feedback.type === "success"
                    ? "#eaf7ef"
                    : "#fff0f0",
                color:
                  feedback.type === "success"
                    ? "#16804a"
                    : "#bd4141",
                fontSize: 11,
                lineHeight: 1.5,
              }}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}

              <span>{feedback.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              alignSelf: "flex-start",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "11px 17px",
              border: "none",
              borderRadius: 8,
              background: loading ? "#8da9d8" : "#285bb8",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            <Save size={15} />
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
