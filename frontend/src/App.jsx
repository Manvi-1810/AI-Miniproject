
import { Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Candidate pages
import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import FindJobsPage from "./pages/candidate/FindJobsPage";
import MyApplicationsPage from "./pages/candidate/MyApplicationsPage";
import MyResumePage from "./pages/candidate/MyResumePage";
import MyProfilePage from "./pages/candidate/MyProfilePage";
import AISkillMatchingPage from "./pages/candidate/AISkillMatchingPage";
import CandidateSettingsPage from "./pages/candidate/CandidateSettingsPage";

// Recruiter pages
import ManageJobsPage from "./pages/recruiter/ManageJobsPage";
import ApplicantsPage from "./pages/recruiter/ApplicantsPage";
import ScreeningResultsPage from "./pages/recruiter/ScreeningResultsPage";
import AIInterviewResultsPage from "./pages/recruiter/AIInterviewResultsPage";
import RecruiterProfilePage from "./pages/recruiter/RecruiterProfilePage";
import RecruiterSettingsPage from "./pages/recruiter/RecruiterSettingsPage";
import RecruiterDashboardPage from "./pages/recruiter/RecruiterDashboardPage";

// Layouts
import CandidateLayout from "./components/candidate/CandidateLayout";
import RecruiterLayout from "./components/recruiter/RecruiterLayout";

// Candidate route protection
function CandidateRoute({ children }) {
  const token = localStorage.getItem("access_token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "candidate") {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Recruiter route protection
function RecruiterRoute({ children }) {
  const token = localStorage.getItem("access_token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "recruiter") {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Recruiter dashboard placeholder

// Temporary pages until we build their complete functionality
function RecruiterPlaceholder({ title }) {
  return (
    <section>
      <span style={{ color: "#285bb8", fontSize: 11, fontWeight: 750 }}>
        RECRUITER WORKSPACE
      </span>
      <h1 style={{ color: "#172b49", fontSize: 26 }}>
        {title}
      </h1>
      <p style={{ color: "#718096", fontSize: 13 }}>
        This page will be implemented next.
      </p>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Candidate workspace */}
      <Route
        path="/candidate"
        element={
          <CandidateRoute>
            <CandidateLayout />
          </CandidateRoute>
        }
      >
        <Route path="dashboard" element={<CandidateDashboard />} />
        <Route path="jobs" element={<FindJobsPage />} />
        <Route path="resume" element={<MyResumePage />} />
        <Route path="matching" element={<AISkillMatchingPage />} />
        <Route path="applications" element={<MyApplicationsPage />} />
        <Route path="profile" element={<MyProfilePage />} />
        <Route path="settings" element={<CandidateSettingsPage />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Recruiter workspace */}
      <Route
        path="/recruiter"
        element={
          <RecruiterRoute>
            <RecruiterLayout />
          </RecruiterRoute>
        }
      >
        <Route
  path="dashboard"
  element={<RecruiterDashboardPage />}
/>
        <Route
          path="jobs"
          element={<ManageJobsPage />}
        />

        <Route
          path="applicants"
          element={<ApplicantsPage />}
        />

        <Route
  path="screening"
  element={<ScreeningResultsPage />}
/>

        <Route
  path="interviews"
  element={<AIInterviewResultsPage />}
/>

        <Route
  path="profile"
  element={<RecruiterProfilePage />}
/>
        <Route
  path="settings"
  element={<RecruiterSettingsPage />}
/>

        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
