import { Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import FindJobsPage from "./pages/candidate/FindJobsPage";
import MyApplicationsPage from "./pages/candidate/MyApplicationsPage";
import MyResumePage from "./pages/candidate/MyResumePage";
import MyProfilePage from "./pages/candidate/MyProfilePage";
import AISkillMatchingPage from "./pages/candidate/AISkillMatchingPage";
import CandidateSettingsPage from "./pages/candidate/CandidateSettingsPage";

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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/candidate/dashboard"
        element={
          <CandidateRoute>
            <CandidateDashboard />
          </CandidateRoute>
        }
      />

      <Route
        path="/candidate/jobs"
        element={
          <CandidateRoute>
            <FindJobsPage />
          </CandidateRoute>
        }
      />

      <Route
        path="/candidate/applications"
        element={
          <CandidateRoute>
            <MyApplicationsPage />
          </CandidateRoute>
        }
      />

      <Route
        path="/candidate/resume"
        element={
          <CandidateRoute>
            <MyResumePage />
          </CandidateRoute>
        }
      />

      <Route
        path="/candidate/profile"
        element={
          <CandidateRoute>
            <MyProfilePage />
          </CandidateRoute>
        }
      />
      <Route
  path="/candidate/matching"
  element={
    <CandidateRoute>
      <AISkillMatchingPage />
    </CandidateRoute>
  }
/>

      <Route path="*" element={<Navigate to="/" replace />} />
      <Route
  path="/candidate/settings"
  element={
    <CandidateRoute>
      <CandidateSettingsPage />
    </CandidateRoute>
  }
/>
    </Routes>
  );
}