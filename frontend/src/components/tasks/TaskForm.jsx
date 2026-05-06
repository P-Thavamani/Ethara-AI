import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import styles from './TaskForm.module.css';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

const TaskForm = ({ onSubmit, initialData = {}, members = [], loading }) => {
  const [form, setForm] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    priority: initialData.priority || 'MEDIUM',
    status: initialData.status || 'TODO',
    dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
    assigneeId: initialData.assigneeId || '',
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, dueDate: form.dueDate || null, assigneeId: form.assigneeId || null });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Title"
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        placeholder="Task title"
        required
      />

      <div className={styles.field}>
        <label className={styles.label}>Description</label>
        <textarea
          className={styles.textarea}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Optional description..."
          rows={3}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Priority</label>
          <select className={styles.select} value={form.priority} onChange={(e) => set('priority', e.target.value)}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Status</label>
          <select className={styles.select} value={form.status} onChange={(e) => set('status', e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <Input
          label="Due Date"
          type="date"
          value={form.dueDate}
          onChange={(e) => set('dueDate', e.target.value)}
        />

        <div className={styles.field}>
          <label className={styles.label}>Assignee</label>
          <select className={styles.select} value={form.assigneeId} onChange={(e) => set('assigneeId', e.target.value)}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="submit" loading={loading}>
          {initialData.id ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
