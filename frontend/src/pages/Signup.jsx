import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/auth.store';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import styles from './Auth.module.css';

// ─── Validation Rules ──────────────────────────────────────────────────────
const validateName = (v) => {
  if (!v) return 'Name is required';
  if (v.length < 2) return 'Name must be at least 2 characters';
  if (v.length > 50) return 'Name must be under 50 characters';
  if (!/^[a-zA-Z\s'-]+$/.test(v)) return 'Name can only contain letters, spaces, hyphens, or apostrophes';
  return '';
};

const validateEmail = (v) => {
  if (!v) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
  return '';
};

const passwordRules = [
  { label: 'At least 6 characters', test: (v) => v.length >= 6 },
  { label: 'One uppercase letter (A–Z)', test: (v) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter (a–z)', test: (v) => /[a-z]/.test(v) },
  { label: 'One number (0–9)', test: (v) => /\d/.test(v) },
];

const validatePassword = (v) => {
  if (!v) return 'Password is required';
  const failed = passwordRules.find((r) => !r.test(v));
  return failed ? failed.label : '';
};

// ─── Password Strength Checklist ───────────────────────────────────────────
const PasswordChecklist = ({ password }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
    {passwordRules.map((rule) => {
      const passed = rule.test(password);
      return (
        <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: passed ? '#22c55e' : '#6b7280' }}>
          {passed ? <Check size={10} /> : <X size={10} />}
          {rule.label}
        </div>
      );
    })}
  </div>
);

// ─── Signup Page ───────────────────────────────────────────────────────────
const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const { signup } = useAuthStore();
  const navigate = useNavigate();

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (touched[k]) {
      const validator = k === 'name' ? validateName : k === 'email' ? validateEmail : validatePassword;
      setErrors((e) => ({ ...e, [k]: validator(v) }));
    }
  };

  const blur = (k) => {
    setTouched((t) => ({ ...t, [k]: true }));
    const validator = k === 'name' ? validateName : k === 'email' ? validateEmail : validatePassword;
    setErrors((e) => ({ ...e, [k]: validator(form[k]) }));
    if (k === 'password') setShowChecklist(false);
  };

  const isValid = () => !validateName(form.name) && !validateEmail(form.email) && !validatePassword(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate all fields on submit
    const nameErr = validateName(form.name);
    const emailErr = validateEmail(form.email);
    const passErr = validatePassword(form.password);
    setErrors({ name: nameErr, email: emailErr, password: passErr });
    setTouched({ name: true, email: true, password: true });
    if (nameErr || emailErr || passErr) return;

    setLoading(true);
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed';
      const details = err.response?.data?.errors;
      if (details?.length) {
        // Map server validation errors back to fields
        const fieldMap = {};
        details.forEach((d) => { if (d.path) fieldMap[d.path] = d.msg; });
        setErrors((e) => ({ ...e, ...fieldMap }));
      } else {
        toast.error(msg);
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

        <h1 className={styles.title}>Create your workspace</h1>
        <p className={styles.sub}>Start managing projects with your team</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            onBlur={() => blur('name')}
            placeholder="e.g. Thava Mani"
            icon={<User size={14} />}
            error={touched.name ? errors.name : ''}
          />
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
          <div>
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              onFocus={() => setShowChecklist(true)}
              onBlur={() => blur('password')}
              placeholder="Min 6 chars, A–Z, a–z, 0–9"
              icon={<Lock size={14} />}
              error={touched.password && !showChecklist ? errors.password : ''}
            />
            <AnimatePresence>
              {(showChecklist || (touched.password && form.password)) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <PasswordChecklist password={form.password} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={!isValid() && Object.values(touched).some(Boolean)}
            size="lg"
            style={{ width: '100%', justifyContent: 'center' }}
          >
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
