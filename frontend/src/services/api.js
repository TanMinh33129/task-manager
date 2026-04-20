import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const registerAPI = (data) => API.post('/auth/register', data);
export const loginAPI    = (data) => API.post('/auth/login', data);
export const getMeAPI    = ()     => API.get('/auth/me');

export const getTasksAPI   = (params)    => API.get('/tasks', { params });
export const createTaskAPI = (data)      => API.post('/tasks', data);
export const updateTaskAPI = (id, data)  => API.put(`/tasks/${id}`, data);
export const deleteTaskAPI = (id)        => API.delete(`/tasks/${id}`);
export const getStatsAPI   = ()          => API.get('/tasks/stats');

export const getDashboardAPI     = ()       => API.get('/admin/dashboard');
export const getAllUsersAPI       = (params) => API.get('/admin/users', { params });
export const getUserTasksAPI     = (id)     => API.get(`/admin/users/${id}/tasks`);
export const toggleUserStatusAPI = (id)     => API.patch(`/admin/users/${id}/toggle`);
export const deleteUserAPI       = (id)     => API.delete(`/admin/users/${id}`);

export const exportFileAPI = (type) => API.get(`/export/${type}`, { responseType: 'blob' });

export default API;