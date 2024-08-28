const { Worker } = require('worker_threads'); 
// Importing the Worker class from the worker_threads module 
// to enable multi-threading.
const { handleWorkerMessage } = require('./manageProcesses'); 
// Importing my own function 'handleWorkerMessage' 
// to handle messages from workers.

// Main function to set up worker threads.
// Takes the number of CPU cores (numCPUs) and 
// the specific use case as parameters.
function setupWorkers(numCPUs, useCase) {

    // Defining the total number of iterations 
    // we want to perform across all workers.
    const totalIterations = 1e10;
    console.log(`Amount of iterations UseCase is running: ${totalIterations.toLocaleString()}`);

    console.log("");
    if (useCase === 1) {
        console.log("Use case per iteration: increment sum by 1 for each iteration.");
    }
    else if (useCase === 2) {
        console.log("Use case per iteration: Perform a complex arithmetic operation and accumulate the result in sum (function/return pointer).");
    }
    else if (useCase === 3) {
        console.log("Use case per iteration: Perform a different kind of computation involving square and logarithmic calculation.");
    }
    else if (useCase === 4) {
        console.log("Use case per iteration: Simulate a blocking operation (e.g., I/O delay) by busy-waiting.");
    }
    console.log("");

    const iterationsPerWorker = Math.floor(totalIterations / numCPUs);
    // Calculating how many iterations each worker will perform.

    // Looping over the number of CPUs to create a worker for each core.
    for (let i = 0; i < numCPUs; i++) {

        // Calculating the start and end points for the iteration range
        // each worker will handle.
        const start = i * iterationsPerWorker;
        const end = (i === numCPUs - 1) ? totalIterations : start + 
        iterationsPerWorker;

        // Creating a new worker thread, passing in the worker script and 
        // worker-specific data.
        const worker = new Worker('./workerTask.js', {
            workerData: { start, end, useCase } 
            // Sending the start, end, and use case as worker data.
        });

        // Setting up event listeners for the worker to handle messages, 
        // errors, and exit events.
        setupWorkerEvents(worker, numCPUs);
    }
}

// Function to set up event listeners for each worker thread.
function setupWorkerEvents(worker, numCPUs) {
    worker.on('message', (message) => {
        // Handling messages received from workers.
        handleWorkerMessage(message, numCPUs); 
        // Correct reference to handleWorkerMessage - 
        // ensures proper handling of results from worker threads.
    });

    worker.on('error', (error) => {
        // Logging any errors that occur in the worker thread.
        console.error('Worker encountered an error:', error);
    });

    worker.on('exit', (code) => {
        // Handling worker exit events. Non-zero exit codes indicate an error.
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        }
    });
}

// Exporting the setupWorkers function so it can be used 
// in other parts of the application.
module.exports = { setupWorkers };