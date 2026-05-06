const router = require('express').Router();
const { signup, login, logout, getMe, requestPasswordReset, resetPassword, verifyEmail } = require('../controllers/auth.controller');
const { signupRules, loginRules, handleValidation } = require('../validators/auth.validator');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/signup', signupRules, handleValidation, signup);
router.post('/login', loginRules, handleValidation, login);
router.post('/logout', authenticate, logout);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.get('/me', authenticate, getMe);

module.exports = router;
