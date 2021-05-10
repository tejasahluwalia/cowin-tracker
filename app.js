import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import checkAvailability from './utils/checkAvailability.js';

const scheduler = new ToadScheduler();
const task = new AsyncTask(
  'Check Vaccine Center Availability',
  checkAvailability,
  (err) => {
    console.error(err.response.statusText);
  }
);

const job = new SimpleIntervalJob({ seconds: 5 }, task);
scheduler.addSimpleIntervalJob(job);
