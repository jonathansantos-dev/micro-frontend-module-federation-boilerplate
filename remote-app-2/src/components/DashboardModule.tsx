import React, { useEffect, useState } from 'react';

interface Metric {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: string;
}

const MOCK_METRICS: Metric[] = [
  { label: 'Active Users',      value: '24,891', delta: '+12.4%', positive: true,  icon: '👥' },
  { label: 'Revenue (MoM)',     value: 'R$ 1.2M', delta: '+8.1%', positive: true,  icon: '💰' },
  { label: 'Avg. Session',      value: '4m 32s',  delta: '-0.3%', positive: false, icon: '⏱' },
  { label: 'Conversion Rate',   value: '3.67%',   delta: '+1.2%', positive: true,  icon: '📈' },
];

interface ChartBar {
  label: string;
  value: number;
}

const MOCK_CHART: ChartBar[] = [
  { label: 'Jan', value: 65 },
  { label: 'Feb', value: 72 },
  { label: 'Mar', value: 58 },
  { label: 'Apr', value: 84 },
  { label: 'May', value: 91 },
  { label: 'Jun', value: 78 },
  { label: 'Jul', value: 95 },
];

/**
 * DashboardModule — Exposed micro-frontend component.
 *
 * Displays key business metrics and a simplified bar chart.
 * Designed to run independently (port 3002) or embedded in the host shell.
 *
 * Real-world pattern: In the Alelo Group project, this pattern was used to
 * allow the analytics team to own and deploy the dashboard module independently,
 * while the platform team owned the shell. Zero coordination needed for releases.
 */
const DashboardModule: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  // Listen for cross-MFE auth event from remote-app-1
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ email: string }>).detail;
      setLoggedInUser(detail.email);
    };
    window.addEventListener('mfe:auth:login', handler);
    return () => window.removeEventListener('mfe:auth:login', handler);
  }, []);

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>
            {loggedInUser
              ? `Welcome, ${loggedInUser}`
              : 'Dashboard Module — Remote App 2'}
          </p>
        </div>
        <span style={styles.badge}>Live</span>
      </div>

      {/* Metric Cards */}
      <div style={styles.metricsGrid}>
        {MOCK_METRICS.map(metric => (
          <div key={metric.label} style={styles.metricCard}>
            <div style={styles.metricIcon}>{metric.icon}</div>
            <p style={styles.metricLabel}>{metric.label}</p>
            <p style={styles.metricValue}>{metric.value}</p>
            <p style={{ ...styles.metricDelta, color: metric.positive ? '#4ade80' : '#f87171' }}>
              {metric.delta} vs last month
            </p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Monthly Active Users</h3>
        <div style={styles.chart}>
          {MOCK_CHART.map(bar => (
            <div key={bar.label} style={styles.barWrapper}>
              <div
                style={{ ...styles.bar, height: `${bar.value}%`, background: bar.value === Math.max(...MOCK_CHART.map(b => b.value)) ? '#7c3aed' : '#3f3f46' }}
                title={`${bar.label}: ${bar.value}`}
              />
              <span style={styles.barLabel}>{bar.label}</span>
            </div>
          ))}
        </div>
      </div>

      <p style={styles.note}>
        ℹ️ Data is mocked. Wire up your API in <code>DashboardModule.tsx</code>.
      </p>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: { padding: '2rem', maxWidth: 960, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title: { fontSize: 28, fontWeight: 700, color: '#f4f4f5' },
  subtitle: { color: '#71717a', fontSize: 13, marginTop: 2 },
  badge: { background: '#14532d', color: '#4ade80', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999 },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 },
  metricCard: { background: '#18181b', border: '1px solid #27272a', borderRadius: 10, padding: '1.25rem' },
  metricIcon: { fontSize: 24, marginBottom: 8 },
  metricLabel: { fontSize: 12, color: '#71717a', marginBottom: 4 },
  metricValue: { fontSize: 22, fontWeight: 700, color: '#f4f4f5', marginBottom: 4 },
  metricDelta: { fontSize: 12 },
  chartCard: { background: '#18181b', border: '1px solid #27272a', borderRadius: 10, padding: '1.5rem', marginBottom: 16 },
  chartTitle: { fontSize: 14, fontWeight: 600, color: '#a1a1aa', marginBottom: 20 },
  chart: { display: 'flex', alignItems: 'flex-end', gap: 12, height: 140 },
  barWrapper: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: '4px 4px 0 0', transition: 'height 0.3s ease', minHeight: 4 },
  barLabel: { fontSize: 11, color: '#52525b' },
  note: { fontSize: 12, color: '#52525b' },
};

export default DashboardModule;
