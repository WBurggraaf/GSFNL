// powerCalculator.js
const powerTable = [
    { load: 0, joulesPerMs: 0.0001 },     // 0% load: Baseline power
    { load: 10, joulesPerMs: 0.00015 },   // 10% load
    { load: 20, joulesPerMs: 0.00025 },   // 20% load
    { load: 30, joulesPerMs: 0.00040 },   // 30% load
    { load: 40, joulesPerMs: 0.00060 },   // 40% load
    { load: 50, joulesPerMs: 0.00090 },   // 50% load
    { load: 60, joulesPerMs: 0.00130 },   // 60% load
    { load: 70, joulesPerMs: 0.00200 },   // 70% load
    { load: 80, joulesPerMs: 0.00300 },   // 80% load
    { load: 90, joulesPerMs: 0.00500 },   // 90% load
    { load: 100, joulesPerMs: 0.00650 }   // 100% load
];

function calculatePowerPerCore(timesDelta) {

    const activeTime = timesDelta.user + timesDelta.nice + timesDelta.sys + timesDelta.irq;
    const totalMilliseconds = activeTime + timesDelta.idle;

    const loadPercentage = (activeTime / totalMilliseconds) * 100;

    let previousEntry = powerTable[0];
    let interpolatedJoulesPerCore = 0;

    for (let i = 1; i < powerTable.length; i++) {
        const entry = powerTable[i];
        if (loadPercentage <= entry.load) {
            const loadDiff = entry.load - previousEntry.load;
            const powerDiff = entry.joulesPerMs - previousEntry.joulesPerMs;
            interpolatedJoulesPerCore = previousEntry.joulesPerMs +
                (powerDiff * (loadPercentage - previousEntry.load) / loadDiff);
            break;
        }
        previousEntry = entry;
    }

    if (loadPercentage > 100) {
        interpolatedJoulesPerCore = powerTable[powerTable.length - 1].joulesPerMs;
    } else {
        interpolatedJoulesPerCore = Math.min(interpolatedJoulesPerCore, powerTable[powerTable.length - 1].joulesPerMs);
    }

    let energyConsumptionInJoules = 0;
    let energyConsumptionInJoulesOver100ms = 0;
    if (activeTime > 0) {
        energyConsumptionInJoules = interpolatedJoulesPerCore * activeTime;
        if (energyConsumptionInJoules > 0 && activeTime > 0) {
            energyConsumptionInJoulesOver100ms = (energyConsumptionInJoules / activeTime) * 100;
        }
    }

    return {
        energyConsumptionInJoules,  // Energy consumption in joules
        energyConsumptionInJoulesOver100ms,  //Proof not above max w.
        activeTime,                 // Total active time in milliseconds
        totalMilliseconds,          // Total time (active + idle) in milliseconds
        loadPercentage              // Load percentage
    };
}

module.exports = { powerTable, calculatePowerPerCore };