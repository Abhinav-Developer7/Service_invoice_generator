import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import Project from '../models/Project.js';
import { generateInvoiceNumber } from '../utils/generateInvoiceNumber.js';
import { calculateInvoiceTotals } from '../utils/calculateInvoiceTotals.js';
import { defaultCompany } from '../config/company.js';

export const createInvoice = async (data, userId) => {
  // 1. Authoritatively recalculate financial totals on the backend
  const calculated = calculateInvoiceTotals({
    items: data.items,
    discount: data.discount,
    taxRate: data.taxRate,
  });

  // 2. Generate concurrency-safe sequential invoice number (e.g. INV-2026-0007)
  const invoiceNumber = await generateInvoiceNumber();

  // 3. Resolve project details if linked
  let projectName = data.projectName || '';
  let projectObjectId = null;

  if (data.projectId && mongoose.Types.ObjectId.isValid(data.projectId)) {
    const project = await Project.findById(data.projectId);
    if (project) {
      projectObjectId = project._id;
      projectName = project.name;
      // Auto-fill phone if omitted in client snapshot
      if (!data.client.phone && project.clientPhone) {
        data.client.phone = project.clientPhone;
      }
    }
  }

  // 4. Freeze Company Snapshot (historical immutability)
  const companySnapshot = {
    name: data.company?.name || defaultCompany.name,
    email: data.company?.email || defaultCompany.email,
    phone: data.company?.phone || defaultCompany.phone,
    address: data.company?.address || defaultCompany.address,
    taxId: data.company?.taxId || defaultCompany.taxId,
    currency: data.currency || defaultCompany.currency,
  };

  // 5. Build and persist invoice document
  const invoice = await Invoice.create({
    invoiceNumber,
    project: projectObjectId,
    projectName,
    clientSnapshot: data.client,
    companySnapshot,
    items: calculated.items,
    subtotal: calculated.subtotal,
    discount: calculated.discount,
    taxRate: calculated.taxRate,
    taxAmount: calculated.taxAmount,
    totalAmount: calculated.totalAmount,
    currency: data.currency || 'INR',
    status: data.status || 'issued',
    issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
    dueDate: data.dueDate
      ? new Date(data.dueDate)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notes: data.notes || '',
    createdBy: userId,
  });

  return invoice;
};

export const listInvoices = async ({
  page = 1,
  limit = 10,
  search = '',
  status = '',
  projectId = '',
}) => {
  const query = {};

  if (status && status !== 'all') {
    query.status = status;
  }

  if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
    query.project = projectId;
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { invoiceNumber: searchRegex },
      { 'clientSnapshot.name': searchRegex },
      { 'clientSnapshot.email': searchRegex },
      { projectName: searchRegex },
    ];
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('project', 'projectCode name')
      .populate('createdBy', 'name email')
      .lean(),
    Invoice.countDocuments(query),
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

export const getInvoiceById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid invoice ID format');
    error.statusCode = 400;
    throw error;
  }

  const invoice = await Invoice.findById(id)
    .populate('project', 'projectCode name')
    .populate('createdBy', 'name email');

  if (!invoice) {
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    throw error;
  }

  return invoice;
};

export const updateInvoiceStatus = async (id, newStatus) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid invoice ID format');
    error.statusCode = 400;
    throw error;
  }

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    throw error;
  }

  const currentStatus = invoice.status;

  // Enforce permitted state transitions
  if (currentStatus === 'paid' && newStatus !== 'paid') {
    const error = new Error('A paid invoice cannot change status.');
    error.statusCode = 400;
    throw error;
  }

  if (currentStatus === 'cancelled' && newStatus !== 'cancelled') {
    const error = new Error('A cancelled invoice cannot be reopened.');
    error.statusCode = 400;
    throw error;
  }

  invoice.status = newStatus;
  await invoice.save();

  return invoice;
};

export const deleteInvoice = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid invoice ID format');
    error.statusCode = 400;
    throw error;
  }

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    throw error;
  }

  // GEMINI.md Rule: Prevent direct deletion of issued or paid invoices
  if (invoice.status !== 'draft') {
    const error = new Error(
      `Cannot delete an invoice with status "${invoice.status}". Only draft invoices can be deleted; please mark as cancelled instead.`
    );
    error.statusCode = 403;
    throw error;
  }

  await Invoice.findByIdAndDelete(id);
  return { id, message: 'Draft invoice deleted successfully' };
};

