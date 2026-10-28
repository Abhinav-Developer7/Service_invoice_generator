import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginSchema } from '../src/validators/authValidator.js';
import { generateToken } from '../src/services/authService.js';

test('Auth Validator: loginSchema validation rules', () => {
  // Test valid login payload
  const valid = loginSchema.safeParse({
    email: 'Admin@Example.com ',
    password: 'password123',
  });
  assert.equal(valid.success, true);
  assert.equal(valid.data.email, 'admin@example.com'); // Lowercased and trimmed

  // Test invalid email
  const invalidEmail = loginSchema.safeParse({
    email: 'not-an-email',
    password: 'password123',
  });
  assert.equal(invalidEmail.success, false);

  // Test password too short (< 6 chars)
  const shortPass = loginSchema.safeParse({
    email: 'admin@example.com',
    password: '123',
  });
  assert.equal(shortPass.success, false);
});

test('Auth Service: JWT token generation and verification', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'admin@example.com',
    role: 'admin',
  };

  const token = generateToken(mockUser);
  assert.equal(typeof token, 'string');
  assert.ok(token.length > 20);

  const secret = process.env.JWT_SECRET || 'dev_secret_key_invoice_gen_2026_local';
  const decoded = jwt.verify(token, secret);
  assert.equal(decoded.id, mockUser._id);
  assert.equal(decoded.email, mockUser.email);
  assert.equal(decoded.role, mockUser.role);
});

test('Password Security: bcrypt hashing and validation', async () => {
  const plainPassword = 'SuperSecretPassword123!';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainPassword, salt);

  assert.notEqual(hash, plainPassword);
  assert.ok(hash.startsWith('$2'));

  const isCorrect = await bcrypt.compare(plainPassword, hash);
  assert.equal(isCorrect, true);

  const isWrong = await bcrypt.compare('WrongPassword', hash);
  assert.equal(isWrong, false);
});

