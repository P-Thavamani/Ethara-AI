import api from './api';

export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const requestPasswordReset = (data) => api.post('/auth/request-password-reset', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);
export const verifyEmail = (data) => api.post('/auth/verify-email', data);
export const getMe = () => api.get('/auth/me');
