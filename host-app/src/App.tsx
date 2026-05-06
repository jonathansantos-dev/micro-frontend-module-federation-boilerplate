import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

/**
 * Lazy-load remote micro-frontends via Module Federation.
 *
 * These imports are resolved at runtime — Webpack replaces them with
 * dynamic requests to the remote's `remoteEntry.js`. This means:
 *  1. Remotes can be deployed independently on their own CDN/origin.
 *  2. The host bundles zero code from the remotes at build time.
 *  3. If a remote is unavailable, only that route fails — not the shell.
 */
const AuthModule = lazy(() => import('remoteApp1/AuthModule'));
const DashboardModule = lazy(() => import('remoteApp2/DashboardModule'));

const NavBar: React.FC = () => (
  <nav style={styles.nav}>
    <span style={styles.logo}>⚡ MFE Shell</span>
    <div style={styles.navLinks}>
      <Link to="/" style={styles.link}>Home</Link>
      <Link to="/auth" style={styles.link}>Auth</Link>
      <Link to="/dashboard" style={styles.link}>Dashboard</Link>
    </div>
  </nav>
);

const Home: React.FC = () => (
  <div style={styles.page}>
    <h1 style={styles.h1}>Micro-Frontend Shell</h1>
    <p style={styles.subtitle}>
      Host application orchestrating independently deployed micro-frontends
      via Webpack 5 Module Federation.
    </p>
    <div style={styles.cards}>
      <div style={styles.card}>
        <h3>🔐 Auth Module</h3>
        <p>Remote App 1 — port 3001</p>
      </div>
      <div style={styles.card}>
        <h3>📊 Dashboard Module</h3>
        <p>Remote App 2 — port 3002</p>
      </div>
    </div>
  </div>
);

/**
 * ErrorBoundary — graceful degradation per remote.
 * If one remote fails to load, the rest of the shell remains functional.
 */
class RemoteErrorBoundary extends React.Component<
  { name: string; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { name: string; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.error}>
          ⚠️ Failed to load <strong>{this.props.name}</strong>. Make sure the remote is running.
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => (
  <BrowserRouter>
    <NavBar />
    <main style={styles.main}>
      <Suspense fallback={<div style={styles.loading}>Loading remote module…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/auth"
            element={
              <RemoteErrorBoundary name="Auth Module">
                <AuthModule />
              </RemoteErrorBoundary>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RemoteErrorBoundary name="Dashboard Module">
                <DashboardModule />
              </RemoteErrorBoundary>
            }
          />
        </Routes>
      </Suspense>
    </main>
  </BrowserRouter>
);

const styles: Record<string, React.CSSProperties> = {
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: 56, background: '#18181b', borderBottom: '1px solid #27272a' },
  logo: { fontWeight: 700, fontSize: 18, color: '#a78bfa' },
  navLinks: { display: 'flex', gap: 24 },
  link: { color: '#a1a1aa', textDecoration: 'none', fontSize: 14, fontWeight: 500 },
  main: { padding: '2rem' },
  page: { maxWidth: 800, margin: '0 auto' },
  h1: { fontSize: 32, fontWeight: 700, marginBottom: 12, color: '#f4f4f5' },
  subtitle: { color: '#71717a', fontSize: 16, marginBottom: 32, lineHeight: 1.6 },
  cards: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  card: { background: '#18181b', border: '1px solid #27272a', borderRadius: 8, padding: '1.5rem' },
  loading: { color: '#71717a', padding: '2rem', textAlign: 'center' },
  error: { background: '#2d1515', border: '1px solid #7f1d1d', borderRadius: 8, padding: '1rem', color: '#fca5a5', margin: '1rem 0' },
};

export default App;
