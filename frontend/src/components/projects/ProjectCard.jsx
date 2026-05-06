import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Layers, Users } from 'lucide-react';
import Avatar from '../ui/Avatar';
import styles from './ProjectCard.module.css';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -3 }}
      onClick={() => navigate(`/projects/${project.id}`)}
      role="button"
      tabIndex={0}
    >
      <div className={styles.header}>
        <div className={styles.icon}>
          <Layers size={16} />
        </div>
        <span className={`${styles.status} ${project.status === 'ARCHIVED' ? styles.archived : styles.active}`}>
          {project.status}
        </span>
      </div>

      <h3 className={styles.name}>{project.name}</h3>
      {project.description && <p className={styles.desc}>{project.description}</p>}

      <div className={styles.footer}>
        <div className={styles.members}>
          {project.members.slice(0, 4).map((m) => (
            <Avatar key={m.user.id} name={m.user.name} src={m.user.avatar} size="xs" className={styles.memberAvatar} />
          ))}
          {project.members.length > 4 && (
            <span className={styles.more}>+{project.members.length - 4}</span>
          )}
        </div>
        <span className={styles.taskCount}>
          <Layers size={11} />
          {project._count?.tasks ?? 0} tasks
        </span>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
