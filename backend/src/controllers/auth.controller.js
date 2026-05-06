const authService = require('../services/auth.service');
const { success, error } = require('../utils/response');

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

const signup = async (req, res, next) => {
  try {
    const { token, user } = await authService.signup(req.body);
    setTokenCookie(res, token);
    return success(res, { user }, 'Account created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { token, user } = await authService.login(req.body);
    setTokenCookie(res, token);
    return success(res, { user }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
  });
  return success(res, null, 'Logged out successfully');
};

const getMe = async (req, res) => {
  return success(res, { user: req.user }, 'User fetched');
};

const requestPasswordReset = async (req, res, next) => {
  try {
    await authService.requestPasswordReset(req.body.email);
    return success(res, null, 'If that email exists, a password reset link has been sent.');
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    return success(res, null, 'Password has been reset successfully. You can now log in.');
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    await authService.verifyEmail(req.body.token);
    return success(res, null, 'Email has been verified successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, logout, getMe, requestPasswordReset, resetPassword, verifyEmail };
