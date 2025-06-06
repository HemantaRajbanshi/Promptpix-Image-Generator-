const cron = require('node-cron');
const { batchResetAllUsers } = require('./creditResetService');

/**
 * Scheduled Jobs Service
 * Handles automated tasks like daily credit resets
 */

let isJobRunning = false;

/**
 * Daily credit reset job
 * Runs every day at midnight UTC
 */
const dailyCreditResetJob = cron.schedule('0 0 * * *', async () => {
  if (isJobRunning) {
    console.log('Credit reset job already running, skipping...');
    return;
  }

  try {
    isJobRunning = true;
    console.log('Starting daily credit reset job...');
    
    const result = await batchResetAllUsers();
    
    console.log('Daily credit reset job completed:', {
      totalUsers: result.totalUsers,
      resetCount: result.resetCount,
      errorCount: result.errorCount,
      timestamp: result.timestamp
    });
    
  } catch (error) {
    console.error('Error in daily credit reset job:', error);
  } finally {
    isJobRunning = false;
  }
}, {
  scheduled: false, // Don't start automatically
  timezone: "UTC"
});

/**
 * Start all scheduled jobs
 */
const startScheduledJobs = () => {
  console.log('Starting scheduled jobs...');
  
  // Start daily credit reset job
  dailyCreditResetJob.start();
  console.log('✅ Daily credit reset job scheduled (runs at midnight UTC)');
  
  // Log next execution time
  const nextExecution = dailyCreditResetJob.nextDates(1);
  if (nextExecution && nextExecution.length > 0) {
    console.log(`📅 Next credit reset: ${nextExecution[0].toISOString()}`);
  }
};

/**
 * Stop all scheduled jobs
 */
const stopScheduledJobs = () => {
  console.log('Stopping scheduled jobs...');
  
  dailyCreditResetJob.stop();
  console.log('✅ Daily credit reset job stopped');
};

/**
 * Get job status
 */
const getJobStatus = () => {
  return {
    dailyCreditReset: {
      running: dailyCreditResetJob.running,
      scheduled: dailyCreditResetJob.scheduled,
      nextExecution: dailyCreditResetJob.nextDates(1)[0]?.toISOString() || null
    },
    isJobRunning
  };
};

/**
 * Manually trigger credit reset (for testing/admin purposes)
 */
const manualCreditReset = async () => {
  if (isJobRunning) {
    throw new Error('Credit reset job is already running');
  }

  try {
    isJobRunning = true;
    console.log('Manual credit reset triggered...');
    
    const result = await batchResetAllUsers();
    
    console.log('Manual credit reset completed:', result);
    return result;
    
  } catch (error) {
    console.error('Error in manual credit reset:', error);
    throw error;
  } finally {
    isJobRunning = false;
  }
};

module.exports = {
  startScheduledJobs,
  stopScheduledJobs,
  getJobStatus,
  manualCreditReset,
  dailyCreditResetJob
};
