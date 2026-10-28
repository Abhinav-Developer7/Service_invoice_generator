import { sendError } from '../utils/response.js';

export const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req[property]);
      req[property] = validated;
      next();
    } catch (error) {
      const errors = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return sendError(res, 'Validation failed', errors, 400);
    }
  };
};

