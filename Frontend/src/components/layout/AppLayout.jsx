import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppLayout() {
  const location = useLocation();

  const getPageTitle = (path) => {
    if (path === '/') return 'Dashboard Overview';
    if (path.startsWith('/projects')) return 'Project Management';
    if (path === '/invoices/new') return 'Create New Invoice';
    if (path.startsWith('/invoices')) return 'Invoice History';
    return 'Invoice Generator';
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Topbar title={title} />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

