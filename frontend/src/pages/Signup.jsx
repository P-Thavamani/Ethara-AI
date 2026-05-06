import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/auth.store';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import styles from './Auth.module.css';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuthStore();
  const navigate = useNavigate();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.logo}>
          <div className={styles.logoIcon}>T</div>
          <span className={styles.logoName}>TaskFlow</span>
        </div>

        <h1 className={styles.title}>Create your workspace</h1>
        <p className={styles.sub}>Start managing projects with your team</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Your name"
            icon={<User size={14} />}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="you@example.com"
            icon={<Mail size={14} />}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            placeholder="Min 6 characters"
            icon={<Lock size={14} />}
            required
          />
          <Button type="submit" loading={loading} size="lg" style={{ width: '100%', justifyContent: 'center' }}>
            Create Account
          </Button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
