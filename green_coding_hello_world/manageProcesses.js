const fs = require('fs'); 
// Importing the 'fs' module for file system operations 
// (e.g., reading and writing files).

const path = require('path'); 
// Importing the 'path' module to handle and transform file paths.

const { collectMetrics } = require('./metricCollector'); 
// Importing a function to collect performance metrics.

const { calculateDeltas } = require('./deltaCalculator'); 
// Importing a function to calculate differences between metric snapshots.

const { powerTable, calculatePowerPerCore } = require('./powerCalculator'); 
// Importing power calculation utilities.

// Arrays to store metrics and deltas collected during the process.
const metricsCollection = [];
const deltaCollection = [];

// File paths to save the collected metrics and deltas to JSON files.
const metricsFilePath = path.join(__dirname, 'metricsCollection.json');
const deltaAfterFilePath = path.join(__dirname, 'deltaCollectionAfter.json');

let firstProcessDone = false; 
// A flag to indicate whether the first process has completed.

let completedWorkers = 0; 
// Counter to keep track of the number of completed worker threads.

let totalSum = 0; 
// Variable to accumulate the results (sums) returned from all workers.

// Function to manage the ongoing process and collect metrics periodically.
function manageProcesses() {
  const intervalId = setInterval(() => {
    if (firstProcessDone) {
      // If the first process is done, stop the interval timer 
      // and log a message.
      clearInterval(intervalId);
      //console.log('Second process stopped.');
    } else {
      // Otherwise, continue collecting metrics periodically.
      collectMetrics(metricsCollection);
    }
  }, 100); // Adjust interval as needed (100 ms in this example).
}

// Function to handle messages received from worker threads.
function handleWorkerMessage(message, numCPUs) { 
  if (message.done) {
    // If a worker reports completion, increment the counter and 
    // accumulate the result.
    completedWorkers += 1;
    totalSum += message.sum;

    // Once all workers have reported completion, finalize the process.
    if (completedWorkers === numCPUs) {
      finalizeProcesses();
    }
  }
}

// Function to finalize processes after all workers have completed.
function finalizeProcesses() {
  // Calculate deltas between metric snapshots to evaluate changes over time.
  calculateDeltas(
    metricsCollection, deltaCollection, powerTable, calculatePowerPerCore);

  // Calculate total time spent 
  // by aggregating delta time values and normalizing.
  const totalTimeSpent = 
    deltaCollection.reduce((
      total, delta) => total + delta.totalMilliseconds, 0) / 16; //<- why16? :D

  // Calculate energy consumption based on delta metrics.
  const totalJoules = 
    deltaCollection.reduce((
      total, delta) => total + delta.energyConsumptionInJoules, 0);

  const watts = (totalJoules / 3600); // watt = J/s
  
  const kWh = watts / 1000; 
  // Convert joules to kilowatt-hours.

  const kWhPerMillisecond = kWh / totalTimeSpent; 
  // Calculate kWh per millisecond.

  const totalKWhForOneHour = kWhPerMillisecond * 3600000; 
  // Extrapolate to one hour of operation.

  // Log energy consumption statistics and final results.
  console.log(`Total Joules ${totalJoules.toFixed(0)} over ${totalTimeSpent.toFixed(0)} ms`);
  console.log(`Average of ${(totalJoules / totalTimeSpent).toFixed(3)} J/ms = ${((totalJoules / totalTimeSpent) * 1000).toFixed(0)} J/s or Watts`);
  console.log(`E: ${kWh.toFixed(8)} kWh in SCI`);

  // Write the collected metrics and deltas to 
  // JSON files for persistence and analysis.
  fs.writeFileSync(metricsFilePath, JSON.stringify(metricsCollection, null, 2), 'utf8');
  fs.writeFileSync(deltaAfterFilePath, JSON.stringify(deltaCollection, null, 2), 'utf8');

  //console.log('Metrics and delta collections have been saved to JSON files.');
  
  firstProcessDone = true; // Mark the first process as done to stop further metric collection.
}

// Export the manageProcesses and handleWorkerMessage 
// functions for use in other modules.
module.exports = { manageProcesses, handleWorkerMessage };