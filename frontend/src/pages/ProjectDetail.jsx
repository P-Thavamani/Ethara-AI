import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, List, LayoutGrid, Settings, UserPlus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useProjectStore from '../store/project.store';
import useTaskStore from '../store/task.store';
import useAuthStore from '../store/auth.store';
import { socket } from '../services/socket';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import { getProjectActivity } from '../services/dashboard.service';
import { addMember, removeMember } from '../services/project.service';
import styles from './ProjectDetail.module.css';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { fetchProject, currentProject, deleteProject, updateProject } = useProjectStore();
  const { tasks, fetchTasks, createTask, updateTask, updateTaskStatus, deleteTask, syncTaskCreated, syncTaskUpdated, syncTaskDeleted } = useTaskStore();
  const { user } = useAuthStore();

  const [view, setView] = useState('kanban');
  const [taskModal, setTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [memberModal, setMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [removingMember, setRemovingMember] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' });

  const myRole = currentProject?.members?.find((m) => m.user.id === user?.id)?.role;
  const isAdmin = myRole === 'ADMIN';

  useEffect(() => {
    Promise.all([
      fetchProject(projectId),
      fetchTasks(projectId),
      getProjectActivity(projectId).then((r) => setActivityLogs(r.data.data)),
    ]).catch(() => toast.error('Failed to load project'))
      .finally(() => setLoading(false));

    socket.connect();
    socket.emit('joinProject', projectId);

    const onTaskCreated = (task) => syncTaskCreated(task);
    const onTaskUpdated = (task) => syncTaskUpdated(task);
    const onTaskDeleted = (taskId) => syncTaskDeleted(taskId);

    socket.on('taskCreated', onTaskCreated);
    socket.on('taskUpdated', onTaskUpdated);
    socket.on('taskDeleted', onTaskDeleted);

    return () => {
      socket.emit('leaveProject', projectId);
      socket.off('taskCreated', onTaskCreated);
      socket.off('taskUpdated', onTaskUpdated);
      socket.off('taskDeleted', onTaskDeleted);
      socket.disconnect();
    };
  }, [projectId]);

  const handleCreateTask = async (data) => {
    setTaskLoading(true);
    try {
      await createTask(projectId, data);
      toast.success('Task created');
      setTaskModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setTaskLoading(false);
    }
  };

  const handleUpdateTask = async (data) => {
    setTaskLoading(true);
    try {
      await updateTask(projectId, editTask.id, data);
      toast.success('Task updated');
      setEditTask(null);
    } catch (err) {
      toast.error('Failed to update task');
    } finally {
      setTaskLoading(false);
    }
  };

  const handleStatusChange = async (pid, taskId, status) => {
    try {
      await updateTaskStatus(pid, taskId, status);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await addMember(projectId, { email: memberEmail });
      await fetchProject(projectId);
      toast.success('Member added');
      setMemberEmail('');
      setMemberModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member?')) return;
    setRemovingMember(memberId);
    try {
      await removeMember(projectId, memberId);
      await fetchProject(projectId);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setRemovingMember(null);
    }
  };

  const handleArchive = async () => {
    if (!confirm('Archive this project?')) return;
    setArchiveLoading(true);
    try {
      await updateProject(projectId, { status: 'ARCHIVED' });
      toast.success('Project archived');
    } catch {
      toast.error('Failed to archive project');
    } finally {
      setArchiveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    setDeleteLoading(true);
    try {
      await deleteProject(projectId);
      toast.success('Project deleted');
      navigate('/projects');
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className={styles.loading}>Loading project...</div>;
  if (!currentProject) return <div className={styles.loading}>Project not found</div>;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{currentProject.name}</h1>
          {currentProject.description && <p className={styles.desc}>{currentProject.description}</p>}
          <div className={styles.meta}>
            <Badge label={currentProject.status} variant={currentProject.status === 'ACTIVE' ? 'done' : 'default'} />
            <span className={styles.memberCount}>{currentProject.members.length} members</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          {isAdmin && (
            <>
              <Button variant="secondary" size="sm" icon={<UserPlus size={13} />} onClick={() => setMemberModal(true)}>
                Add Member
              </Button>
              <Button variant="ghost" size="sm" icon={<Settings size={13} />} onClick={handleArchive} loading={archiveLoading}>
                Archive
              </Button>
              <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={handleDelete} loading={deleteLoading}>
                Delete
              </Button>
            </>
          )}
          <Button size="sm" icon={<Plus size={13} />} onClick={() => setTaskModal(true)}>
            New Task
          </Button>
        </div>
      </div>

      {/* Members row */}
      <div className={styles.membersRow}>
        {currentProject.members.map((m) => (
          <div key={m.user.id} className={styles.memberChip}>
            <Avatar name={m.user.name} size="xs" />
            <span>{m.user.name}</span>
            <Badge label={m.role} variant="default" size="sm" />
            {isAdmin && m.user.id !== user?.id && (
              <button
                className={styles.removeBtn}
                onClick={() => handleRemoveMember(m.user.id)}
                disabled={removingMember === m.user.id}
                aria-label="Remove member"
              >
                {removingMember === m.user.id ? '…' : '×'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Filters + View toggle */}
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <input
            className={styles.search}
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
          <select className={styles.select} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">All Status</option>
            {['TODO','IN_PROGRESS','IN_REVIEW','DONE'].map((s) => <option key={s} value={s}>{s.replaceAll('_',' ')}</option>)}
          </select>
          <select className={styles.select} value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}>
            <option value="">All Priority</option>
            {['LOW','MEDIUM','HIGH','URGENT'].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className={styles.viewToggle}>
          <button className={`${styles.viewBtn} ${view === 'kanban' ? styles.activeView : ''}`} onClick={() => setView('kanban')} aria-label="Kanban view">
            <LayoutGrid size={14} />
          </button>
          <button className={`${styles.viewBtn} ${view === 'list' ? styles.activeView : ''}`} onClick={() => setView('list')} aria-label="List view">
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Task views */}
      <div className={styles.content}>
        <div className={styles.taskArea}>
          {view === 'kanban' ? (
            <KanbanBoard tasks={filteredTasks} onTaskClick={setEditTask} onStatusChange={handleStatusChange} />
          ) : (
            <div className={styles.listView}>
              {filteredTasks.length === 0 ? (
                <div className={styles.empty}>No tasks found</div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => setEditTask(task)} />
                ))
              )}
            </div>
          )}
        </div>

        {/* Activity panel */}
        <div className={styles.activityPanel}>
          <h3 className={styles.panelTitle}>Activity</h3>
          <ActivityFeed logs={activityLogs} />
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={taskModal} onClose={() => setTaskModal(false)} title="New Task">
        <TaskForm
          onSubmit={handleCreateTask}
          members={currentProject.members}
          loading={taskLoading}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        {editTask && (
          <TaskForm
            onSubmit={handleUpdateTask}
            initialData={editTask}
            members={currentProject.members}
            loading={taskLoading}
          />
        )}
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={memberModal} onClose={() => setMemberModal(false)} title="Add Member" size="sm">
        <form onSubmit={handleAddMember} className={styles.memberForm}>
          <Input
            label="Email address"
            type="email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            placeholder="teammate@example.com"
            required
          />
          <div className={styles.actions}>
            <Button type="button" variant="ghost" onClick={() => setMemberModal(false)}>Cancel</Button>
            <Button type="submit">Add Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
