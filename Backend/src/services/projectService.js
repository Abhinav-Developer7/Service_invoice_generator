import mongoose from 'mongoose';
import Project from '../models/Project.js';

export const createProject = async (data, userId) => {
  const existingCode = await Project.findOne({ projectCode: data.projectCode });
  if (existingCode) {
    const error = new Error(`Project code "${data.projectCode}" is already in use.`);
    error.statusCode = 409;
    throw error;
  }

  const project = await Project.create({
    ...data,
    createdBy: userId,
  });

  return project;
};

export const listProjects = async ({ page = 1, limit = 10, search = '', status = '' }) => {
  const query = {};

  // Status filter (ignore 'all' or empty)
  if (status && status !== 'all') {
    query.status = status;
  }

  // Multi-field search
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { projectCode: searchRegex },
      { name: searchRegex },
      { clientName: searchRegex },
      { clientPhone: searchRegex },
      { serviceType: searchRegex },
    ];
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .lean(),
    Project.countDocuments(query),
  ]);

  const pages = Math.ceil(total / limit) || 1;

  return {
    data,
    pagination: {
      total,
      page: Number(page),
      pages,
      limit: Number(limit),
    },
  };
};

export const getProjectById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid project ID format');
    error.statusCode = 400;
    throw error;
  }

  const project = await Project.findById(id).populate('createdBy', 'name email');
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  return project;
};

export const updateProject = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid project ID format');
    error.statusCode = 400;
    throw error;
  }

  const project = await Project.findById(id);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  // Prevent modifying projectCode if client attempted it
  delete updateData.projectCode;
  delete updateData.createdBy;

  Object.assign(project, updateData);
  await project.save();

  return project;
};

export const deleteProject = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid project ID format');
    error.statusCode = 400;
    throw error;
  }

  const project = await Project.findById(id);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if Invoices exist for this project (GEMINI.md Rule 3.7)
  const Invoice = mongoose.models.Invoice;
  if (Invoice) {
    const invoiceCount = await Invoice.countDocuments({
      project: id,
      status: { $in: ['issued', 'paid', 'overdue'] },
    });

    if (invoiceCount > 0) {
      const error = new Error(
        `Cannot delete project: ${invoiceCount} issued/paid invoice(s) are attached to it. Please archive this project instead.`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  await Project.findByIdAndDelete(id);
  return { id, message: 'Project deleted successfully' };
};

