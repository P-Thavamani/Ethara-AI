import api from './api';

export const getProjects = () => api.get('/projects');
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

export const addMember = (projectId, data) => api.post(`/projects/${projectId}/members`, data);
export const removeMember = (projectId, memberId) => api.delete(`/projects/${projectId}/members/${memberId}`);
export const updateMemberRole = (projectId, memberId, role) =>
  api.patch(`/projects/${projectId}/members/${memberId}/role`, { role });
