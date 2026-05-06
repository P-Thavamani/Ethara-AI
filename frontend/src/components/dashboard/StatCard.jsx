import { motion } from 'framer-motion';
import styles from './StatCard.module.css';

const StatCard = ({ label, value, icon, color = 'accent', trend }) => (
  <motion.div
    className={styles.card}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className={styles.top}>
      <span className={`${styles.icon} ${styles[color]}`}>{icon}</span>
      {trend !== undefined && (
        <span className={`${styles.trend} ${trend >= 0 ? styles.up : styles.down}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className={styles.value}>{value}</div>
    <div className={styles.label}>{label}</div>
  </motion.div>
);

export default StatCard;
