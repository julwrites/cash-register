import { startScheduler } from '#imports';

let initialized = false;

export default defineNitroPlugin((nitroApp) => {
  if (import.meta.dev || process.env.NODE_ENV === 'production') {
    nitroApp.hooks.hook('request', () => {
      if (initialized) return;
      initialized = true;

      console.log('[Plugin] Initializing scheduler...');
      startScheduler().catch(err => {
        console.error('[Plugin] Failed to start scheduler:', err);
      });
    });
  }
});
