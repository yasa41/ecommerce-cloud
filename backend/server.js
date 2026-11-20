const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { connectDB, getDbStatus } = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

// Automatically load .env if present
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf-8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// GCP Cloud Run Environment Detection
const isGoogleCloud = Boolean(process.env.K_SERVICE || process.env.GOOGLE_CLOUD_PROJECT || process.env.K_REVISION);
const CLOUD_PROVIDER = isGoogleCloud ? 'Google Cloud Platform (GCP)' : 'NEXORA Cloud Cluster';
const CLOUD_SERVICE = isGoogleCloud ? 'Google Cloud Run' : 'Round-Robin Multi-Instance Cluster';
const CLOUD_REGION = process.env.CLOUD_RUN_REGION || process.env.GCP_REGION || 'us-central1';
const GCP_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT || 'nexora-project';
const GCP_REVISION = process.env.K_REVISION || 'nexora-v1';

// CLI args take highest priority, then PORT env var, then fallback to 5000
const args = process.argv.slice(2);
function getArg(flag) {
  const index = args.indexOf(flag);
  return (index !== -1 && args[index + 1]) ? args[index + 1] : null;
}

const cliPort = getArg('--port');
const cliId = getArg('--id');

const PORT = parseInt(cliPort || process.env.PORT || (isGoogleCloud ? '8080' : '5000'), 10);
const INSTANCE_ID = cliId || process.env.NODE_INSTANCE_ID || `backend-${PORT === 5000 ? '1' : PORT - 5000}`;

const app = express();

let totalRequestsHandled = 24;
let requestTimestamps = [];
let simulationMode = 'normal';
let simulatedRps = 1.4;

// Dynamic Multi-Instance Cluster Pool
let clusterInstances = [
  { id: 'backend-1', port: 5001, status: 'healthy', requestsHandled: 14, cpuUsage: '14%', memoryUsage: '48 MB' },
  { id: 'backend-2', port: 5002, status: 'healthy', requestsHandled: 10, cpuUsage: '11%', memoryUsage: '45 MB' }
];

let scalingEvents = [
  {
    id: 1,
    timestamp: new Date().toLocaleTimeString(),
    type: 'INFO',
    message: 'NEXORA cluster initialized with 2 baseline instances (:5001, :5002).'
  }
];

// Rolling real-time history for Recharts
let rollingHistory = [];
const initTime = Date.now();
for (let i = 10; i >= 0; i--) {
  const d = new Date(initTime - i * 3000);
  rollingHistory.push({
    time: d.toTimeString().split(' ')[0],
    rps: +(1.2 + Math.random() * 0.4).toFixed(1),
    instances: 2
  });
}

// Background ticker to advance rolling graph every 2 seconds
setInterval(() => {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];

  const nowMs = Date.now();
  requestTimestamps = requestTimestamps.filter(t => nowMs - t <= 3000);

  let liveRps;
  if (simulationMode === 'surge') {
    liveRps = +(18.0 + Math.random() * 5.0).toFixed(1);
    // Auto increment requests during surge to show bar chart movement
    const healthy = clusterInstances.filter(i => i.status === 'healthy');
    if (healthy.length > 0) {
      const lucky = healthy[Math.floor(Math.random() * healthy.length)];
      lucky.requestsHandled += Math.floor(1 + Math.random() * 3);
      totalRequestsHandled += 2;
    }
  } else if (simulationMode === 'low') {
    liveRps = +(0.3 + Math.random() * 0.3).toFixed(1);
  } else {
    liveRps = requestTimestamps.length > 0 
      ? +(requestTimestamps.length / 3).toFixed(1) 
      : +(1.2 + Math.random() * 0.6).toFixed(1);
  }

  simulatedRps = parseFloat(liveRps);

  rollingHistory.push({
    time: timeStr,
    rps: simulatedRps,
    instances: clusterInstances.filter(i => i.status === 'healthy').length
  });

  if (rollingHistory.length > 15) {
    rollingHistory.shift();
  }
}, 2000);

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Latency & Instance Tracking Middleware
app.use((req, res, next) => {
  const start = process.hrtime();
  totalRequestsHandled++;
  requestTimestamps.push(Date.now());

  // Distribute request to active healthy instances round-robin
  const healthy = clusterInstances.filter(i => i.status === 'healthy');
  const assigned = healthy.length > 0 
    ? healthy[totalRequestsHandled % healthy.length] 
    : { id: INSTANCE_ID, port: PORT };
  
  assigned.requestsHandled = (assigned.requestsHandled || 0) + 1;

  res.setHeader('X-Backend-Instance', assigned.id);
  res.setHeader('X-Backend-Port', assigned.port || PORT);
  res.setHeader('X-Cloud-Provider', CLOUD_PROVIDER);
  res.setHeader('X-Cloud-Service', CLOUD_SERVICE);

  // Safely intercept res.end to attach X-Response-Time
  const originalEnd = res.end;
  res.end = function (...args) {
    if (!res.headersSent) {
      const diff = process.hrtime(start);
      const timeInMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6);
      res.setHeader('X-Response-Time', `${timeInMs}ms`);
    }
    return originalEnd.apply(this, args);
  };

  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const memUsage = process.memoryUsage();
  const memoryMb = Math.round(memUsage.heapUsed / 1024 / 1024);

  res.json({
    status: 'healthy',
    id: INSTANCE_ID,
    port: PORT,
    pid: process.pid,
    uptime: Math.round(process.uptime()),
    requestsHandled: totalRequestsHandled,
    cpuUsage: `${Math.floor(8 + Math.random() * 10)}%`,
    memoryUsage: `${memoryMb} MB`,
    database: getDbStatus()
  });
});

// Telemetry & Metrics endpoint for Cloud Dashboard
app.get('/api/infra/metrics', (req, res) => {
  const memUsage = process.memoryUsage();
  const memoryMb = Math.round(memUsage.heapUsed / 1024 / 1024);

  // Update CPU randomly for active instances to show live activity
  clusterInstances.forEach(inst => {
    if (inst.status === 'healthy') {
      const load = simulationMode === 'surge' ? Math.floor(45 + Math.random() * 30) : Math.floor(10 + Math.random() * 10);
      inst.cpuUsage = `${load}%`;
    }
  });

  res.json({
    activeInstances: clusterInstances,
    activeCount: clusterInstances.filter(i => i.status === 'healthy').length,
    minInstances: 2,
    maxInstances: 4,
    totalRequests: totalRequestsHandled,
    currentRps: simulatedRps,
    lastServedInstance: clusterInstances.find(i => i.status === 'healthy')?.id || 'backend-1',
    lastResponseTime: `${Math.floor(8 + Math.random() * 14)}ms`,
    cloud: {
      provider: CLOUD_PROVIDER,
      service: CLOUD_SERVICE,
      region: CLOUD_REGION,
      projectId: GCP_PROJECT_ID,
      revision: GCP_REVISION,
      isGcp: isGoogleCloud,
      consoleUrl: 'https://console.cloud.google.com/run'
    },
    scalingEvents,
    history: rollingHistory,
    simulationMode,
    mongoStatus: getDbStatus()
  });
});

// Simulation Controls
app.post('/api/infra/simulate-traffic', (req, res) => {
  const { rate } = req.body;
  simulationMode = rate || 'normal';

  if (rate === 'high') {
    simulatedRps = 21.4;
    // Scale up to 4 instances
    if (!clusterInstances.find(i => i.id === 'backend-3')) {
      clusterInstances.push({ id: 'backend-3', port: 5003, status: 'healthy', requestsHandled: 18, cpuUsage: '58%', memoryUsage: '52 MB' });
    }
    if (!clusterInstances.find(i => i.id === 'backend-4')) {
      clusterInstances.push({ id: 'backend-4', port: 5004, status: 'healthy', requestsHandled: 15, cpuUsage: '54%', memoryUsage: '50 MB' });
    }
    scalingEvents.unshift({
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      type: 'SCALE_UP',
      message: 'Traffic surge detected (21.4 RPS > 6.0 threshold). Auto-scaler spun up backend-3 and backend-4. Cluster at 4 nodes.'
    });
  } else if (rate === 'normal') {
    simulatedRps = 1.6;
    // Scale back down to baseline 2 instances
    clusterInstances = clusterInstances.filter(i => i.id === 'backend-1' || i.id === 'backend-2');
    scalingEvents.unshift({
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      type: 'SCALE_DOWN',
      message: 'Traffic normalized (1.6 RPS < 3.0 threshold). Surplus instances terminated. 2 baseline nodes active.'
    });
  } else if (rate === 'low') {
    simulatedRps = 0.5;
    clusterInstances = clusterInstances.filter(i => i.id === 'backend-1' || i.id === 'backend-2');
  }

  res.json({ success: true, rate, activeCount: clusterInstances.length });
});

app.post('/api/infra/fail-instance', (req, res) => {
  const targetId = req.body.instanceId || 'backend-2';
  const inst = clusterInstances.find(i => i.id === targetId);
  if (inst) {
    inst.status = 'failing';
    inst.cpuUsage = '0% (DOWN)';
  }

  // Immediately shift extra load to healthy survivors so charts visibly react
  const survivors = clusterInstances.filter(i => i.status === 'healthy');
  survivors.forEach(s => {
    s.requestsHandled += 12; // immediate visible bump on healthy node
    s.cpuUsage = '38% (HIGH LOAD)';
  });

  scalingEvents.unshift({
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    type: 'ALERT',
    message: `CRITICAL: ${targetId} failed health probe (503). Load Balancer rerouted 100% of traffic to healthy survivors.`
  });
  res.json({ success: true, instanceId: targetId, status: 'failing' });
});

app.post('/api/infra/restore-instance', (req, res) => {
  const targetId = req.body.instanceId || 'backend-2';
  const inst = clusterInstances.find(i => i.id === targetId);
  if (inst) {
    inst.status = 'healthy';
    inst.cpuUsage = '12%';
  }

  const survivors = clusterInstances.filter(i => i.status === 'healthy');
  survivors.forEach(s => {
    s.cpuUsage = '14%';
  });

  scalingEvents.unshift({
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    type: 'INFO',
    message: `${targetId} health checks passed. Node reintegrated into Round-Robin pool.`
  });
  res.json({ success: true, instanceId: targetId, status: 'healthy' });
});

// Application Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Static frontend serving if dist exists
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      service: 'NEXORA Microservice Node',
      port: PORT,
      status: 'healthy',
      requestsHandled: totalRequestsHandled
    });
  });
}

// Connect to DB and start listening
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n================================================================`);
    console.log(`>>> [NEXORA Server] Instance ${INSTANCE_ID} online on http://localhost:${PORT}`);
    console.log(`>>> Multi-Instance Simulator: 2-4 nodes with live auto-scaling`);
    console.log(`>>> Metrics API: http://localhost:${PORT}/api/infra/metrics`);
    console.log(`================================================================\n`);
  });
});
