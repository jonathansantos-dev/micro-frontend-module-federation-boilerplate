/**
 * EventBus — Cross-MFE Communication Utility
 *
 * Module Federation creates isolated JavaScript scopes per remote. Direct imports
 * between remotes are forbidden (would create tight coupling and break independent
 * deployability). The EventBus solves this with a publish/subscribe pattern over
 * the native browser CustomEvent API — zero dependencies, works across all origins.
 *
 * Usage:
 *   // Publisher (remote-app-1):
 *   eventBus.emit('auth:login', { userId: '123', role: 'admin' });
 *
 *   // Subscriber (remote-app-2 or host):
 *   const unsub = eventBus.on('auth:login', ({ userId }) => syncUser(userId));
 *   // cleanup
 *   unsub();
 *
 * Trade-off: Custom events are untyped at the DOM level. We wrap them with generics
 * to restore type safety at the application layer.
 */

type EventMap = {
  'auth:login': { email: string; role?: string };
  'auth:logout': Record<string, never>;
  'navigation:change': { path: string };
  [key: string]: unknown;
};

type EventHandler<T> = (payload: T) => void;

const MFE_EVENT_PREFIX = 'mfe:' as const;

function emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
  window.dispatchEvent(
    new CustomEvent(`${MFE_EVENT_PREFIX}${String(event)}`, {
      detail: payload,
      bubbles: true,
    })
  );
}

function on<K extends keyof EventMap>(
  event: K,
  handler: EventHandler<EventMap[K]>
): () => void {
  const listener = (e: Event) => {
    handler((e as CustomEvent<EventMap[K]>).detail);
  };
  window.addEventListener(`${MFE_EVENT_PREFIX}${String(event)}`, listener);
  return () => window.removeEventListener(`${MFE_EVENT_PREFIX}${String(event)}`, listener);
}

export const eventBus = { emit, on };
