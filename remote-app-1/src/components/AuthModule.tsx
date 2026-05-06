import React, { useState } from 'react';

interface LoginForm {
  email: string;
  password: string;
}

type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * AuthModule — Exposed micro-frontend component.
 *
 * This component is the public API of remote-app-1. It is consumed by the
 * host via Module Federation and can also run standalone for isolated development.
 *
 * Design decisions:
 * - Self-contained: carries its own state, no store dependencies from host.
 * - Communicates results via a custom EventBus (see shared/utils/eventBus)
 *   to maintain loose coupling across the micro-frontend boundary.
 * - No direct imports from host-app: remotes must NEVER depend on the host.
 */
const AuthModule: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Both fields are required.');
      return;
    }

    setStatus('loading');
    setError('');

    // Simulate async auth call — replace with real API in production
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (form.email === 'demo@example.com' && form.password === 'password') {
      setStatus('success');
      // Emit cross-app event — host and other remotes can listen
      window.dispatchEvent(new CustomEvent('mfe:auth:login', { detail: { email: form.email } }));
    } else {
      setStatus('error');
      setError('Invalid credentials. Try demo@example.com / password');
    }
  };

  if (status === 'success') {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✅</div>
          <h2 style={styles.title}>Welcome back!</h2>
          <p style={styles.subtitle}>{form.email}</p>
          <button style={styles.btn} onClick={() => setStatus('idle')}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Sign In</h2>
        <p style={styles.subtitle}>Auth Module — Remote App 1</p>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <label style={styles.label}>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="demo@example.com"
            style={styles.input}
            disabled={status === 'loading'}
          />

          <label style={styles.label}>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            style={styles.input}
            disabled={status === 'loading'}
          />

          {error && <p style={styles.errorMsg}>{error}</p>}

          <button type="submit" style={styles.btn} disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={styles.hint}>Hint: demo@example.com / password</p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 56px)', padding: '2rem' },
  card: { background: '#18181b', border: '1px solid #27272a', borderRadius: 12, padding: '2.5rem', width: '100%', maxWidth: 400 },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 4, color: '#f4f4f5' },
  subtitle: { color: '#71717a', fontSize: 13, marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 4 },
  input: { padding: '0.6rem 0.8rem', borderRadius: 6, border: '1px solid #3f3f46', background: '#09090b', color: '#f4f4f5', fontSize: 14, outline: 'none', marginBottom: 8 },
  btn: { marginTop: 8, padding: '0.7rem', borderRadius: 6, border: 'none', background: '#7c3aed', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' },
  errorMsg: { color: '#f87171', fontSize: 13, marginBottom: 4 },
  hint: { marginTop: 16, fontSize: 12, color: '#52525b', textAlign: 'center' },
  successIcon: { fontSize: 40, textAlign: 'center', marginBottom: 12 },
};

export default AuthModule;
