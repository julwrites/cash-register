import { Cron } from 'croner';
import { getMigrationSchedule } from '../api/settings/settings-db';
import { migrateDescriptionUsage } from '../api/descriptions/descriptions-db';

let scheduledTask: Cron | null = null;

function getCronExpression(schedule: { frequency: string; time: string }): string {
  const [hours, minutes] = schedule.time.split(':');
  switch (schedule.frequency) {
    case 'daily':
      return `${minutes} ${hours} * * *`;
    case 'weekly':
      return `${minutes} ${hours} * * 0`;
    case 'monthly':
      return `${minutes} ${hours} 1 * *`;
    default:
      return `${minutes} ${hours} * * *`;
  }
}

async function runMigration() {
  console.log(`[Scheduler] Starting scheduled migration at ${new Date().toISOString()}`);
  try {
    const result = await migrateDescriptionUsage();
    console.log('[Scheduler] Migration completed:', result);
  } catch (error) {
    console.error('[Scheduler] Migration failed:', error);
  }
}

export async function startScheduler() {
  if (scheduledTask) {
    console.log('[Scheduler] Task is already running.');
    return;
  }

  try {
    const schedule = await getMigrationSchedule();
    if (!schedule.enabled) {
      console.log('[Scheduler] Disabled in settings.');
      return;
    }

    const cronExpression = getCronExpression(schedule);
    console.log(`[Scheduler] Scheduling migration with cron: ${cronExpression} (${schedule.frequency} at ${schedule.time})`);

    scheduledTask = new Cron(cronExpression, runMigration);
    console.log('[Scheduler] Cron job scheduled successfully.');
  } catch (error) {
    console.error('[Scheduler] Failed to initialize:', error);
  }
}

export function stopScheduler() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log('[Scheduler] Stopped.');
  }
}

export async function rescheduleScheduler() {
  console.log('[Scheduler] Rescheduling...');
  stopScheduler();
  await startScheduler();
}
