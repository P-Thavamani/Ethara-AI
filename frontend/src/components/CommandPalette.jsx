import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Layers, LayoutDashboard, CheckSquare } from 'lucide-react';
import useProjectStore from '../store/project.store';
import styles from './CommandPalette.module.css';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { projects } = useProjectStore();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const staticCommands = [
    { label: 'Go to Dashboard', icon: <LayoutDashboard size={14} />, action: () => navigate('/dashboard') },
    { label: 'Go to Projects', icon: <Layers size={14} />, action: () => navigate('/projects') },
    { label: 'My Tasks', icon: <CheckSquare size={14} />, action: () => navigate('/tasks') },
  ];

  const projectCommands = projects.map((p) => ({
    label: p.name,
    icon: <Layers size={14} />,
    action: () => navigate(`/projects/${p.id}`),
    sub: 'Project',
  }));

  const all = [...staticCommands, ...projectCommands];
  const filtered = query
    ? all.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : all;

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const run = useCallback((cmd) => {
    cmd.action();
    onClose();
  }, [onClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered.length > 0) {
      e.preventDefault();
      run(filtered[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [filtered, selectedIndex, run, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selected = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selected) selected.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.palette}
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.12 }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            <div className={styles.searchRow}>
              <Search size={15} className={styles.searchIcon} />
              <input
                ref={inputRef}
                autoFocus
                className={styles.input}
                placeholder="Search or jump to..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Command palette search"
                role="combobox"
                aria-expanded="true"
                aria-haspopup="listbox"
                aria-activedescendant={filtered.length > 0 ? `cmd-item-${selectedIndex}` : undefined}
              />
            </div>
            <div className={styles.results} ref={resultsRef} role="listbox">
              {filtered.length === 0 && <div className={styles.empty}>No results</div>}
              {filtered.map((cmd, i) => (
                <button
                  key={i}
                  id={`cmd-item-${i}`}
                  data-index={i}
                  className={`${styles.item} ${i === selectedIndex ? styles.selected : ''}`}
                  onClick={() => run(cmd)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  role="option"
                  aria-selected={i === selectedIndex}
                >
                  <span className={styles.itemIcon}>{cmd.icon}</span>
                  <span className={styles.itemLabel}>{cmd.label}</span>
                  {cmd.sub && <span className={styles.itemSub}>{cmd.sub}</span>}
                </button>
              ))}
            </div>
            <div className={styles.footer}>
              <span><kbd>↑↓</kbd> navigate</span>
              <span><kbd>↵</kbd> select</span>
              <span><kbd>esc</kbd> close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
