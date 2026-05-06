import api from './api';

export const getTasks = (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params });
export const getTask = (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}`);
export const createTask = (projectId, data) => api.post(`/projects/${projectId}/tasks`, data);
export const updateTask = (projectId, taskId, data) => api.put(`/projects/${projectId}/tasks/${taskId}`, data);
export const updateTaskStatus = (projectId, taskId, status) =>
  api.patch(`/projects/${projectId}/tasks/${taskId}/status`, { status });
export const deleteTask = (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`);

export const getComments = (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}/comments`);
export const addComment = (projectId, taskId, content) => api.post(`/projects/${projectId}/tasks/${taskId}/comments`, { content });

export const getAttachments = (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}/attachments`);
export const addAttachment = (projectId, taskId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/projects/${projectId}/tasks/${taskId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
