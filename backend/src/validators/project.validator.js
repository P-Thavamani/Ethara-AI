const { body } = require('express-validator');
const { handleValidation } = require('../middlewares/validate.middleware');

const projectRules = [
  body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
];

const memberRoleRules = [
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['ADMIN', 'MEMBER']).withMessage('Role must be ADMIN or MEMBER'),
];

module.exports = { projectRules, memberRoleRules, handleValidation };
