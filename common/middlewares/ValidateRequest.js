const AppError = require('../utils/AppError');

/**
 * Middleware factory to validate request body with Zod
 * @param {import('zod').ZodSchema} schema 
 * @returns {import('express').Handler}
 */
const validateRequest = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        return next(new AppError('Validation Error', 400));
    }

    // Replace req.body with the parsed/coerced data from Zod
    req.body = result.data;
    next();
};

module.exports = validateRequest;
