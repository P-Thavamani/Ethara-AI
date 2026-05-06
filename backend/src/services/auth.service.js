const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt');
const emailService = require('./email.service');

const signup = async ({ name, email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  const user = await prisma.user.create({
    data: { 
      name, 
      email, 
      password: hashed,
      verificationToken
    },
    select: { id: true, name: true, email: true, avatar: true, createdAt: true },
  });

  // Async send
  emailService.sendVerificationEmail(user.email, verificationToken).catch(console.error);

  const token = signToken({ id: user.id, email: user.email });
  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({ id: user.id, email: user.email });
  const { password: _, ...safeUser } = user;
  return { user: safeUser, token };
};

const requestPasswordReset = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Return true anyway to prevent email enumeration
    return true; 
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpires
    }
  });

  await emailService.sendPasswordResetEmail(user.email, resetToken);
  return true;
};

const resetPassword = async (token, newPassword) => {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gt: new Date() }
    }
  });

  if (!user) {
    const err = new Error('Invalid or expired reset token');
    err.statusCode = 400;
    throw err;
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      resetPasswordToken: null,
      resetPasswordExpires: null
    }
  });

  return true;
};

const verifyEmail = async (token) => {
  const user = await prisma.user.findFirst({
    where: { verificationToken: token }
  });

  if (!user) {
    const err = new Error('Invalid verification token');
    err.statusCode = 400;
    throw err;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      verificationToken: null
    }
  });

  return true;
};

module.exports = { signup, login, requestPasswordReset, resetPassword, verifyEmail };
