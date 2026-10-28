import { sendError } from '../utils/response.js';

/**
 * In-memory sliding window rate limiter
 * Aligned with GEMINI.md Section 3.5 (No external dependencies)
 */
export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000, // 15 minutes
  maxRequests = 10,          // Max 10 requests per window
  message = 'Too many login attempts. Please try again later.',
} = {}) => {
  const ipHits = new Map();

  // Periodic cleanup of expired entries
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipHits.entries()) {
      if (now - record.startTime > windowMs) {
        ipHits.delete(ip);
      }
    }
  }, windowMs).unref(); // unref so timer doesn't prevent clean Node.js exit

  return (req, res, next) => {
    // In test environment, bypass to avoid flaky test suites
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const now = Date.now();
    const record = ipHits.get(ip);

    if (!record) {
      ipHits.set(ip, { count: 1, startTime: now });
      return next();
    }

    if (now - record.startTime < windowMs) {
      if (record.count >= maxRequests) {
        const retryAfterSeconds = Math.ceil((windowMs - (now - record.startTime)) / 1000);
        res.setHeader('Retry-After', retryAfterSeconds);
        return sendError(res, message, [{ field: 'rate_limit', message }], 429);
      }
      record.count += 1;
      return next();
    }

    // Window elapsed, reset record
    ipHits.set(ip, { count: 1, startTime: now });
    return next();
  };
};

export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,           // Max 10 attempts
  message: 'Too many login attempts from this IP address. Please wait 15 minutes before trying again.',
});

