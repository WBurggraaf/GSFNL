const fs = require('fs'); 
// Importing the 'fs' module for file system operations 
// (e.g., reading and writing files).

const path = require('path'); 
// Importing the 'path' module to handle and transform file paths.

// Define the path for the JSON file where 
// deltas will be saved before processing.
const deltaBeforeFilePath = path.join(__dirname, 'deltaCollectionBefore.json');

// Check if the file exists
if (fs.existsSync(deltaBeforeFilePath)) {
  // If the file exists, delete it
  fs.unlinkSync(deltaBeforeFilePath);
}

// Function to calculate the deltas (differences) 
// between consecutive metrics in a collection.
function calculateDeltas(
  metricsCollection, deltaCollection, powerTable, calculatePowerPerCore) {
  
    // Iterate through the metrics collection starting from 
  // the second element (index 1).
  for (let i = 1; i < metricsCollection.length; i++) {
    
    const currentMetrics = metricsCollection[i - 1]; 
    // Previous set of metrics.
    
    const nextMetrics = metricsCollection[i]; 
    // Current set of metrics.

    // Calculate the deltas for CPU metrics between 
    // two consecutive metric collections.
    // map -> transform
    const deltaCpuMetrics = nextMetrics.cpuMetrics.map(
      (currentCpu, index) => {

      const previousCpu = currentMetrics.cpuMetrics[index]; 
      // Corresponding CPU metrics from the previous collection.

      const timesDelta = {}; 
      // Object to store the differences in time for different CPU activities.

      // Calculate the difference in CPU times (user, system, idle, etc.) 
      // between consecutive metric collections.
      for (const timeType in currentCpu.times) {
        timesDelta[timeType] = currentCpu.times[timeType] - previousCpu.times[timeType];
      }

      // Calculate power and performance metrics 
      // based on the delta times using a provided function.
      const computingResult = calculatePowerPerCore(timesDelta);

      // Return an object representing the calculated deltas and 
      // performance metrics for the CPU core.
      return {
        core: currentCpu.core,
        speedDelta: currentCpu.speed - previousCpu.speed, // Difference in CPU speed between the two metric sets.
        timesDelta: timesDelta, // The calculated time deltas for different CPU states.
        activeTime: computingResult.activeTime, // Active time of the CPU.
        totalMilliseconds: computingResult.totalMilliseconds, // Total milliseconds CPU was active.
        loadPercentage: computingResult.loadPercentage, // CPU load percentage during the period.
        energyConsumptionInJoules: computingResult.energyConsumptionInJoules, // Energy consumed by the CPU in Joules.
        energyConsumptionInJoulesOver100ms: computingResult.energyConsumptionInJoulesOver100ms // Energy consumption over a 100ms period.
      };
    });

    // Append the calculated CPU deltas to a file 
    // for further analysis or record-keeping.
    fs.appendFileSync(deltaBeforeFilePath, JSON.stringify(deltaCpuMetrics, null, 2), 'utf8');

    // Summarize total active time, total milliseconds, 
    // and total energy consumption for the deltas calculated.
    // reduce -> aggregate
    const totalActiveTime = deltaCpuMetrics.reduce((total, delta) => total + delta.activeTime, 0);
    const totalTotalMilliseconds = deltaCpuMetrics.reduce((total, delta) => total + delta.totalMilliseconds, 0);
    const totalJoules = deltaCpuMetrics.reduce((total, delta) => total + delta.energyConsumptionInJoules, 0);

    // Create a delta metrics object representing 
    // the differences between two snapshots in time.
    const deltaMetrics = {
      startTimeStamp: currentMetrics.timestamp.toString(), // Timestamp of the beginning of the interval.
      endTimeStamp: nextMetrics.timestamp.toString(), // Timestamp of the end of the interval.
      activeTime: totalActiveTime, // Total active time for all CPUs combined.
      totalMilliseconds: totalTotalMilliseconds, // Total milliseconds for which deltas were calculated.
      energyConsumptionInJoules: totalJoules, // Total energy consumption for the interval.
    };

    // Push the delta metrics to the delta collection array 
    // for use in further processing or analysis.
    deltaCollection.push(deltaMetrics);
  }
}

// Export the calculateDeltas function for use in other modules.
module.exports = { calculateDeltas };
