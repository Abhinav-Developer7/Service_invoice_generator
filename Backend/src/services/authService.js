import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'dev_secret_key_invoice_gen_2026_local';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn }
  );
};

export const authenticateUser = async (email, password) => {
  // Normalize email and explicitly select password hash
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Account has been deactivated. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);
  return { user: user.toJSON(), token };
};

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user || !user.isActive) {
    const error = new Error('User not found or inactive');
    error.statusCode = 401;
    throw error;
  }
  return user.toJSON();
};

export const seedAdminIfEmpty = async () => {
  const count = await User.countDocuments();
  if (count === 0) {
    console.log('[Auth Seed] No users found. Creating default admin account...');
    const defaultAdmin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      isActive: true,
    });
    console.log(`[Auth Seed] Default admin created: ${defaultAdmin.email} (Password: password123)`);
    return defaultAdmin;
  }
  return null;
};

