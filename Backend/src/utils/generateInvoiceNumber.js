import Counter from '../models/Counter.js';

export const generateInvoiceNumber = async () => {
  const currentYear = new Date().getFullYear();
  const counterId = `invoice_${currentYear}`;

  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const sequentialNumber = String(counter.seq).padStart(4, '0');
  return `INV-${currentYear}-${sequentialNumber}`;
};

