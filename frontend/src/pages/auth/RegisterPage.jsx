import { useState } from "react";
import { Eye, EyeOff, BrainCircuit, UserRound, BriefcaseBusiness } from "lucide-react";
import { Link } from "react-router-dom";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const [role, setRole] = useState("candidate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    if (name.trim().length < 2) {
      nextErrors.name = "Enter a name with at least 2 characters.";
    }

    if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (
      password.length < 8 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password)
    ) {
      nextErrors.password =
        "Use 8+ characters with uppercase, lowercase and a number.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirm your password.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (!acceptedTerms) {
      nextErrors.terms = "Please accept the terms to continue.";
    }

    setErrors(nextErrors);
    setMessage(
      Object.keys(nextErrors).length === 0
        ? `Validation successful for ${role}. Real account creation will be connected in Phase 3.`
        : ""
    );
  }

  return (
    <main className="auth-page">
      <Link to="/" className="auth-back">← Back home</Link>

      <section className="auth-card">
        <Link to="/" className="auth-brand">
          <span className="brand-icon"><BrainCircuit /></span>
          <strong>TalentLens</strong>
        </Link>

        <div className="auth-heading">
          <h1>Create your account</h1>
          <p>Choose your role and enter your details.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <fieldset className="role-fieldset">
            <legend>I am joining as a</legend>
            <div className="role-options">
              <button
                type="button"
                className={`role-option ${role === "candidate" ? "selected" : ""}`}
                onClick={() => setRole("candidate")}
                aria-pressed={role === "candidate"}
              >
                <UserRound size={20} /> Candidate
              </button>
              <button
                type="button"
                className={`role-option ${role === "recruiter" ? "selected" : ""}`}
                onClick={() => setRole("recruiter")}
                aria-pressed={role === "recruiter"}
              >
                <BriefcaseBusiness size={20} /> Recruiter
              </button>
            </div>
          </fieldset>

          <div className="form-field">
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="register-password">Password</label>
            <div className="password-input">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((old) => !old)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="form-hint">At least 8 characters, including uppercase, lowercase and a number.</p>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="confirm-password">Confirm password</label>
            <div className="password-input">
              <input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm((old) => !old)}
                aria-label={showConfirm ? "Hide confirmation" : "Show confirmation"}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="field-error">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="terms-field">
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            <label htmlFor="terms">I agree to the terms and privacy policy.</label>
          </div>
          {errors.terms && <p className="field-error">{errors.terms}</p>}

          <button className="button button-primary auth-submit" type="submit">
            Create account
          </button>

          {message && <p className="form-notice" role="status">{message}</p>}
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}