import express, { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { pool } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskQueryParams, 
  TasksResponse, 
  Task, 
  ApiError 
} from '../types';

const router = express.Router();

// Get all tasks with pagination and sorting
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['username', 'email', 'is_completed', 'created_at']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req: Request<{}, TasksResponse | ApiError, {}, TaskQueryParams>, res: Response<TasksResponse | ApiError>) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          msg: err.msg,
          param: err.type === 'field' ? err.path : 'unknown',
          location: err.type === 'field' ? err.location : 'body'
        }))
      });
    }

    const page = parseInt(String(req.query.page)) || 1;
    const limit = parseInt(String(req.query.limit)) || 3;
    const sortBy = (req.query.sortBy as string) || 'created_at';
    const sortOrder = (req.query.sortOrder as string) || 'desc';
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM tasks');
    const totalTasks = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalTasks / limit);

    // Get tasks with pagination and sorting
    const tasksResult = await pool.query(`
      SELECT id, username, email, task_text, is_completed, is_edited, created_at, updated_at
      FROM tasks
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json({
      tasks: tasksResult.rows as Task[],
      pagination: {
        currentPage: page,
        totalPages,
        totalTasks,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
});

// Create new task
router.post('/', [
  body('username').notEmpty().withMessage('Username is required').isLength({ max: 100 }).withMessage('Username too long'),
  body('email').isEmail().withMessage('Valid email is required').isLength({ max: 255 }).withMessage('Email too long'),
  body('task_text').notEmpty().withMessage('Task text is required')
], async (req: Request<{}, { message: string; task: Task } | ApiError, CreateTaskRequest>, res: Response<{ message: string; task: Task } | ApiError>) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          msg: err.msg,
          param: err.type === 'field' ? err.path : 'unknown',
          location: err.type === 'field' ? err.location : 'body'
        }))
      });
    }

    const { username, email, task_text } = req.body;

    const result = await pool.query(`
      INSERT INTO tasks (username, email, task_text)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, task_text, is_completed, is_edited, created_at, updated_at
    `, [username, email, task_text]);

    res.status(201).json({
      message: 'Task created successfully',
      task: result.rows[0] as Task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error while creating task' });
  }
});

// Update task (admin only)
router.put('/:id', authenticateToken, [
  body('task_text').optional().notEmpty().withMessage('Task text cannot be empty'),
  body('is_completed').optional().isBoolean().withMessage('is_completed must be boolean')
], async (req: Request<{ id: string }, { message: string; task: Task } | ApiError, UpdateTaskRequest>, res: Response<{ message: string; task: Task } | ApiError>) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          msg: err.msg,
          param: err.type === 'field' ? err.path : 'unknown',
          location: err.type === 'field' ? err.location : 'body'
        }))
      });
    }

    const taskId = parseInt(req.params.id);
    const { task_text, is_completed } = req.body;

    // Check if task exists
    const existingTask = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (existingTask.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (task_text !== undefined) {
      updates.push(`task_text = $${paramCount}`);
      values.push(task_text);
      paramCount++;
    }

    if (is_completed !== undefined) {
      updates.push(`is_completed = $${paramCount}`);
      values.push(is_completed);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    // Mark as edited if task_text is being updated
    if (task_text !== undefined) {
      updates.push(`is_edited = true`);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(taskId);

    const result = await pool.query(`
      UPDATE tasks
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, username, email, task_text, is_completed, is_edited, created_at, updated_at
    `, values);

    res.json({
      message: 'Task updated successfully',
      task: result.rows[0] as Task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error while updating task' });
  }
});

// Get single task
router.get('/:id', async (req: Request<{ id: string }, { task: Task } | ApiError>, res: Response<{ task: Task } | ApiError>) => {
  try {
    const taskId = parseInt(req.params.id);

    const result = await pool.query(`
      SELECT id, username, email, task_text, is_completed, is_edited, created_at, updated_at
      FROM tasks
      WHERE id = $1
    `, [taskId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ task: result.rows[0] as Task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error while fetching task' });
  }
});

export default router;
