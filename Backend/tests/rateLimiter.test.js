import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from '../src/middleware/rateLimiter.js';

test('Rate Limiter: enforces threshold and responds with 429 when exceeded', () => {
  const limiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 3,
    message: 'Rate limit exceeded for test',
  });

  const createMockReqRes = (ip = '192.168.1.100') => {
    const req = {
      headers: {},
      socket: { remoteAddress: ip },
    };
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(k, v) {
        this.headers[k] = v;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        return this;
      },
    };
    return { req, res };
  };

  // Temporarily clear NODE_ENV test check for this specific unit test
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  try {
    let nextCalled = 0;
    const next = () => {
      nextCalled += 1;
    };

    // Request 1: should pass
    const req1 = createMockReqRes();
    limiter(req1.req, req1.res, next);
    assert.equal(nextCalled, 1);

    // Request 2: should pass
    const req2 = createMockReqRes();
    limiter(req2.req, req2.res, next);
    assert.equal(nextCalled, 2);

    // Request 3: should pass
    const req3 = createMockReqRes();
    limiter(req3.req, req3.res, next);
    assert.equal(nextCalled, 3);

    // Request 4: threshold exceeded -> should block with 429
    const req4 = createMockReqRes();
    limiter(req4.req, req4.res, next);
    assert.equal(nextCalled, 3); // next was NOT called
    assert.equal(req4.res.statusCode, 429);
    assert.equal(req4.res.body.success, false);
    assert.ok(req4.res.headers['Retry-After']);
  } finally {
    process.env.NODE_ENV = originalEnv;
  }
});

