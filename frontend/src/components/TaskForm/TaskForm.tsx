import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createTask, fetchTasks, setCurrentPage } from '../../store/slices/tasksSlice';
import styles from './TaskForm.module.scss';

const TaskForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, sortBy, sortOrder } = useAppSelector((state) => state.tasks);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    task_text: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.task_text.trim()) {
      newErrors.task_text = 'Task description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await dispatch(createTask({
        username: formData.username.trim(),
        email: formData.email.trim(),
        task_text: formData.task_text.trim()
      })).unwrap();

      setFormData({
        username: '',
        email: '',
        task_text: ''
      });
      setErrors({});
      setSuccessMessage('Task created successfully!');

      dispatch(setCurrentPage(1));
      dispatch(fetchTasks({
        page: 1,
        sortBy,
        sortOrder,
        limit: 3
      }));

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <div className={`card ${styles.taskForm}`}>
      <h3 className={styles.title}>Create New Task</h3>
      <form onSubmit={handleSubmit}>
        {successMessage && (
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        )}
        <div className={styles.formRow}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`form-input ${errors.username ? 'error' : ''}`}
              placeholder="Enter your name"
            />
            {errors.username && (
              <span className="error-text">{errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="task_text" className="form-label">
            Task Description *
          </label>
          <textarea
            id="task_text"
            name="task_text"
            value={formData.task_text}
            onChange={handleChange}
            className={`form-textarea ${errors.task_text ? 'error' : ''}`}
            placeholder="Describe your task..."
            rows={4}
          />
          {errors.task_text && (
            <span className="error-text">{errors.task_text}</span>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          Create Task
        </button>
      </form>
    </div>
  );
};

export default TaskForm;