import { motion } from 'framer-motion';
import { Calendar, AlertCircle } from 'lucide-react';
import { format, isPast } from 'date-fns';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import styles from './TaskCard.module.css';

const TaskCard = ({ task, onClick }) => {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE';

  return (
    <motion.div
      className={`${styles.card} ${isOverdue ? styles.overdue : ''}`}
      whileHover={{ y: -2 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className={styles.header}>
        <Badge label={task.status.replaceAll('_', ' ')} variant={task.status.toLowerCase()} />
        <Badge label={task.priority} variant={task.priority.toLowerCase()} />
      </div>

      <h3 className={styles.title}>{task.title}</h3>
      {task.description && <p className={styles.desc}>{task.description}</p>}

      <div className={styles.footer}>
        <div className={styles.meta}>
          {task.dueDate && (
            <span className={styles.date}>
              {isOverdue && <AlertCircle size={12} />}
              <Calendar size={12} />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>
        {task.assignee && <Avatar name={task.assignee.name} src={task.assignee.avatar} size="sm" />}
      </div>
    </motion.div>
  );
};

export default TaskCard;
