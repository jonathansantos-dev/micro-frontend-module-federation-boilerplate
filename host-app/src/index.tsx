/**
 * Entry point — async bootstrap pattern
 *
 * Module Federation requires the host to load shared modules asynchronously
 * before rendering. Importing bootstrap dynamically ensures Webpack has time
 * to negotiate shared scope with all remotes before React mounts.
 *
 * Without this pattern, React and ReactDOM would be eagerly loaded before
 * Module Federation initialises, causing "Shared module is not available" errors.
 */
import('./bootstrap');
