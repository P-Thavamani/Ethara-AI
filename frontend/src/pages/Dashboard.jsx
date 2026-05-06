import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckSquare, AlertCircle, Clock, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDashboard } from '../services/dashboard.service';
import StatCard from '../components/dashboard/StatCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import TaskCard from '../components/tasks/TaskCard';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Loading dashboard...</div>;
  if (!data) return null;

  const { stats, myTasks, recentActivity, workload } = data;
  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

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
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.sub}>Here's what's happening across your projects</p>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <StatCard label="Total Tasks" value={stats.totalTasks} icon={<Layers size={16} />} color="accent" />
        <StatCard label="Completed" value={stats.completedTasks} icon={<CheckSquare size={16} />} color="success" />
        <StatCard label="Overdue" value={stats.overdueTasks} icon={<AlertCircle size={16} />} color="danger" />
        <StatCard label="In Progress" value={stats.inProgressTasks} icon={<Clock size={16} />} color="info" />
      </div>

      {/* Progress bar */}
      <div className={styles.progressCard}>
        <div className={styles.progressHeader}>
          <span>Overall Completion</span>
          <span className={styles.progressPct}>{completionRate}%</span>
        </div>
        <div className={styles.progressBar}>
          <motion.div
            className={styles.progressFill}
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className={styles.grid}>
        {/* My Tasks */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>My Open Tasks</h2>
          {myTasks.length === 0 ? (
            <div className={styles.empty}>No open tasks assigned to you</div>
          ) : (
            <div className={styles.taskList}>
              {myTasks.map((task) => (
                <TaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} />
              ))}
            </div>
          )}
        </div>

        {/* Activity + Workload */}
        <div className={styles.right}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent Activity</h2>
            <ActivityFeed logs={recentActivity} />
          </div>

          {workload.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Workload</h2>
              <div className={styles.workload}>
                {workload.map((w) => (
                  <div key={w.user?.id} className={styles.workloadItem}>
                    <span className={styles.workloadName}>{w.user?.name}</span>
                    <div className={styles.workloadBar}>
                      <div
                        className={styles.workloadFill}
                        style={{ width: `${Math.min((w.taskCount / 10) * 100, 100)}%` }}
                      />
                    </div>
                    <span className={styles.workloadCount}>{w.taskCount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
