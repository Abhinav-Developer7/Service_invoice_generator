import React, { useState, useEffect, useCallback } from 'react';
import { projectApi } from '../../api/projectApi.js';
import DataTable from '../../components/common/DataTable.jsx';
import Button from '../../components/common/Button.jsx';
import ProjectModal from './ProjectModal.jsx';
import { formatDate } from '../../utils/date.js';
import { Plus, Search, Edit2, Trash2, FolderKanban, AlertCircle } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProjects = useCallback(
    async (page = 1, currentSearch = search, currentStatus = statusFilter) => {
      setLoading(true);
      setError(null);
      try {
        const response = await projectApi.getProjects({
          page,
          limit: pagination.limit,
          search: currentSearch,
          status: currentStatus,
        });

        if (response.success && response.data) {
          setProjects(response.data.data || []);
          setPagination(
            response.data.pagination || { page: 1, limit: 10, total: 0, pages: 1 }
          );
        }
      } catch (err) {
        setError(err.message || 'Failed to load projects.');
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit, search, statusFilter]
  );

  useEffect(() => {
    fetchProjects(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects(1, search, statusFilter);
  };

  const handlePageChange = (newPage) => {
    fetchProjects(newPage, search, statusFilter);
  };

  const handleOpenCreate = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleSaveProject = async (formData, projectId) => {
    if (projectId) {
      await projectApi.updateProject(projectId, formData);
    } else {
      await projectApi.createProject(formData);
    }
    fetchProjects(pagination.page);
  };

  const handleDeleteProject = async (id, projectCode) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete project ${projectCode}? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      await projectApi.deleteProject(id);
      fetchProjects(pagination.page);
    } catch (err) {
      alert(err.message || 'Could not delete project. It may have associated issued invoices.');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'badge-issued';
      case 'completed':
        return 'badge-paid';
      case 'on_hold':
      case 'planned':
        return 'badge-overdue';
      case 'archived':
        return 'badge-draft';
      default:
        return 'badge-draft';
    }
  };

  const columns = [
    {
      header: 'Code',
      key: 'projectCode',
      render: (row) => (
        <span style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--color-primary)' }}>
          {row.projectCode}
        </span>
      ),
    },
    {
      header: 'Project Name',
      key: 'name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.name}</div>
          {row.description && (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
              {row.description.length > 50
                ? `${row.description.substring(0, 50)}...`
                : row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Client',
      key: 'clientName',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.clientName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
            {row.clientEmail}
          </div>
          {row.clientPhone && (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-600)', fontFamily: 'monospace' }}>
              📞 {row.clientPhone}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Service Type',
      key: 'serviceType',
      render: (row) => <span>{row.serviceType || '-'}</span>,
    },
    {
      header: 'Duration',
      key: 'duration',
      render: (row) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-600)' }}>
          {row.startDate ? formatDate(row.startDate) : 'TBD'} -{' '}
          {row.endDate ? formatDate(row.endDate) : 'Ongoing'}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <span className={`badge ${getStatusBadgeClass(row.status)}`}>{row.status}</span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      cellStyle: { textAlign: 'right' },
      headerStyle: { textAlign: 'right' },
      render: (row) => (
        <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <button
            onClick={() => handleOpenEdit(row)}
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
            title="Edit Project"
          >
            <Edit2 size={13} />
            Edit
          </button>
          <button
            onClick={() => handleDeleteProject(row._id, row.projectCode)}
            className="btn btn-secondary"
            style={{
              padding: '0.35rem 0.6rem',
              fontSize: '0.75rem',
              color: 'var(--color-danger)',
              borderColor: 'var(--color-danger-light)',
            }}
            disabled={deletingId === row._id}
            title="Delete or Archive Project"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Projects</h2>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.875rem' }}>
            Manage client accounts, project codes, and service deliverables.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          <Plus size={16} />
          New Project
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px' }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-neutral-400)',
              }}
            />
            <input
              type="text"
              placeholder="Search by code, project name, client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-control"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
          <Button type="submit" variant="secondary" style={{ padding: '0.5rem 1rem' }}>
            Search
          </Button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label
            style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', fontWeight: 500 }}
          >
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-control"
            style={{ width: 'auto', padding: '0.45rem 1.75rem 0.45rem 0.75rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-danger-light)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Data Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={projects}
          loading={loading}
          emptyMessage="No projects found. Click 'New Project' above to create your first project."
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Create / Edit Project Modal */}
      <ProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaveProject}
        project={editingProject}
      />
    </div>
  );
}

