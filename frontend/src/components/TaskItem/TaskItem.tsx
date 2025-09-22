import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { updateTask, fetchTasks } from '../../store/slices/tasksSlice';
import type { Task } from '../../types';
import styles from './TaskItem.module.scss';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { currentPage, sortBy, sortOrder } = useAppSelector((state) => state.tasks);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.task_text);

  const handleToggleComplete = async () => {
    if (isAuthenticated) {
      try {
        await dispatch(updateTask({
          id: task.id,
          taskData: {
            is_completed: !task.is_completed
          }
        })).unwrap();
        
        dispatch(fetchTasks({
          page: currentPage,
          sortBy,
          sortOrder,
          limit: 3
        }));
      } catch (error) {
        console.error('Failed to update task:', error);
      }
    }
  };

  const handleEdit = () => {
    if (isAuthenticated) {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (isAuthenticated && editText.trim() !== task.task_text) {
      try {
        await dispatch(updateTask({
          id: task.id,
          taskData: {
            task_text: editText.trim()
          }
        })).unwrap();
        
        dispatch(fetchTasks({
          page: currentPage,
          sortBy,
          sortOrder,
          limit: 3
        }));
      } catch (error) {
        console.error('Failed to update task:', error);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(task.task_text);
    setIsEditing(false);
  };

  return (
    <div className={`card ${styles.taskItem}`}>
      <div className={styles.taskContent}>
        <div className={styles.taskHeader}>
          <span className={styles.username}>{task.username}</span>
          <span className={styles.email}>{task.email}</span>
        </div>
        
        {isEditing ? (
          <div className={styles.editForm}>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="form-textarea"
            />
            <div className={styles.editButtons}>
              <button onClick={handleSave} className="btn btn-primary btn-sm">
                Save
              </button>
              <button onClick={handleCancel} className="btn btn-secondary btn-sm">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.taskText}>
            {task.task_text}
            {task.is_edited && (
              <span className={styles.editedLabel}> (edited by admin)</span>
            )}
          </div>
        )}
      </div>
      
      <div className={styles.taskActions}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={task.is_completed}
            onChange={handleToggleComplete}
            disabled={!isAuthenticated}
          />
          <span className={`${styles.checkboxText} ${!isAuthenticated ? styles.disabled : ''}`}>
            {task.is_completed ? 'Completed' : 'Pending'}
          </span>
        </label>
        
        {isAuthenticated && !isEditing && (
          <button onClick={handleEdit} className="btn btn-primary btn-sm">
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
