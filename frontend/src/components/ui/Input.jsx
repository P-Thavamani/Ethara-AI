import styles from './Input.module.css';

const Input = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputWrap}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input className={`${styles.input} ${icon ? styles.withIcon : ''} ${error ? styles.hasError : ''} ${className}`} {...props} />
      </div>
      {error && <span className={styles.error} role="alert">{error}</span>}
    </div>
  );
};

export default Input;
