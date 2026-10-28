import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import DashboardPage from './features/dashboard/DashboardPage.jsx';
import ProjectsPage from './features/projects/ProjectsPage.jsx';
import InvoiceFormPage from './features/invoices/InvoiceFormPage.jsx';
import InvoiceHistoryPage from './features/invoices/InvoiceHistoryPage.jsx';
import InvoicePreviewPage from './features/invoices/InvoicePreviewPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication & Preview Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/invoice-preview" element={<InvoicePreviewPage />} />

          {/* Protected Routes inside AppLayout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="invoices" element={<InvoiceHistoryPage />} />
            <Route path="invoices/new" element={<InvoiceFormPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
