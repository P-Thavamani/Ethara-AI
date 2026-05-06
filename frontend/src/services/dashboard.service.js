import api from './api';

export const getDashboard = () => api.get('/dashboard');
export const getProjectActivity = (projectId) => api.get(`/projects/${projectId}/activity`);
