const { validationResult } = require('express-validator');
const { error } = require('../utils/response');

/**
 * Shared validation handler — checks express-validator results
 * and returns 422 with error details if validation fails.
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, 'Validation failed', 422, errors.array());
  }
  next();
};

module.exports = { handleValidation };
