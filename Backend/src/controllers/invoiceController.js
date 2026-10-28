import * as invoiceService from '../services/invoiceService.js';
import { sendSuccess } from '../utils/response.js';

export const createInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.createInvoice(req.body, req.user._id);
    return sendSuccess(res, 'Invoice created successfully', { invoice }, 201);
  } catch (error) {
    next(error);
  }
};

export const getInvoices = async (req, res, next) => {
  try {
    const result = await invoiceService.listInvoices(req.query);
    return sendSuccess(res, 'Invoices retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    return sendSuccess(res, 'Invoice details retrieved successfully', { invoice });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const invoice = await invoiceService.updateInvoiceStatus(
      req.params.id,
      req.body.status
    );
    return sendSuccess(res, 'Invoice status updated successfully', { invoice });
  } catch (error) {
    next(error);
  }
};

export const deleteInvoice = async (req, res, next) => {
  try {
    const result = await invoiceService.deleteInvoice(req.params.id);
    return sendSuccess(res, result.message, { id: result.id });
  } catch (error) {
    next(error);
  }
};

