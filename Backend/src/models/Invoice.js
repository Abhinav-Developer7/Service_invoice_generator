import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Line item description is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be greater than 0'],
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
      default: 0,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true,
    },
    projectName: {
      type: String,
      trim: true,
      default: '',
    },
    clientSnapshot: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, trim: true, default: '' },
      address: { type: String, trim: true, default: '' },
      taxId: { type: String, trim: true, default: '' },
    },
    companySnapshot: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      phone: { type: String, trim: true, default: '' },
      address: { type: String, trim: true, default: '' },
      taxId: { type: String, trim: true, default: '' },
      currency: { type: String, default: 'INR' },
    },
    items: {
      type: [lineItemSchema],
      validate: {
        validator: (items) => items && items.length > 0,
        message: 'An invoice must contain at least one line item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'issued', 'paid', 'overdue', 'cancelled'],
      default: 'issued',
      index: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying history by status and issue date
invoiceSchema.index({ status: 1, issueDate: -1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;

