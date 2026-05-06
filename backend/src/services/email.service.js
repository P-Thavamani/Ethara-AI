const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'; // Use your verified domain in production

const sendVerificationEmail = async (email, token) => {
  const verifyLink = `${FRONTEND_URL}/verify-email?token=${token}`;
  
  try {
    await resend.emails.send({
      from: `TaskFlow <${FROM_EMAIL}>`,
      to: email,
      subject: 'Verify your TaskFlow account',
      html: `
        <h1>Welcome to TaskFlow!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verifyLink}">Verify Email</a>
      `,
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;
  
  try {
    await resend.emails.send({
      from: `TaskFlow <${FROM_EMAIL}>`,
      to: email,
      subject: 'Reset your TaskFlow password',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Password reset email failed:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
