import { Cron } from 'croner';

let scheduledTask: Cron | null = null;

export default defineNitroPlugin(async (nitroApp) => {
  if (import.meta.dev || process.env.NODE_ENV === 'production') {
    console.log('[Migration Scheduler] Initializing plugin...');

    nitroApp.hooks.hook('request', async () => {
      if (scheduledTask) return;

      try {
        const { getMigrationSchedule } = await import('../api/settings/settings-db');
        const { migrateDescriptionUsage } = await import('../api/descriptions/descriptions-db');
        
        const schedule = await getMigrationSchedule();
        
        if (!schedule.enabled) {
          console.log('[Migration Scheduler] Disabled in settings');
          scheduledTask = {} as Cron;
          return;
        }

        const [hours, minutes] = schedule.time.split(':');
        let cronExpression = '';

        switch (schedule.frequency) {
          case 'daily':
            cronExpression = `${minutes} ${hours} * * *`;
            break;
          case 'weekly':
            cronExpression = `${minutes} ${hours} * * 0`;
            break;
          case 'monthly':
            cronExpression = `${minutes} ${hours} 1 * *`;
            break;
          default:
            cronExpression = `${minutes} ${hours} * * *`;
        }

        console.log(`[Migration Scheduler] Scheduling migration with cron: ${cronExpression} (${schedule.frequency} at ${schedule.time})`);

        scheduledTask = new Cron(cronExpression, async () => {
          console.log(`[Migration Scheduler] Starting scheduled migration at ${new Date().toISOString()}`);
          try {
            const result = await migrateDescriptionUsage();
            console.log('[Migration Scheduler] Migration completed:', result);
          } catch (error) {
            console.error('[Migration Scheduler] Migration failed:', error);
          }
        });

        console.log('[Migration Scheduler] Cron job scheduled successfully');
      } catch (error) {
        console.error('[Migration Scheduler] Failed to initialize:', error);
        scheduledTask = {} as Cron;
      }
    });
  } else {
    console.log('[Migration Scheduler] Skipping initialization during build');
  }
});
