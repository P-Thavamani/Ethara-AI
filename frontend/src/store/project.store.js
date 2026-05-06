import { create } from 'zustand';
import * as projectService from '../services/project.service';
import { cachedFetch, cacheDelete } from '../utils/cache.util';

const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      await cachedFetch(
        'projects',
        () => projectService.getProjects().then((res) => res.data.data),
        (data) => set({ projects: data, isLoading: false })
      );
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.message || 'Failed to load projects' });
      throw err;
    }
  },

  fetchProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await projectService.getProject(id);
      set({ currentProject: res.data.data, isLoading: false });
      return res.data.data;
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.message || 'Failed to load project' });
      throw err;
    }
  },

  createProject: async (data) => {
    const res = await projectService.createProject(data);
    const project = res.data.data;
    cacheDelete('projects'); // invalidate so next fetch is fresh
    set((state) => ({ projects: [project, ...state.projects] }));
    return project;
  },

  updateProject: async (id, data) => {
    const res = await projectService.updateProject(id, data);
    const updated = res.data.data;
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? updated : p)),
      currentProject: state.currentProject?.id === id ? updated : state.currentProject,
    }));
    return updated;
  },

  deleteProject: async (id) => {
    await projectService.deleteProject(id);
    cacheDelete('projects'); // invalidate cache
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
  },

  setCurrentProject: (project) => set({ currentProject: project }),
}));

export default useProjectStore;
