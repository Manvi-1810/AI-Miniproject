import { useState } from "react";
import {
  ArrowLeft,
  BrainCircuit,
  UserRound,
  Bell,
  ShieldCheck,
  LockKeyhole,
  LogOut,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function CandidateSettingsPage() {
  const navigate = useNavigate();

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const [emailNotifications, setEmailNotifications] = useState(
    localStorage.getItem("email_notifications") !== "false"
  );

  const [applicationUpdates, setApplicationUpdates] = useState(
    localStorage.getItem("application_updates") !== "false"
  );

  const [saved, setSaved] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function savePreferences() {
    localStorage.setItem(
      "email_notifications",
      String(emailNotifications)
    );

    localStorage.setItem(
      "application_updates",
      String(applicationUpdates)
    );

    setSaved(true);
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  async function handlePasswordUpdate(event) {
    event.preventDefault();

    setPasswordError("");
    setPasswordMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please complete all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await api.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setPasswordMessage(
        response.data.message || "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
          "Unable to change password. Please try again."
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="candidate-settings-page">
      <header className="settings-header">
        <button
          className="settings-back-button"
          onClick={() => navigate("/candidate/dashboard")}
        >
          <ArrowLeft size={17} />
          Dashboard
        </button>

        <div className="settings-brand">
          <span><BrainCircuit size={22} /></span>
          <div>
            <strong>TalentLens</strong>
            <small>Recruitment Intelligence</small>
          </div>
        </div>

        <span className="settings-workspace-label">
          Candidate Workspace
        </span>
      </header>

      <main className="settings-content">
        <div className="settings-page-heading">
          <span className="settings-eyebrow">ACCOUNT PREFERENCES</span>
          <h1>Settings</h1>
          <p>Manage your account preferences and security.</p>
        </div>

        <section className="settings-card">
          <div className="settings-card-heading">
            <UserRound size={19} />
            <div>
              <h2>Account Information</h2>
              <p>Your registered account details.</p>
            </div>
          </div>

          <div className="settings-information-grid">
            <div>
              <label>Full Name</label>
              <strong>{user?.name || "Not available"}</strong>
            </div>

            <div>
              <label>Email Address</label>
              <strong>{user?.email || "Not available"}</strong>
            </div>

            <div>
              <label>Account Type</label>
              <strong>Candidate</strong>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-heading">
            <Bell size={19} />
            <div>
              <h2>Notification Preferences</h2>
              <p>Choose which updates you want to receive.</p>
            </div>
          </div>

          <div className="settings-option">
            <div>
              <strong>Email Notifications</strong>
              <p>Receive relevant updates through email.</p>
            </div>

            <label className="settings-switch">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(event) => {
                  setEmailNotifications(event.target.checked);
                  setSaved(false);
                }}
              />
              <span />
            </label>
          </div>

          <div className="settings-option">
            <div>
              <strong>Application Updates</strong>
              <p>Receive notifications about your application status.</p>
            </div>

            <label className="settings-switch">
              <input
                type="checkbox"
                checked={applicationUpdates}
                onChange={(event) => {
                  setApplicationUpdates(event.target.checked);
                  setSaved(false);
                }}
              />
              <span />
            </label>
          </div>

          <div className="settings-save-area">
            <button
              className="settings-save-button"
              onClick={savePreferences}
            >
              <Save size={16} />
              Save Preferences
            </button>

            {saved && (
              <span className="settings-saved-message">
                Preferences saved successfully.
              </span>
            )}
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-heading">
            <LockKeyhole size={19} />
            <div>
              <h2>Password & Security</h2>
              <p>Manage access to your account.</p>
            </div>
          </div>

          <div className="settings-security-row">
            <div>
              <strong>Change Password</strong>
              <p>Update your account password securely.</p>
            </div>

            <button
              type="button"
              className="settings-save-button"
              onClick={() => {
                setShowPasswordForm(!showPasswordForm);
                setPasswordError("");
                setPasswordMessage("");
              }}
            >
              {showPasswordForm ? (
                <>
                  Close <ChevronUp size={16} />
                </>
              ) : (
                <>
                  Update Password <ChevronDown size={16} />
                </>
              )}
            </button>
          </div>

          {showPasswordForm && (
            <form
              className="settings-password-form"
              onSubmit={handlePasswordUpdate}
            >
              <div className="settings-password-field">
                <label htmlFor="current-password">
                  Current Password
                </label>
                <div className="settings-password-input">
                  <input
                    id="current-password"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(event.target.value)
                    }
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    aria-label="Toggle current password visibility"
                  >
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="settings-password-field">
                <label htmlFor="new-password">
                  New Password
                </label>
                <div className="settings-password-input">
                  <input
                    id="new-password"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    aria-label="Toggle new password visibility"
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="settings-password-field">
                <label htmlFor="confirm-password">
                  Confirm New Password
                </label>
                <div className="settings-password-input">
                  <input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <p className="settings-password-hint">
                Your new password must contain at least 8 characters.
              </p>

              {passwordError && (
                <div className="settings-password-feedback error">
                  <AlertCircle size={17} />
                  {passwordError}
                </div>
              )}

              {passwordMessage && (
                <div className="settings-password-feedback success">
                  <CheckCircle2 size={17} />
                  {passwordMessage}
                </div>
              )}

              <button
                type="submit"
                className="settings-save-button"
                disabled={passwordLoading}
              >
                <LockKeyhole size={16} />
                {passwordLoading ? "Updating..." : "Save New Password"}
              </button>
            </form>
          )}

          {passwordMessage && !showPasswordForm && (
            <div className="settings-password-feedback success">
              <CheckCircle2 size={17} />
              {passwordMessage}
            </div>
          )}
        </section>

        <section className="settings-card settings-logout-card">
          <div className="settings-card-heading">
            <ShieldCheck size={19} />
            <div>
              <h2>Account Session</h2>
              <p>Sign out when you have finished using TalentLens.</p>
            </div>
          </div>

          <button
            className="settings-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </section>

        <footer className="settings-footer">
          TalentLens · IS026 Mini Project
        </footer>
      </main>
    </div>
  );
}