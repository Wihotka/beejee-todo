import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchTasks, setCurrentPage } from '../../store/slices/tasksSlice';
import TaskItem from '../TaskItem/TaskItem';
import TaskForm from '../TaskForm/TaskForm';
import SortControls from '../SortControls/SortControls';
import Pagination from '../Pagination/Pagination';
import styles from './TaskList.module.scss';

const TaskList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks, pagination, loading, error, currentPage, sortBy, sortOrder } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks({
      page: currentPage,
      sortBy,
      sortOrder,
      limit: 3
    }));
  }, [dispatch, currentPage, sortBy, sortOrder]);

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="container">
        <div className="loading">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.content}>
        <TaskForm />
        <SortControls />

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <div className={styles.taskList}>
          {tasks.length === 0 ? (
            <div className={styles.noTasks}>
              <p>No tasks found. Create your first task!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default TaskList;
