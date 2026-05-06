import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDashboard } from '../services/dashboard.service';
import TaskCard from '../components/tasks/TaskCard';
import Badge from '../components/ui/Badge';
import styles from './MyTasks.module.css';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then((res) => setTasks(res.data.data.myTasks))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  // Navigate to the task's project when clicked
  const handleTaskClick = (task) => {
    if (task.project?.id) {
      navigate(`/projects/${task.project.id}`);
    } else if (task.projectId) {
      navigate(`/projects/${task.projectId}`);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Tasks</h1>
        <p className={styles.sub}>{tasks.length} open task{tasks.length !== 1 ? 's' : ''} assigned to you</p>
      </div>

      <div className={styles.filters}>
        {['all', 'TODO', 'IN_PROGRESS', 'IN_REVIEW'].map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f.replaceAll('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Loading tasks...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <CheckSquare size={36} className={styles.emptyIcon} />
          <p>No tasks here</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((task) => (
            <div key={task.id}>
              <TaskCard task={task} onClick={() => handleTaskClick(task)} />
              {task.project && (
                <div className={styles.projectTag}>
                  <Badge label={task.project.name} variant="accent" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasks;
