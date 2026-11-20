class MetricsStore {
  constructor() {
    this.totalRequests = 0;
    this.requestTimestamps = [];
    this.history = [];
    this.scalingEvents = [
      {
        id: 1,
        timestamp: new Date().toLocaleTimeString(),
        type: 'INFO',
        message: 'NEXORA Cloud Orchestrator initialized with 2 baseline instances (:5001, :5002).'
      }
    ];
    this.lastServedInstance = 'backend-1';
    this.lastResponseTime = '12ms';
    this.simulationRate = 'normal';

    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const t = new Date(now - i * 5000);
      this.history.push({
        time: t.toTimeString().split(' ')[0].substring(3),
        rps: 1.2,
        instances: 2
      });
    }

    setInterval(() => {
      this.flushRollingMetrics();
    }, 3000);
  }

  recordRequest(instanceId, responseTimeMs) {
    this.totalRequests++;
    this.requestTimestamps.push(Date.now());
    this.lastServedInstance = instanceId;
    this.lastResponseTime = `${responseTimeMs}ms`;
  }

  getCurrentRps() {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(t => now - t <= 3000);
    const rps = (this.requestTimestamps.length / 3).toFixed(1);
    return parseFloat(rps);
  }

  flushRollingMetrics() {
    const currentRps = this.getCurrentRps();
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0].substring(3);

    this.history.push({
      time: timeStr,
      rps: currentRps,
      instances: 2
    });

    if (this.history.length > 15) {
      this.history.shift();
    }
  }

  addEvent(type, message) {
    const event = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    this.scalingEvents.unshift(event);
    if (this.scalingEvents.length > 50) {
      this.scalingEvents.pop();
    }
    console.log(`[EventStream] [${type}] ${message}`);
  }

  getSnapshot(activeInstances = []) {
    return {
      activeInstances,
      activeCount: activeInstances.filter(i => i.status === 'healthy').length,
      minInstances: 2,
      maxInstances: 4,
      totalRequests: this.totalRequests,
      currentRps: this.getCurrentRps(),
      lastServedInstance: this.lastServedInstance,
      lastResponseTime: this.lastResponseTime,
      scalingEvents: this.scalingEvents,
      history: this.history,
      simulationMode: this.simulationRate,
      mongoStatus: 'Connected to Shared Database'
    };
  }
}

module.exports = new MetricsStore();
