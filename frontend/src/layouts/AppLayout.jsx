import { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Layers, CheckSquare, Users, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import useAuthStore from '../store/auth.store';
import useProjectStore from '../store/project.store';
import Avatar from '../components/ui/Avatar';
import CommandPalette from '../components/CommandPalette';
import styles from './AppLayout.module.css';

const NAV = [
  { to: '/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
  { to: '/projects', icon: <Layers size={16} />, label: 'Projects' },
  { to: '/tasks', icon: <CheckSquare size={16} />, label: 'My Tasks' },
];

const AppLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const { projects } = useProjectStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cmdOpen, setCmdOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  // Ctrl+K command palette — proper useEffect with cleanup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
      // Escape closes sidebar on mobile
      if (e.key === 'Escape' && window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close sidebar on mobile when navigating
  const handleMobileNav = useCallback(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  // Handle window resize — auto-close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };

    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.layout}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && window.innerWidth < 768 && (
          <motion.div
            className={styles.mobileOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            className={styles.sidebar}
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.sidebarTop}>
              <div className={styles.brand}>
                <div className={styles.brandIcon}>T</div>
                <span className={styles.brandName}>TaskFlow</span>
              </div>
              <button className={styles.iconBtn} onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
                <X size={14} />
              </button>
            </div>

            <nav className={styles.nav} aria-label="Main navigation">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                  onClick={handleMobileNav}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {projects.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionLabel}>Projects</div>
                {projects.slice(0, 6).map((p) => (
                  <NavLink
                    key={p.id}
                    to={`/projects/${p.id}`}
                    className={({ isActive }) => `${styles.projectItem} ${isActive ? styles.active : ''}`}
                    onClick={handleMobileNav}
                  >
                    <span className={styles.projectDot} />
                    <span className={styles.projectName}>{p.name}</span>
                    <ChevronRight size={12} className={styles.chevron} />
                  </NavLink>
                ))}
              </div>
            )}

            <div className={styles.sidebarBottom}>
              <div className={styles.userCard}>
                <Avatar name={user?.name} size="sm" />
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{user?.name}</div>
                  <div className={styles.userEmail}>{user?.email}</div>
                </div>
                <button className={styles.iconBtn} onClick={handleLogout} aria-label="Logout" title="Logout">
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className={styles.main}>
        {/* Top bar */}
        <header className={styles.topbar}>
          {!sidebarOpen && (
            <button className={styles.iconBtn} onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <Menu size={16} />
            </button>
          )}
          <button
            className={styles.cmdBtn}
            onClick={() => setCmdOpen(true)}
            aria-label="Open command palette"
          >
            <span>Search or jump to...</span>
            <kbd>⌘K</kbd>
          </button>
          <Avatar name={user?.name} size="sm" />
        </header>

        <main className={styles.content}>{children}</main>
      </div>

      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
};

export default AppLayout;
