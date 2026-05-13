import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// =======================
// Candidate Panel Imports
// =======================
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Contests from './pages/Contests';
import ContestDetails from './pages/ContestDetails';
import CodingWorkspace from './pages/CodingWorkspace';
import ContestResults from './pages/ContestResults';
import ContestLeaderboard from './pages/ContestLeaderboard';
import Leaderboard from './pages/Leaderboard';

import OAList from './pages/OAList';
import OADetails from './pages/OADetails';
import OAPermissionCheck from './pages/OAPermissionCheck';
import OAWorkspace from './pages/OAWorkspace';
import OASubmitted from './pages/OASubmitted';
import OAReport from './pages/OAReport';

import InterviewList from './pages/InterviewList';
import InterviewInstructions from './pages/InterviewInstructions';
import InterviewRoom from './pages/InterviewRoom';
import InterviewCompleted from './pages/InterviewCompleted';
import InterviewReport from './pages/InterviewReport';

import Results from './pages/Results';
import ResultDetails from './pages/ResultDetails';

import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';

// =======================
// Landing Page Import
// =======================
import LandingPage from './pages/LandingPage';

// =======================
// Admin Panel Imports
// =======================
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import AdminContests from './pages/admin/Contests';
import OATests from './pages/admin/OATests';
import AdminInterviews from './pages/admin/Interviews';
import Problems from './pages/admin/Problems';
import Analytics from './pages/admin/Analytics';
import AdminSettings from './pages/admin/Settings';

function App() {
  return (
    <Router>
      <Routes>
        {/* =======================
            PUBLIC ROUTES
        ======================= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* =======================
            CANDIDATE PANEL ROUTES
        ======================= */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Contest Module */}
        <Route path="/contests" element={<Contests />} />
        <Route path="/contests/:id" element={<ContestDetails />} />
        <Route
          path="/workspace/:contestId/:questionId"
          element={<CodingWorkspace />}
        />
        <Route path="/results/contest/:id" element={<ContestResults />} />
        <Route
          path="/leaderboard/contest/:id"
          element={<ContestLeaderboard />}
        />

        {/* General Leaderboard */}
        <Route path="/leaderboard" element={<Leaderboard />} />

        {/* OA Module */}
        <Route path="/oa" element={<OAList />} />
        <Route path="/oa/:id" element={<OADetails />} />
        <Route
          path="/oa/:id/permissions"
          element={<OAPermissionCheck />}
        />
        <Route path="/oa/:id/workspace" element={<OAWorkspace />} />
        <Route path="/oa/:id/submitted" element={<OASubmitted />} />
        <Route path="/results/oa/:id" element={<OAReport />} />

        {/* AI Interview Module */}
        <Route path="/interviews" element={<InterviewList />} />
        <Route
          path="/interviews/instructions"
          element={<InterviewInstructions />}
        />
        <Route path="/interviews/room" element={<InterviewRoom />} />
        <Route
          path="/interviews/completed"
          element={<InterviewCompleted />}
        />
        <Route
          path="/results/interview/:id"
          element={<InterviewReport />}
        />

        {/* Results Module */}
        <Route path="/results" element={<Results />} />
        <Route path="/results/:type/:id" element={<ResultDetails />} />

        {/* Profile Module */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />

        {/* =======================
            ADMIN PANEL ROUTES
        ======================= */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="contests" element={<AdminContests />} />
          <Route path="oa-tests" element={<OATests />} />
          <Route path="interviews" element={<AdminInterviews />} />
          <Route path="problems" element={<Problems />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;