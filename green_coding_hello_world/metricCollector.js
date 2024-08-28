const os = require('os');

// Map over the cpuInfo array to create an array of CPU metrics
const collectMetrics = (metricsCollection) => {
  const cpuInfo = os.cpus();

  /*
     * The `os.cpus()` method provides a snapshot of each CPU core's
     * activity
     * since the system started. This includes:
     *   - User time: Time spent in user mode
     *   - Nice time: Time spent in user mode with low priority
     *   - Sys time: Time spent in system mode (kernel)
     *   - Idle time: Time spent idle (no processes running on this core)
     *   - IRQ time: Time spent handling interrupts
     * 
     * These times are cumulative from the moment the system started 
     * and are not reset between calls to `os.cpus()`. Therefore, 
     * when we access `cpu.times`, we are looking at the total time 
     * each core has spent in each state since the system booted up.
     * 
     * By capturing this information at different intervals during our
     * program's execution, we can calculate the changes (deltas) in 
     * these times, which represent the CPU activity during specific
     * periods.
     */

  const cpuMetrics = cpuInfo.map((cpu, index) => ({
    core: index,          // Core index (0-based)
    speed: cpu.speed,     // Current clock speed of the core in MHz
    times: cpu.times,     // Cumulative times spent in different states 
    // (user, sys, idle, etc.)
  }));

  const metrics = {
    timestamp: Date.now(),
    cpuMetrics: cpuMetrics
  };

  metricsCollection.push(metrics);
};

module.exports = { collectMetrics };
