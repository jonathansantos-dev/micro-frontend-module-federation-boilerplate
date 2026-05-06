/**
 * TypeScript module declarations for federated remotes.
 *
 * Since remote modules are resolved at runtime (not build time),
 * TypeScript needs explicit declarations to understand their shape.
 * In a production setup, consider using @module-federation/typescript
 * to auto-generate these from remote type exports.
 */
declare module 'remoteApp1/AuthModule' {
  import { ComponentType } from 'react';
  const AuthModule: ComponentType;
  export default AuthModule;
}

declare module 'remoteApp2/DashboardModule' {
  import { ComponentType } from 'react';
  const DashboardModule: ComponentType;
  export default DashboardModule;
}
