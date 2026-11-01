import { useEffect, useRef, useState } from "react";
import {
  UserRound,
  Mail,
  ShieldCheck,
  CalendarDays,
  RefreshCw,
  Camera,
  Trash2,
} from "lucide-react";
import api from "../../services/api";

export default function MyProfilePage() {
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [photo, setPhoto] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedPhoto = localStorage.getItem("candidate_profile_photo");
    if (savedPhoto) setPhoto(savedPhoto);
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/auth/me");
      setProfile(response.data.user || response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Please select an image smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = reader.result;
      setPhoto(image);
      localStorage.setItem("candidate_profile_photo", image);
      setError("");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function removePhoto() {
    setPhoto("");
    localStorage.removeItem("candidate_profile_photo");
  }

  return (
    <main className="profile-page">
      <div className="profile-container">

        <header className="profile-header">
          <div>
            <span className="profile-eyebrow">
              CANDIDATE ACCOUNT
            </span>
            <h1>My Profile</h1>
            <p>
              Manage your personal information and account details.
            </p>
          </div>

          <button
            className="profile-refresh-button"
            onClick={loadProfile}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </header>

        {loading ? (
          <div className="profile-message">
            Loading profile...
          </div>
        ) : error && !profile ? (
          <div className="profile-message profile-error">
            {error}
          </div>
        ) : (
          <>
            <section className="profile-identity-card">
              <div className="profile-photo-section">
                <div className="profile-photo">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Candidate profile"
                    />
                  ) : (
                    <UserRound size={52} />
                  )}
                </div>

                <div className="profile-photo-actions">
                  <button
                    className="profile-upload-button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    <Camera size={16} />
                    {photo ? "Change Photo" : "Upload Photo"}
                  </button>

                  {photo && (
                    <button
                      className="profile-remove-button"
                      onClick={removePhoto}
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoChange}
                  hidden
                />

                <span className="profile-photo-hint">
                  JPG, PNG or WEBP · Maximum 2 MB
                </span>
              </div>

              <div className="profile-identity-details">
                <span className="profile-identity-label">
                  CANDIDATE PROFILE
                </span>

                <h2>{profile?.name || "Candidate"}</h2>

                <p>
                  {profile?.email || "No email available"}
                </p>

                <span className="profile-role">
                  <ShieldCheck size={16} />
                  Candidate Account
                </span>
              </div>
            </section>

            {error && (
              <div className="profile-message profile-error">
                {error}
              </div>
            )}

            <section className="profile-details-card">
              <div className="profile-section-heading">
                <h2>Personal Information</h2>
                <p>Your registered account information.</p>
              </div>

              <div className="profile-details-grid">
                <div className="profile-detail">
                  <div className="profile-detail-label">
                    <UserRound size={17} />
                    Full Name
                  </div>
                  <strong>
                    {profile?.name || "Not provided"}
                  </strong>
                </div>

                <div className="profile-detail">
                  <div className="profile-detail-label">
                    <Mail size={17} />
                    Email Address
                  </div>
                  <strong>
                    {profile?.email || "Not provided"}
                  </strong>
                </div>

                <div className="profile-detail">
                  <div className="profile-detail-label">
                    <ShieldCheck size={17} />
                    Account Role
                  </div>
                  <strong>
                    {profile?.role || "Candidate"}
                  </strong>
                </div>

                <div className="profile-detail">
                  <div className="profile-detail-label">
                    <CalendarDays size={17} />
                    Member Since
                  </div>
                  <strong>
                    {profile?.created_at
                      ? new Date(
                          profile.created_at
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Not available"}
                  </strong>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}