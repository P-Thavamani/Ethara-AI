const { body } = require('express-validator');
const { handleValidation } = require('../middlewares/validate.middleware');

const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }),
  body('email').isEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter (A–Z)')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter (a–z)')
    .matches(/\d/).withMessage('Password must contain a number (0–9)'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { signupRules, loginRules, handleValidation };
