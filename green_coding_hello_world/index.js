// Import necessary modules from worker_threads
const { Worker, isMainThread } = require('worker_threads');

// Import my own modules for setting up workers and managing processes
const { setupWorkers } = require('./setupWorkers');
const { manageProcesses } = require('./manageProcesses');

// Ensure the number of CPU cores is provided as an argument
const numCPUs = parseInt(process.argv[2], 10);

// Get the use case number from the command line arguments
const useCase = parseInt(process.argv[3], 10);

// Validate the number of CPU cores provided
if (isNaN(numCPUs) || numCPUs <= 0) {
  // If the number of CPU cores is not a valid number or is less than 
  // or equal to 0, output an error message and exit the process
  console.error(
    'Please provide a valid number of CPU cores as the first argument.');
  process.exit(1);
}

// Validate the use case number provided
if (isNaN(useCase) || useCase <= 0) {
  // If the use case is not a valid number or is less than or equal to 0,
  // output an error message and exit the process
  console.error('Please provide a use case 1-10.');
  process.exit(1);
}

// Check if the current thread is the main thread
if (isMainThread) {
  // If we're on the main thread, set up worker threads using 
  // the number of CPUs and the use case
  setupWorkers(numCPUs, useCase);
  
  // Manage the worker processes after they are set up
  manageProcesses();
} else {
  // If not on the main thread, load the worker task script
  require('./workerTask');
}