import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('401 Error on:', error.config.url);
      
      if (window.location.pathname !== '/login') {
        console.warn('Unauthorized access detected. Logging out.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.replace('/login'); 
      }
    }
    return Promise.reject(error);
  }
);

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       const token = localStorage.getItem('token');
      
//       if (token) {
//         originalRequest.headers.Authorization = `Bearer ${token}`;
//         return api(originalRequest);
//       }
//     }

//     if (error.response?.status === 401) {
//       if (!window.location.pathname.includes('/login')) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         window.location.href = '/login';
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export type UserData = {
  fullName?: string,
  email?: string,
  password?: string,
  role?: 'admin' | 'project-lead' | 'developer' | string,
  mfaEnabled?: boolean,
  isActive?: boolean,
}

export type ProjectData = {
  name?: string,
  description?: string,
  deadline?: string,
  projectLeadId?: string,
  status?: 'active' | 'on-hold' | 'completed' | string
}

export const authAPI = {
  login: (email: string, password: string) => api.post('/api/auth/login', { email, password }),
  register: (userData: UserData) => api.post('/api/auth/register', userData),
  getCurrentUser: () => api.get('/api/auth/userDetails'),
  updateProfile: (profileData: UserData) => api.put('/api/auth/updateProfile', profileData),
  updatePassword: (passwordData: {currentPassword: string, newPassword: string}) =>
    api.put('/api/auth/updatePassword', passwordData),
};

export const userAPI = {
  getAllUsers: () => api.get('/api/users'),
  getUserById: (id: string) => api.get(`/api/users/${id}`),
  updateUser: (id: string, userData: UserData) => api.put(`/api/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/api/users/${id}`),
};

export const projectAPI = {
  getAllProjects: () => api.get('/api/projects'),
  getMyProjects: () => api.get('/api/projects/my-projects/list'),
  getProjectById: (id: string) => api.get(`/api/projects/${id}`),
  createProject: (projectData: ProjectData) => api.post('/api/projects', projectData),
  updateProject: (id: number, projectData: ProjectData) => api.put(`/api/projects/${id}`, projectData),
  assignTeamMember: (projectId: string, memberData: any) =>
    api.post(`/api/projects/${projectId}/assign-member`, memberData),
  removeTeamMember: (projectId: string, userId: string) =>
    api.delete(`/api/projects/${projectId}/remove-member/${userId}`),
};

export const documentAPI = {
  uploadDocument: (projectId: string, formData: any) =>
    api.post(`/api/documents/${projectId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getProjectDocuments: (projectId: string) => api.get(`/api/documents/${projectId}`),
  downloadDocument: (documentId: string) => api.get(`/api/documents/download/${documentId}`, { responseType: 'blob' }),
  getDocumentInfo: (documentId: string) => api.get(`/api/documents/info/${documentId}`),
  deleteDocument: (documentId: string) => api.delete(`/api/documents/${documentId}`),
};

export default api;