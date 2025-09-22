export interface Task {
  id: number;
  username: string;
  email: string;
  task_text: string;
  is_completed: boolean;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  username: string;
  email: string;
  task_text: string;
}

export interface UpdateTaskRequest {
  task_text?: string;
  is_completed?: boolean;
}

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface TasksResponse {
  tasks: Task[];
  pagination: Pagination;
}

export interface AuthUser {
  id: number;
  username: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface TasksState {
  tasks: Task[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  sortBy: 'username' | 'email' | 'is_completed' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

export interface RootState {
  auth: AuthState;
  tasks: TasksState;
}
