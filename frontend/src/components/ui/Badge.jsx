import styles from './Badge.module.css';

const Badge = ({ label, variant = 'default', size = 'sm' }) => (
  <span className={`${styles.badge} ${styles[variant]} ${styles[size]}`}>{label}</span>
);

export default Badge;
