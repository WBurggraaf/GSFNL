const { parentPort, workerData } = require('worker_threads'); 
// Importing parentPort for communication with the main thread 
// and workerData to access data passed from the main thread.

// Inline functions for specific tasks to be performed by the worker.
const complexArithmetic = (x, i) => x + (i * 2 - 3); 

// Function for performing some complex arithmetic operation.
const delay = (ms) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // Busy-wait to simulate delay. This is a blocking operation 
    // to simulate a delay (e.g., I/O operation).
  }
};

// Main function executed by the worker 
// to perform its assigned portion of the task.
function firstProcess() {
    let sum = 0; // Initializing the sum variable to accumulate results.

    // Loop through the range assigned to this worker and perform 
    // computations based on the use case.
    for (let i = workerData.start; i < workerData.end; i++) {

        if (workerData.useCase === 1) {
            sum += 1; 
            // Simple operation: increment sum by 1 for each iteration.
        }
        else if (workerData.useCase === 2) {
            sum = complexArithmetic(sum, i); 
            // Perform a complex arithmetic operation and accumulate 
            // the result in sum.
        }
        else if (workerData.useCase === 3) {
            // Perform a different kind of computation involving square 
            // and logarithmic calculation.
            const someComputation = (x) => x * x + Math.log(x + 1);
            sum += someComputation(i); 
            // Accumulate the result of someComputation in sum.
        }
        else if (workerData.useCase === 4) {
            delay(100);
            // Simulate a blocking operation 
            // (e.g., I/O delay) by busy-waiting for 1 millisecond.
            // After the delay, add the current iteration index to sum.
        }

    }

    // Send the computed result back to the main thread.
    parentPort.postMessage({ done: true, sum });
}

// Start the processing function when the worker script is run.
firstProcess();