const clusterManager = require('./clusterManager');
const metricsStore = require('./metricsStore');

class AutoScaler {
  constructor() {
    this.minInstances = 2;
    this.maxInstances = 4;
    this.scaleUpThresholdRps = 6.0;
    this.scaleDownThresholdRps = 3.0;
    this.cooldownSeconds = 5;
    this.lastScalingTime = Date.now();
    this.currentTrafficSimulation = 'normal';

    // Start baseline 2 instances
    clusterManager.startInstance(1);
    clusterManager.startInstance(2);

    setInterval(() => {
      this.evaluate();
    }, 2000);
  }

  setTrafficSimulation(rate) {
    this.currentTrafficSimulation = rate;
    metricsStore.simulationRate = rate;

    if (rate === 'high') {
      metricsStore.addEvent('INFO', 'Traffic simulation set to HIGH SURGE (testing auto-scale up)');
      for (let i = 0; i < 25; i++) {
        metricsStore.requestTimestamps.push(Date.now() - Math.random() * 2000);
      }
    } else if (rate === 'normal') {
      metricsStore.addEvent('INFO', 'Traffic simulation set to NORMAL baseline');
    } else if (rate === 'low') {
      metricsStore.addEvent('INFO', 'Traffic simulation set to LOW (idle mode)');
      metricsStore.requestTimestamps = [];
    }
  }

  evaluate() {
    const now = Date.now();
    if (now - this.lastScalingTime < this.cooldownSeconds * 1000) {
      return;
    }

    const currentRps = metricsStore.getCurrentRps();
    const activeInstances = clusterManager.instances.filter(i => i.process && !i.process.killed);
    const activeCount = activeInstances.length;

    // SCALE UP: RPS high or high simulation triggered
    if ((currentRps >= this.scaleUpThresholdRps || this.currentTrafficSimulation === 'high') && activeCount < this.maxInstances) {
      const nextIndex = activeCount + 1;
      console.log(`[AutoScaler] Scale-up triggered (RPS: ${currentRps}). Scaling from ${activeCount} to ${nextIndex} instances.`);
      clusterManager.startInstance(nextIndex);
      this.lastScalingTime = now;
      metricsStore.addEvent(
        'SCALE_UP',
        `High traffic detected (${currentRps} RPS >= ${this.scaleUpThresholdRps} threshold). Auto-scaler spun up backend-${nextIndex}. Cluster at ${nextIndex} nodes.`
      );
    }
    // SCALE DOWN: Traffic low or normalized
    else if ((currentRps < this.scaleDownThresholdRps || this.currentTrafficSimulation === 'low' || (this.currentTrafficSimulation === 'normal' && currentRps < this.scaleUpThresholdRps)) && activeCount > this.minInstances) {
      const targetToStop = activeCount;
      console.log(`[AutoScaler] Scale-down triggered. Scaling from ${activeCount} to ${activeCount - 1} instances.`);
      clusterManager.stopInstance(targetToStop);
      this.lastScalingTime = now;
      metricsStore.addEvent(
        'SCALE_DOWN',
        `Traffic normalized (${currentRps} RPS < ${this.scaleDownThresholdRps} threshold). Auto-scaler terminated backend-${targetToStop}. Cluster reduced to ${activeCount - 1} nodes.`
      );
    }
  }
}

module.exports = new AutoScaler();
