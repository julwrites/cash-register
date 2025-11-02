import { Cron } from 'croner';
import { getMigrationSchedule } from '../api/settings/settings-db';
import { migrateDescriptionUsage } from '../api/descriptions/descriptions-db';

let scheduledTask: Cron | null = null;
let isInitialized = false;

export default defineNitroPlugin((nitroApp) => {
  console.log('[Migration Scheduler] Initializing plugin...');

  const startScheduledMigration = async () => {
    if (isInitialized) {
      console.log('[Migration Scheduler] Already initialized, skipping...');
      return;
    }

    try {
      const schedule = await getMigrationSchedule();
      
      if (!schedule.enabled) {
        console.log('[Migration Scheduler] Disabled in settings');
        isInitialized = true;
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

      if (scheduledTask) {
        scheduledTask.stop();
      }

      scheduledTask = new Cron(cronExpression, async () => {
        console.log(`[Migration Scheduler] Starting scheduled migration at ${new Date().toISOString()}`);
        try {
          const result = await migrateDescriptionUsage();
          console.log('[Migration Scheduler] Migration completed:', result);
        } catch (error) {
          console.error('[Migration Scheduler] Migration failed:', error);
        }
      });

      isInitialized = true;
      console.log('[Migration Scheduler] Cron job scheduled successfully');
    } catch (error) {
      console.error('[Migration Scheduler] Failed to initialize:', error);
    }
  };

  nitroApp.hooks.hook('request', startScheduledMigration);

  console.log('[Migration Scheduler] Plugin initialized');
});
