// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfileRouter from "./pages/ProfileRouter";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobsList from "./pages/JobsList";
import JobDetails from "./pages/JobDetails";
import Profile from "./pages/Profile";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import JobApplications from "./pages/JobApplications";
import Notifications from "./pages/Notifications";
import CandidateProfile from "./pages/CandidateProfile";
import CompanyPublicProfile from "./pages/CompanyPublicProfile";
export default function App() {
  return (
    <div className="app-root">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          
          <Route path="/jobs" element={<JobsList />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
<Route path="/candidates/:userId" element={<CandidateProfile />} />
<Route path="/companies/:userId" element={<CompanyPublicProfile />} />

          <Route
  path="/profile"
  element={
    <ProtectedRoute allowedRoles={["candidate", "recruiter", "admin"]}>
      <ProfileRouter />
    </ProtectedRoute>
  }
/>

          <Route
            path="/recruiter"
            element={
              <ProtectedRoute allowedRoles={["recruiter", "admin"]}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter/jobs/:jobId/applications"
            element={
              <ProtectedRoute allowedRoles={["recruiter", "admin"]}>
                <JobApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={["candidate", "recruiter", "admin"]}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<h2>404 - Page introuvable</h2>} />
        </Routes>
      </main>
    </div>
  );
}
