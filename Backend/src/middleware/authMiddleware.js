import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendError } from '../utils/response.js';

export const requireAuth = async (req, res, next) => {
  try {
    let token;

    // Check HttpOnly cookie first, then fallback to Authorization header
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Authentication required. Please log in.', [], 401);
    }

    const secret = process.env.JWT_SECRET || 'dev_secret_key_invoice_gen_2026_local';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return sendError(res, 'User session is invalid or account deactivated.', [], 401);
    }

    // Attach user to request
    req.user = user.toJSON();
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Session expired. Please log in again.', [], 401);
    }
    return sendError(res, 'Invalid authentication token.', [], 401);
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 'Forbidden: Insufficient privileges', [], 403);
    }
    next();
  };
};

