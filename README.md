# Micro-Frontend Module Federation Boilerplate

> A production-ready boilerplate for building scalable micro-frontend architectures using **Webpack 5 Module Federation**, **React 18**, and **TypeScript**.

---

## What is this?

Modern enterprise applications often outgrow a single codebase. As teams scale, monolithic frontends create bottlenecks: shared deployments, merge conflicts, and tightly coupled release cycles.

This boilerplate demonstrates how to decompose a frontend into **independently deployable micro-frontends** using Webpack 5's native **Module Federation** plugin — the same architecture pattern used in large-scale enterprise projects serving millions of users.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    HOST APP (port 3000)              │
│              React Shell / Router / Layout           │
│                                                     │
│   ┌──────────────────┐   ┌──────────────────────┐   │
│   │  REMOTE APP 1    │   │    REMOTE APP 2       │   │
│   │  (port 3001)     │   │    (port 3002)        │   │
│   │                  │   │                      │   │
│   │  Auth Module     │   │  Dashboard Module    │   │
│   │  ─────────────   │   │  ──────────────────  │   │
│   │  Login / Session │   │  Metrics / Charts    │   │
│   └──────────────────┘   └──────────────────────┘   │
│                                                     │
│            ┌──────────────────┐                     │
│            │     SHARED       │                     │
│            │  EventBus, Types │                     │
│            └──────────────────┘                     │
└─────────────────────────────────────────────────────┘

Communication: CustomEvent API (EventBus) — no shared state store
Deployment: Each app builds to its own CDN path independently
```

---

## Why Module Federation?

Prior to Module Federation (introduced in Webpack 5, 2020), achieving true micro-frontend independence required iframes or custom script-loading solutions — both with significant drawbacks.

Module Federation solves this at the **bundler level**:

- **Runtime composition**: The host fetches remote bundles at runtime, not build time. A remote can be redeployed without touching the host.
- **Shared singletons**: React, ReactDOM, and React Router are negotiated as singletons across all apps, preventing the "multiple React instances" bug.
- **Zero coupling**: Remotes expose components via a public API (`exposes`). The host only knows the URL and the component name — nothing else.
- **Incremental adoption**: You can federate one route at a time. No big-bang migration required.

---

## When to Use This Pattern

This architecture shines in specific contexts. It is **not** a default choice.

**Good fit when:**
- Two or more independent teams own different parts of the UI
- Teams need to deploy their micro-frontend without coordinating with others
- Parts of the app have radically different release cadences
- You are migrating a legacy monolith incrementally

**Poor fit when:**
- Single-team project with < 50k lines of frontend code
- Startup or MVP phase — operational overhead outweighs benefits
- Strong shared state requirements (e.g., deeply connected React Context across boundaries)

> Real-world reference: This pattern was applied in an enterprise project for a major Brazilian fintech group, where three independent engineering teams owned auth, payments, and the analytics dashboard. Teams shipped independently on different sprint cycles with zero cross-team blocking.

---

## Trade-offs

Being honest about trade-offs is a sign of architectural maturity.

| Benefit | Cost |
|---------|------|
| Independent deployability | Each remote needs its own CI/CD pipeline |
| Team autonomy | Cross-cutting concerns (auth, theming) need explicit contracts |
| Runtime flexibility | Network dependency — if a remote is down, that route fails |
| Incremental migration | Webpack 5 required; some older bundlers unsupported |
| Smaller initial bundle | Total JS downloaded may be larger (shared lib duplication possible) |

**Mitigation strategies used in this boilerplate:**
- `singleton: true` on shared libs prevents duplication
- `RemoteErrorBoundary` in the host ensures graceful degradation per route
- `eager: false` on shared modules prevents race conditions at init

---

## Project Structure

```
/
├── host-app/                   # Shell application — pure consumer
│   ├── src/
│   │   ├── index.tsx           # Async entry (Module Federation bootstrap pattern)
│   │   ├── bootstrap.tsx       # React root mount
│   │   ├── App.tsx             # Router + lazy remote imports + ErrorBoundary
│   │   └── declarations.d.ts   # TypeScript types for federated modules
│   └── webpack.config.js       # ModuleFederationPlugin (remotes config)
│
├── remote-app-1/               # Auth micro-frontend — exposes AuthModule
│   ├── src/
│   │   └── components/
│   │       └── AuthModule.tsx  # Exposed component (login form + session)
│   └── webpack.config.js       # ModuleFederationPlugin (exposes config)
│
├── remote-app-2/               # Dashboard micro-frontend — exposes DashboardModule
│   ├── src/
│   │   └── components/
│   │       └── DashboardModule.tsx  # Exposed component (metrics + chart)
│   └── webpack.config.js
│
├── shared/                     # Shared utilities (NOT federated — imported directly)
│   └── src/
│       └── utils/
│           └── eventBus.ts     # Type-safe CustomEvent pub/sub for cross-MFE comms
│
└── package.json                # npm workspaces root
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Install

```bash
git clone https://github.com/jonathansantos-dev/micro-frontend-module-federation-boilerplate.git
cd micro-frontend-module-federation-boilerplate
npm install
```

### Run (all apps concurrently)

```bash
npm start
```

This launches:
- Host app → [http://localhost:3000](http://localhost:3000)
- Remote App 1 (Auth) → [http://localhost:3001](http://localhost:3001)
- Remote App 2 (Dashboard) → [http://localhost:3002](http://localhost:3002)

### Run individually

```bash
# Host shell
npm run start:host

# Auth remote
npm run start:remote1

# Dashboard remote
npm run start:remote2
```

### Build for production

```bash
npm run build
```

Each workspace produces its own `/dist` folder. Deploy them to independent CDN paths and update the remote URLs in `host-app/webpack.config.js`.

---

## Key Implementation Details

### The Bootstrap Pattern

```tsx
// src/index.tsx — WRONG (eager load breaks MF)
import React from 'react'; // ❌ loaded before shared scope negotiation

// src/index.tsx — CORRECT
import('./bootstrap'); // ✅ dynamic import gives MF time to initialise
```

### Singleton Shared Modules

```js
shared: {
  react: {
    singleton: true,       // Only one instance across all MFEs
    requiredVersion: deps.react,
    eager: false,          // Load after shared scope negotiation
  },
}
```

### Cross-MFE Communication

```ts
// remote-app-1 emits after login
eventBus.emit('auth:login', { email: user.email });

// remote-app-2 reacts without importing from remote-app-1
const unsub = eventBus.on('auth:login', ({ email }) => setUser(email));
```

---

## Real-World Inspiration

This boilerplate distills patterns applied in production at enterprise scale, including work with a major Brazilian loyalty and benefits platform. The architecture enabled:

- **3 independent teams** shipping to production on their own cadence
- **Zero-downtime remote updates** — a remote could be redeployed in < 5 minutes without touching the shell
- **Incremental migration** from a React monolith to federated modules over 6 months

---

## Tech Stack

| Tool | Version | Role |
|------|---------|------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Static typing |
| Webpack | 5.x | Bundler + Module Federation |
| React Router | 6.x | Client-side routing (singleton) |
| npm workspaces | - | Monorepo management |

---

## License

MIT — feel free to use this as a starting point for your own micro-frontend architecture.

---

*Built by [Jonathan Santos](https://github.com/jonathansantos-dev) — Senior Frontend Engineer specialising in React, Next.js, and enterprise-scale micro-frontend architectures.*
