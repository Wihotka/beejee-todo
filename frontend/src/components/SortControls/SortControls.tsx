import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setSortBy, setSortOrder } from '../../store/slices/tasksSlice';
import styles from './SortControls.module.scss';

const SortControls: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sortBy, sortOrder } = useAppSelector((state) => state.tasks);

  const handleSortBy = (field: 'username' | 'email' | 'is_completed' | 'created_at') => {
    if (sortBy === field) {
      dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      dispatch(setSortBy(field));
      dispatch(setSortOrder('desc'));
    }
  };

  return (
    <div className={styles.sortControls}>
      <div className={styles.sortBy}>
        <span className={styles.label}>Sort by:</span>
        <div className={styles.buttons}>
          <button
            className={`${styles.button} ${sortBy === 'username' ? styles.active : ''}`}
            onClick={() => handleSortBy('username')}
          >
            Username
            {sortBy === 'username' && (
              <span className={styles.arrow}>
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
          <button
            className={`${styles.button} ${sortBy === 'email' ? styles.active : ''}`}
            onClick={() => handleSortBy('email')}
          >
            Email
            {sortBy === 'email' && (
              <span className={styles.arrow}>
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
          <button
            className={`${styles.button} ${sortBy === 'is_completed' ? styles.active : ''}`}
            onClick={() => handleSortBy('is_completed')}
          >
            Status
            {sortBy === 'is_completed' && (
              <span className={styles.arrow}>
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
          <button
            className={`${styles.button} ${sortBy === 'created_at' ? styles.active : ''}`}
            onClick={() => handleSortBy('created_at')}
          >
            Date
            {sortBy === 'created_at' && (
              <span className={styles.arrow}>
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortControls;