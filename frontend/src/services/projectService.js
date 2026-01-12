import api from './api';

export const projectService = {
  getProjects: async (params = {}) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  getProject: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  getProjectEmployees: async (id) => {
    const response = await api.get(`/projects/${id}/employees`);
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  updateProject: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  assignEmployees: async (projectId, employeeIds) => {
    const response = await api.post(`/projects/${projectId}/employees`, { employeeIds });
    return response.data;
  },

  addEmployee: async (projectId, employeeId) => {
    const response = await api.post(`/projects/${projectId}/employee`, { employeeId });
    return response.data;
  },

  removeEmployee: async (projectId, employeeId) => {
    const response = await api.delete(`/projects/${projectId}/employees/${employeeId}`);
    return response.data;
  },
};
