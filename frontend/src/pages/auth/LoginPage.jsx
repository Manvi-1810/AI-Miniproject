import { useState } from "react";
import {
  Eye,
  EyeOff,
  BrainCircuit,
  ArrowLeft,
  LoaderCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);
    setMessage("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: email.trim(),
        password: password,
      });

      const { access_token, user } = response.data;

      if (!access_token || !user) {
        throw new Error("Invalid response received from the server.");
      }

      // Save authentication details
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect according to account role
      if (user.role === "candidate") {
        navigate("/candidate/dashboard", { replace: true });
      } else if (user.role === "recruiter") {
        navigate("/", { replace: true });
      } else {
        setMessage("Your account role is not recognized.");
      }

    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        error.response?.data?.message ||
        "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">

      {/* Back to home */}
      <Link to="/" className="auth-back">
        
        Back home
      </Link>

      <section className="auth-card">

        {/* Brand */}
        <Link to="/" className="auth-brand">
          <span className="brand-icon">
            <BrainCircuit />
          </span>
          <strong>TalentLens</strong>
        </Link>

        {/* Heading */}
        <div className="auth-heading">
          <h1>Welcome back</h1>
          <p>Sign in to your TalentLens account.</p>
        </div>

        {/* Login form */}
        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
        >

          {/* Email */}
          <div className="form-field">
            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              disabled={loading}
              aria-invalid={Boolean(errors.email)}
              onChange={(event) => {
                setEmail(event.target.value);

                setErrors((old) => ({
                  ...old,
                  email: "",
                }));

                setMessage("");
              }}
            />

            {errors.email && (
              <p className="field-error">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="form-field">
            <label htmlFor="password">
              Password
            </label>

            <div className="password-input">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                disabled={loading}
                aria-invalid={Boolean(errors.password)}
                onChange={(event) => {
                  setPassword(event.target.value);

                  setErrors((old) => ({
                    ...old,
                    password: "",
                  }));

                  setMessage("");
                }}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((old) => !old)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="field-error">
                {errors.password}
              </p>
            )}
          </div>

          {/* Login button */}
          <button
            className="button button-primary auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle size={17} />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>

          {/* Error message */}
          {message && (
            <p
              className="form-notice"
              role="alert"
              style={{
                background: "#fff1f1",
                color: "#b4232d",
              }}
            >
              {message}
            </p>
          )}

        </form>

        {/* Register link */}
        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">
            Create an account
          </Link>
        </p>

      </section>
    </main>
  );
}