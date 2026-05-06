import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/auth.store';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import styles from './Auth.module.css';

// ─── Validation Rules ──────────────────────────────────────────────────────
const validateEmail = (v) => {
  if (!v) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
  return '';
};

const validatePassword = (v) => {
  if (!v) return 'Password is required';
  if (v.length < 6) return 'Password must be at least 6 characters';
  return '';
};

// ─── Login Page ────────────────────────────────────────────────────────────
const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (touched[k]) {
      const validator = k === 'email' ? validateEmail : validatePassword;
      setErrors((e) => ({ ...e, [k]: validator(v) }));
    }
  };

  const blur = (k) => {
    setTouched((t) => ({ ...t, [k]: true }));
    const validator = k === 'email' ? validateEmail : validatePassword;
    setErrors((e) => ({ ...e, [k]: validator(form[k]) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(form.email);
    const passErr = validatePassword(form.password);
    setErrors({ email: emailErr, password: passErr });
    setTouched({ email: true, password: true });
    if (emailErr || passErr) return;

    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setErrors({ email: '', password: 'Incorrect email or password' });
      } else if (status === 422) {
        const details = err.response?.data?.errors;
        if (details?.length) {
          const fieldMap = {};
          details.forEach((d) => { if (d.path) fieldMap[d.path] = d.msg; });
          setErrors((e) => ({ ...e, ...fieldMap }));
        } else {
          toast.error(err.response?.data?.message || 'Login failed');
        }
      } else {
        toast.error('Something went wrong. Please try again.');
      }
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

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Sign in to your workspace</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            onBlur={() => blur('email')}
            placeholder="you@example.com"
            icon={<Mail size={14} />}
            error={touched.email ? errors.email : ''}
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            onBlur={() => blur('password')}
            placeholder="Your password"
            icon={<Lock size={14} />}
            error={touched.password ? errors.password : ''}
          />
          <Button type="submit" loading={loading} size="lg" style={{ width: '100%', justifyContent: 'center' }}>
            Sign In
          </Button>
        </form>

        <p className={styles.footer}>
          Don't have an account?{' '}
          <Link to="/signup" className={styles.link}>Create one</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
