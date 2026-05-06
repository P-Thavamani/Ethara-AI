import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import useProjectStore from '../store/project.store';
import ProjectCard from '../components/projects/ProjectCard';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import styles from './Projects.module.css';

const Projects = () => {
  const { projects, fetchProjects, createProject } = useProjectStore();
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects().finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createProject(form);
      toast.success('Project created');
      setModalOpen(false);
      setForm({ name: '', description: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.sub}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <Button icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
          New Project
        </Button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className={styles.empty}>
          <Layers size={40} className={styles.emptyIcon} />
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
          <Button icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
            Create Project
          </Button>
        </div>
      ) : (
        <motion.div
          className={styles.grid}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </motion.div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Project">
        <form onSubmit={handleCreate} className={styles.form}>
          <Input
            label="Project Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Website Redesign"
            required
          />
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What's this project about?"
              rows={3}
            />
          </div>
          <div className={styles.actions}>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={creating}>Create Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
