import { formatDistanceToNow } from 'date-fns';
import Avatar from '../ui/Avatar';
import styles from './ActivityFeed.module.css';

const ACTION_LABELS = {
  TASK_CREATED: 'created task',
  TASK_UPDATED: 'updated task',
  TASK_DELETED: 'deleted task',
  TASK_STATUS_CHANGED: 'changed status of',
  PROJECT_CREATED: 'created project',
  MEMBER_ADDED: 'added a member to',
  MEMBER_REMOVED: 'removed a member from',
};

const ActivityFeed = ({ logs = [] }) => {
  if (!logs.length) {
    return <div className={styles.empty}>No recent activity</div>;
  }

  return (
    <div className={styles.feed}>
      {logs.map((log) => (
        <div key={log.id} className={styles.item}>
          <Avatar name={log.user?.name} src={log.user?.avatar} size="sm" />
          <div className={styles.content}>
            <span className={styles.actor}>{log.user?.name}</span>
            <span className={styles.action}> {ACTION_LABELS[log.action] || log.action} </span>
            {log.meta?.taskTitle && <span className={styles.subject}>"{log.meta.taskTitle}"</span>}
            {log.meta?.projectName && <span className={styles.subject}>"{log.meta.projectName}"</span>}
            <div className={styles.time}>
              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
