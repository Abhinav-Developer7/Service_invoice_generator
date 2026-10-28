import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
} from '../src/validators/projectValidator.js';

test('Project Validator: createProjectSchema validation', () => {
  // Valid payload
  const valid = createProjectSchema.safeParse({
    projectCode: 'PRJ-2026-01',
    name: 'Website Redesign',
    clientName: 'Acme Corp',
    clientEmail: 'contact@acme.com',
    clientPhone: '9876543210',
    serviceType: 'Web Development',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
  });
  assert.equal(valid.success, true);
  assert.equal(valid.data.projectCode, 'PRJ-2026-01');
  assert.equal(valid.data.clientPhone, '9876543210');
  assert.equal(valid.data.status, 'active'); // Default status

  // Invalid: phone number with 9 digits (< 10)
  const shortPhone = createProjectSchema.safeParse({
    projectCode: 'PRJ-01',
    name: 'Test',
    clientName: 'Acme',
    clientEmail: 'acme@test.com',
    clientPhone: '987654321',
  });
  assert.equal(shortPhone.success, false);

  // Invalid: phone number with 11 digits (> 10)
  const longPhone = createProjectSchema.safeParse({
    projectCode: 'PRJ-01',
    name: 'Test',
    clientName: 'Acme',
    clientEmail: 'acme@test.com',
    clientPhone: '98765432100',
  });
  assert.equal(longPhone.success, false);

  // Invalid: missing required field
  const missingName = createProjectSchema.safeParse({
    projectCode: 'PRJ-01',
    clientName: 'Acme',
    clientEmail: 'acme@test.com',
  });
  assert.equal(missingName.success, false);

  // Invalid: endDate before startDate
  const invalidDates = createProjectSchema.safeParse({
    projectCode: 'PRJ-02',
    name: 'Mobile App',
    clientName: 'Globex',
    clientEmail: 'info@globex.com',
    startDate: '2026-06-01',
    endDate: '2026-01-01',
  });
  assert.equal(invalidDates.success, false);
});

test('Project Validator: listProjectsQuerySchema defaults and coercion', () => {
  const parsed = listProjectsQuerySchema.safeParse({
    page: '2',
    limit: '25',
    search: ' Acme ',
    status: 'active',
  });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.page, 2);
  assert.equal(parsed.data.limit, 25);
  assert.equal(parsed.data.search, 'Acme');

  // Default values check
  const defaults = listProjectsQuerySchema.safeParse({});
  assert.equal(defaults.success, true);
  assert.equal(defaults.data.page, 1);
  assert.equal(defaults.data.limit, 10);
});

