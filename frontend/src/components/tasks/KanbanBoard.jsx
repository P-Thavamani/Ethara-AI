import { motion } from 'framer-motion';
import TaskCard from './TaskCard';
import styles from './KanbanBoard.module.css';

const COLUMNS = [
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'IN_REVIEW', label: 'In Review' },
  { key: 'DONE', label: 'Done' },
];

const KanbanBoard = ({ tasks, onTaskClick, onStatusChange }) => {
  const getColumnTasks = (status) => tasks.filter((t) => t.status === status);

  const handleDrop = (e, status) => {
    const taskId = e.dataTransfer.getData('taskId');
    const projectId = e.dataTransfer.getData('projectId');
    if (taskId) onStatusChange(projectId, taskId, status);
    e.currentTarget.classList.remove(styles.dragOver);
  };

  return (
    <div className={styles.board}>
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className={styles.column}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add(styles.dragOver); }}
          onDragLeave={(e) => e.currentTarget.classList.remove(styles.dragOver)}
          onDrop={(e) => handleDrop(e, col.key)}
        >
          <div className={styles.colHeader}>
            <span className={`${styles.dot} ${styles[col.key.toLowerCase()]}`} />
            <span className={styles.colTitle}>{col.label}</span>
            <span className={styles.count}>{getColumnTasks(col.key).length}</span>
          </div>

          <div className={styles.cards}>
            {getColumnTasks(col.key).map((task) => (
              <motion.div
                key={task.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('taskId', task.id);
                  e.dataTransfer.setData('projectId', task.projectId);
                }}
                layout
              >
                <TaskCard task={task} onClick={() => onTaskClick(task)} />
              </motion.div>
            ))}

            {getColumnTasks(col.key).length === 0 && (
              <div className={styles.empty}>No tasks</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
