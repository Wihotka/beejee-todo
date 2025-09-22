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
  sortBy?: 'username' | 'email' | 'is_completed' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface TasksResponse {
  tasks: Task[];
  pagination: PaginationInfo;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    username: string;
  };
}

export interface AdminUser {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface AuthUser {
  id: number;
  username: string;
}

export interface ApiError {
  message: string;
  errors?: Array<{
    msg: string;
    param: string;
    location: string;
  }>;
}
