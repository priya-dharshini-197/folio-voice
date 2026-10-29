import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PublicPortfolioPage from './pages/public/PublicPortfolioPage';

import OverviewPage from './pages/dashboard/OverviewPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import ProjectsPage from './pages/dashboard/ProjectsPage';
import SkillsPage from './pages/dashboard/SkillsPage';
import CaseStudiesPage from './pages/dashboard/CaseStudiesPage';
import TestimonialsPage from './pages/dashboard/TestimonialsPage';
import MessagesPage from './pages/dashboard/MessagesPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import IntegrationsPage from './pages/dashboard/IntegrationsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/u/:username" element={<PublicPortfolioPage />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="skills" element={<SkillsPage />} />
            <Route path="case-studies" element={<CaseStudiesPage />} />
            <Route path="testimonials" element={<TestimonialsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
