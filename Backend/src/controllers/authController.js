import { authenticateUser, getUserById, seedAdminIfEmpty } from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authenticateUser(email, password);

    // Set secure HTTP-only cookie
    res.cookie('token', token, COOKIE_OPTIONS);

    return sendSuccess(res, 'Login successful', { user, token });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  return sendSuccess(res, 'Logged out successfully', {});
};

export const getMe = async (req, res, next) => {
  try {
    const user = await getUserById(req.user._id);
    return sendSuccess(res, 'Authenticated user profile retrieved', { user });
  } catch (error) {
    next(error);
  }
};

export const setupSeed = async (req, res, next) => {
  try {
    const admin = await seedAdminIfEmpty();
    if (admin) {
      return sendSuccess(res, 'Initial admin seeded successfully', { email: admin.email });
    }
    return sendSuccess(res, 'Admin account already exists', {});
  } catch (error) {
    next(error);
  }
};

