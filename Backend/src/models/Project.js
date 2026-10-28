import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    projectCode: {
      type: String,
      required: [true, 'Project code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [150, 'Project name cannot exceed 150 characters'],
    },
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: [100, 'Client name cannot exceed 100 characters'],
    },
    clientEmail: {
      type: String,
      required: [true, 'Client email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid client email address'],
    },
    clientPhone: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (v) {
          return !v || /^[0-9]{10}$/.test(v);
        },
        message: 'Client phone must be a 10-digit number',
      },
    },
    clientAddress: {
      type: String,
      trim: true,
      default: '',
    },
    clientTaxId: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    serviceType: {
      type: String,
      trim: true,
      default: 'General Service',
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['planned', 'active', 'completed', 'on_hold', 'archived'],
      default: 'active',
      index: true,
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

// Compound text index for fast search by name, code, client, or phone
projectSchema.index({
  projectCode: 'text',
  name: 'text',
  clientName: 'text',
  clientPhone: 'text',
});

const Project = mongoose.model('Project', projectSchema);
export default Project;

