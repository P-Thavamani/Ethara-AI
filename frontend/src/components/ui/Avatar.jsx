import styles from './Avatar.module.css';

const colors = ['#7c6af7','#3b82f6','#22c55e','#f59e0b','#ef4444','#a855f7','#06b6d4'];

const getColor = (name = '') => colors[name.charCodeAt(0) % colors.length];

const Avatar = ({ name = '', src, size = 'md', className = '' }) => {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const bg = getColor(name);

  return (
    <div
      className={`${styles.avatar} ${styles[size]} ${className}`}
      style={!src ? { background: bg } : {}}
      title={name}
      aria-label={name}
    >
      {src ? <img src={src} alt={name} /> : initials}
    </div>
  );
};

export default Avatar;
