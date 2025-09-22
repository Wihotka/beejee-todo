import axios, { type AxiosResponse } from 'axios';
import type {
  Task,
  TasksResponse,
  LoginRequest,
  LoginResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskQueryParams,
  AuthUser
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: LoginRequest): Promise<AxiosResponse<LoginResponse>> =>
    api.post('/auth/login', credentials),
  
  verify: (): Promise<AxiosResponse<{ user: AuthUser }>> =>
    api.get('/auth/verify'),
};

export const tasksAPI = {
  getTasks: (params: TaskQueryParams = {}): Promise<AxiosResponse<TasksResponse>> =>
    api.get('/tasks', { params }),
  
  createTask: (task: CreateTaskRequest): Promise<AxiosResponse<Task>> =>
    api.post('/tasks', task),
  
  getTask: (id: number): Promise<AxiosResponse<Task>> =>
    api.get(`/tasks/${id}`),
  
  updateTask: (id: number, task: UpdateTaskRequest): Promise<AxiosResponse<Task>> =>
    api.put(`/tasks/${id}`, task),
};

export default api;
