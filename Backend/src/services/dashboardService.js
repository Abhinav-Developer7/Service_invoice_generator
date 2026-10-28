import Project from '../models/Project.js';
import Invoice from '../models/Invoice.js';

export const getDashboardSummary = async () => {
  // 1. Project metrics: count active (non-archived) projects
  const [totalProjects, activeProjectsCount] = await Promise.all([
    Project.countDocuments({ status: { $ne: 'archived' } }),
    Project.countDocuments({ status: 'active' }),
  ]);

  // 2. Invoice aggregation pipeline for totals and status breakdown
  const invoiceAggregation = await Invoice.aggregate([
    {
      $facet: {
        // Group by status to get counts and amounts per status
        statusBreakdown: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalAmount: { $sum: '$totalAmount' },
            },
          },
        ],
        // Overall financial totals (excluding drafts and cancelled)
        financialMetrics: [
          {
            $match: {
              status: { $in: ['issued', 'paid', 'overdue'] },
            },
          },
          {
            $group: {
              _id: null,
              totalInvoiced: { $sum: '$totalAmount' },
              totalCount: { $sum: 1 },
            },
          },
        ],
        // Outstanding balance: issued and overdue invoices that are unpaid
        outstandingBalance: [
          {
            $match: {
              status: { $in: ['issued', 'overdue'] },
            },
          },
          {
            $group: {
              _id: null,
              totalOutstanding: { $sum: '$totalAmount' },
              unpaidCount: { $sum: 1 },
            },
          },
        ],
        // Total collected/paid
        paidMetrics: [
          {
            $match: { status: 'paid' },
          },
          {
            $group: {
              _id: null,
              totalPaid: { $sum: '$totalAmount' },
              paidCount: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  const facet = invoiceAggregation[0] || {};

  const totalInvoiced = Number((facet.financialMetrics?.[0]?.totalInvoiced || 0).toFixed(2));
  const totalInvoicesCount = facet.financialMetrics?.[0]?.totalCount || 0;
  const outstandingBalance = Number((facet.outstandingBalance?.[0]?.totalOutstanding || 0).toFixed(2));
  const totalPaid = Number((facet.paidMetrics?.[0]?.totalPaid || 0).toFixed(2));

  // Map status breakdown array to clean object
  const statusCounts = {
    draft: 0,
    issued: 0,
    paid: 0,
    overdue: 0,
    cancelled: 0,
  };

  (facet.statusBreakdown || []).forEach((item) => {
    if (statusCounts[item._id] !== undefined) {
      statusCounts[item._id] = item.count;
    }
  });

  // 3. Fetch latest 5 recent invoices for the quick activity table
  const recentInvoices = await Invoice.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('project', 'projectCode name')
    .lean();

  return {
    metrics: {
      totalProjects,
      activeProjectsCount,
      totalInvoices: totalInvoicesCount,
      totalInvoiced,
      outstandingBalance,
      totalPaid,
      currency: 'INR',
    },
    statusBreakdown: statusCounts,
    recentInvoices,
  };
};

