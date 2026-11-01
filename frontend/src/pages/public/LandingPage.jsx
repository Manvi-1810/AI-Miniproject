import { ArrowRight, BrainCircuit, FileSearch, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <Link to="/" className="brand">
          <span className="brand-icon"><BrainCircuit /></span>
          <span className="brand-copy">
            <strong>TalentLens</strong>
            <small>Recruitment Intelligence</small>
          </span>
        </Link>

        <nav className="header-nav">
          <a href="#features">Features</a>
          <Link to="/login" className="nav-login">Login</Link>
          <Link to="/register" className="button button-primary">
            Get Started
          </Link>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">AI-POWERED RECRUITMENT</span>
          <h1>Better matches.<span> Clearer decisions.</span></h1>
          <p className="hero-description">
            Connect candidate skills with job opportunities.
            Understand matching results, identify skill gaps,
            and make recruitment more transparent.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="button button-primary">
              Get Started
            </Link>
            <Link to="/login" className="button button-secondary">
              Login to your account
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <BrainCircuit size={38} color="#3564c5" />
          <h2>Recruitment with clarity</h2>
          <p>Resume analysis, semantic matching and personalized skill-gap insights.</p>
          <div className="visual-row"><FileSearch /> Resume skill extraction</div>
          <div className="visual-row"><BrainCircuit /> Explainable AI matching</div>
          <div className="visual-row"><Users /> Candidate-focused feedback</div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading">
          <span className="section-kicker">OUR FEATURES</span>
          <h2>Built for recruiters and candidates</h2>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <FileSearch size={27} />
            <h3>Resume screening</h3>
            <p>Extract relevant skills and experience from resumes.</p>
          </article>
          <article className="feature-card">
            <BrainCircuit size={27} />
            <h3>Explainable matching</h3>
            <p>Understand matched skills and missing requirements.</p>
          </article>
          <article className="feature-card">
            <Users size={27} />
            <h3>Skill-gap feedback</h3>
            <p>Help candidates identify areas for improvement.</p>
          </article>
        </div>
      </section>

      <footer className="site-footer">
        <strong>TalentLens</strong>
        <span>IS026 Mini Project · 2026–27</span>
      </footer>
    </main>
  );
}