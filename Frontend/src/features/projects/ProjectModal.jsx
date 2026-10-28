import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { toInputDateFormat } from '../../utils/date.js';

export default function ProjectModal({
  isOpen,
  onClose,
  onSaved,
  project = null, // null for create, object for edit
}) {
  const isEditing = Boolean(project?._id);

  const initialFormState = {
    projectCode: '',
    name: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientTaxId: '',
    serviceType: 'General Service',
    startDate: '',
    endDate: '',
    status: 'active',
    description: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        projectCode: project.projectCode || '',
        name: project.name || '',
        clientName: project.clientName || '',
        clientEmail: project.clientEmail || '',
        clientPhone: project.clientPhone || '',
        clientAddress: project.clientAddress || '',
        clientTaxId: project.clientTaxId || '',
        serviceType: project.serviceType || 'General Service',
        startDate: toInputDateFormat(project.startDate),
        endDate: toInputDateFormat(project.endDate),
        status: project.status || 'active',
        description: project.description || '',
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
    setGeneralError('');
  }, [project, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;
    if (name === 'projectCode') {
      updatedValue = value.toUpperCase();
    } else if (name === 'clientPhone') {
      // Strip non-digits and cap at 10 digits
      updatedValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
    // Clear field-specific error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.projectCode?.trim()) errs.projectCode = 'Project code is required';
    if (!formData.name?.trim()) errs.name = 'Project name is required';
    if (!formData.clientName?.trim()) errs.clientName = 'Client name is required';
    if (!formData.clientEmail?.trim()) {
      errs.clientEmail = 'Client email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.clientEmail)) {
      errs.clientEmail = 'Invalid email address';
    }

    if (formData.clientPhone?.trim() && formData.clientPhone.trim().length !== 10) {
      errs.clientPhone = 'Phone number must be exactly 10 digits';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        errs.endDate = 'End date cannot be earlier than start date';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSaved(formData, project?._id);
      onClose();
    } catch (err) {
      if (err.errors && err.errors.length > 0) {
        const fieldErrors = {};
        err.errors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        setGeneralError(err.message || 'Failed to save project.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Project: ${project.projectCode}` : 'Create New Project'}
      maxWidth="620px"
    >
      {generalError && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-danger-light)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}
        >
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
          <Input
            label="Project Code"
            name="projectCode"
            value={formData.projectCode}
            onChange={handleChange}
            placeholder="e.g. PRJ-2026-01"
            disabled={isEditing || submitting}
            error={errors.projectCode}
            required
          />

          <Input
            label="Project Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Cloud Infrastructure Migration"
            disabled={submitting}
            error={errors.name}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Client Name"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            placeholder="e.g. Acme Corporation"
            disabled={submitting}
            error={errors.clientName}
            required
          />

          <Input
            label="Client Email"
            name="clientEmail"
            type="email"
            value={formData.clientEmail}
            onChange={handleChange}
            placeholder="e.g. billing@acme.com"
            disabled={submitting}
            error={errors.clientEmail}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Client Phone (10 digits)"
            name="clientPhone"
            type="tel"
            value={formData.clientPhone}
            onChange={handleChange}
            placeholder="e.g. 9876543210"
            maxLength={10}
            disabled={submitting}
            error={errors.clientPhone}
          />

          <Input
            label="Client Tax ID / GSTIN"
            name="clientTaxId"
            value={formData.clientTaxId}
            onChange={handleChange}
            placeholder="e.g. 29AAAAA0000A1Z5"
            disabled={submitting}
          />
        </div>

        <Input
          label="Client Address"
          name="clientAddress"
          value={formData.clientAddress}
          onChange={handleChange}
          placeholder="e.g. 123 Tech Park, Suite 400"
          disabled={submitting}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Service Type</label>
            <input
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              placeholder="e.g. Web Development"
              className="input-control"
              disabled={submitting}
            />
          </div>

          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            disabled={submitting}
          />

          <Input
            label="End Date"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            error={errors.endDate}
            disabled={submitting}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input-control"
            disabled={submitting}
          >
            <option value="active">Active</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--color-neutral-200)',
          }}
        >
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {isEditing ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

