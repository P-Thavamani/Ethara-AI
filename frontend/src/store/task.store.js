import { create } from 'zustand';
import * as taskService from '../services/task.service';

const useTaskStore = create((set) => ({
  tasks: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetchTasks: async (projectId, filters) => {
    set({ isLoading: true, error: null });
    try {
      const res = await taskService.getTasks(projectId, filters);
      const { tasks, pagination } = res.data.data;
      
      set((state) => {
        const isFirstPage = !filters?.page || filters.page === 1;
        return { 
          tasks: isFirstPage ? tasks : [...state.tasks, ...tasks], 
          pagination,
          isLoading: false 
        };
      });
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.message || 'Failed to load tasks' });
      throw err;
    }
  },

  createTask: async (projectId, data) => {
    const res = await taskService.createTask(projectId, data);
    const task = res.data.data;
    set((state) => ({ tasks: [task, ...state.tasks] }));
    return task;
  },

  updateTask: async (projectId, taskId, data) => {
    const res = await taskService.updateTask(projectId, taskId, data);
    const updated = res.data.data;
    set((state) => ({ tasks: state.tasks.map((t) => (t.id === taskId ? updated : t)) }));
    return updated;
  },

  updateTaskStatus: async (projectId, taskId, status) => {
    const res = await taskService.updateTaskStatus(projectId, taskId, status);
    const updated = res.data.data;
    set((state) => ({ tasks: state.tasks.map((t) => (t.id === taskId ? updated : t)) }));
    return updated;
  },

  deleteTask: async (projectId, taskId) => {
    await taskService.deleteTask(projectId, taskId);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) }));
  },

  syncTaskCreated: (task) => set((state) => {
    if (state.tasks.some(t => t.id === task.id)) return state;
    return { tasks: [task, ...state.tasks] };
  }),

  syncTaskUpdated: (task) => set((state) => ({
    tasks: state.tasks.map((t) => (t.id === task.id ? task : t))
  })),

  syncTaskDeleted: (taskId) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== taskId)
  })),

  setTasks: (tasks) => set({ tasks }),
}));

export default useTaskStore;
