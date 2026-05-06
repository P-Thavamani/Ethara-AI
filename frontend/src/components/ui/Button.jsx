import { motion } from 'framer-motion';
import styles from './Button.module.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className}`}
      {...props}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </motion.button>
  );
};

export default Button;
