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
const CLOUD_PROVIDER = isGoogleCloud ? 'Google Cloud Platform (GCP)' : 'Local Cloud Cluster';
const CLOUD_SERVICE = isGoogleCloud ? 'Google Cloud Run' : 'Multi-Node Cluster';
const CLOUD_REGION = process.env.CLOUD_RUN_REGION || process.env.GCP_REGION || 'us-central1';
const GCP_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT || 'nexora-project';
const GCP_REVISION = process.env.K_REVISION || 'nexora-v1';

// Generate a distinct container instance tag on container boot
const CONTAINER_INSTANCE_TAG = isGoogleCloud
  ? `cloud-run-${(process.env.K_REVISION || 'rev').slice(-5)}-${Math.random().toString(36).substring(2, 6)}`
  : null;

// Parse command line arguments (--port 5001 --id backend-1)
const args = process.argv.slice(2);
function getArg(flag) {
  const index = args.indexOf(flag);
  if (index !== -1 && args[index + 1]) {
    return args[index + 1];
  }
  return null;
}

// CLI args take highest priority, then PORT env var (Cloud Run provides 8080), then fallback to 5000
const cliPort = getArg('--port');
const cliId = getArg('--id');

const PORT = parseInt(cliPort || process.env.PORT || (isGoogleCloud ? '8080' : '5000'), 10);
const INSTANCE_ID = cliId || process.env.NODE_INSTANCE_ID || CONTAINER_INSTANCE_TAG || `backend-${PORT === 5000 ? '1' : PORT - 5000}`;

const app = express();

let isHealthy = true;
let totalRequestsHandled = 0;
const bootTimestamp = Date.now();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Latency & Instance Tracking Middleware
app.use((req, res, next) => {
  const start = process.hrtime();
  totalRequestsHandled++;

  // Set response headers to identify instance and cloud platform
  res.setHeader('X-Backend-Instance', INSTANCE_ID);
  res.setHeader('X-Backend-Port', PORT);
  res.setHeader('X-Cloud-Provider', CLOUD_PROVIDER);
  res.setHeader('X-Cloud-Service', CLOUD_SERVICE);
  if (isGoogleCloud) {
    res.setHeader('X-Cloud-Region', CLOUD_REGION);
    res.setHeader('X-Cloud-Revision', GCP_REVISION);
  }

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const timeInMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6);
    res.setHeader('X-Response-Time', `${timeInMs}ms`);
  });

  // If node is set to fail, reject non-health requests
  if (!isHealthy && !req.path.startsWith('/health') && !req.path.startsWith('/api/infra')) {
    return res.status(503).json({
      error: `Service Unavailable: Node ${INSTANCE_ID} is currently marked as FAILING`,
      instanceId: INSTANCE_ID,
      provider: CLOUD_PROVIDER
    });
  }

  next();
});

// Health check endpoint (Queried by Google Cloud Load Balancer & health monitors)
app.get('/health', (req, res) => {
  const memUsage = process.memoryUsage();
  const memoryMb = Math.round(memUsage.heapUsed / 1024 / 1024);

  if (!isHealthy) {
    return res.status(503).json({
      status: 'failing',
      id: INSTANCE_ID,
      port: PORT,
      pid: process.pid,
      requestsHandled: totalRequestsHandled
    });
  }

  res.json({
    status: 'healthy',
    id: INSTANCE_ID,
    port: PORT,
    pid: process.pid,
    uptime: Math.round(process.uptime()),
    requestsHandled: totalRequestsHandled,
    cpuUsage: `${Math.floor(8 + Math.random() * 10)}%`,
    memoryUsage: `${memoryMb} MB`,
    database: getDbStatus(),
    cloud: {
      provider: CLOUD_PROVIDER,
      service: CLOUD_SERVICE,
      region: CLOUD_REGION,
      revision: GCP_REVISION,
      isGcp: isGoogleCloud
    }
  });
});

// Chaos Injection Routes
app.post('/health/fail', (req, res) => {
  isHealthy = false;
  console.warn(`[Node ${INSTANCE_ID}] Chaos triggered: Node marked as FAILING.`);
  res.json({ status: 'failing', id: INSTANCE_ID });
});

app.post('/health/restore', (req, res) => {
  isHealthy = true;
  console.log(`[Node ${INSTANCE_ID}] Chaos restored: Node marked as HEALTHY.`);
  res.json({ status: 'healthy', id: INSTANCE_ID });
});

// Infrastructure & GCP Telemetry Endpoint for Cloud Dashboard
app.get('/api/infra/metrics', (req, res) => {
  const memUsage = process.memoryUsage();
  const memoryMb = Math.round(memUsage.heapUsed / 1024 / 1024);
  const uptimeSeconds = Math.round((Date.now() - bootTimestamp) / 1000);

  res.json({
    activeInstances: [
      {
        id: INSTANCE_ID,
        port: PORT,
        status: isHealthy ? 'healthy' : 'failing',
        pid: process.pid,
        requestsHandled: totalRequestsHandled,
        cpuUsage: `${Math.floor(8 + Math.random() * 10)}%`,
        memoryUsage: `${memoryMb} MB`
      }
    ],
    activeCount: isHealthy ? 1 : 0,
    minInstances: 1,
    maxInstances: 4,
    totalRequests: totalRequestsHandled,
    currentRps: totalRequestsHandled > 0 ? (totalRequestsHandled / Math.max(1, uptimeSeconds)).toFixed(1) : 1.2,
    lastServedInstance: INSTANCE_ID,
    lastResponseTime: '12ms',
    cloud: {
      provider: CLOUD_PROVIDER,
      service: CLOUD_SERVICE,
      region: CLOUD_REGION,
      projectId: GCP_PROJECT_ID,
      revision: GCP_REVISION,
      isGcp: isGoogleCloud,
      consoleUrl: `https://console.cloud.google.com/run?project=${GCP_PROJECT_ID}`
    },
    scalingEvents: [
      {
        id: 1,
        timestamp: new Date().toLocaleTimeString(),
        type: 'INFO',
        message: isGoogleCloud
          ? `Google Cloud Run container (${INSTANCE_ID}) active in region ${CLOUD_REGION}. Auto-scaling managed by GCP.`
          : `Standalone backend node ${INSTANCE_ID} online on port :${PORT}.`
      }
    ],
    history: [
      { time: '00:00', rps: 1.0, instances: 1 },
      { time: '00:05', rps: 1.5, instances: 1 }
    ],
    simulationMode: 'normal',
    mongoStatus: getDbStatus()
  });
});

app.post('/api/infra/simulate-traffic', (req, res) => {
  res.json({ success: true, rate: req.body.rate || 'normal' });
});

app.post('/api/infra/fail-instance', (req, res) => {
  isHealthy = false;
  res.json({ success: true, instanceId: INSTANCE_ID, status: 'failing' });
});

app.post('/api/infra/restore-instance', (req, res) => {
  isHealthy = true;
  res.json({ success: true, instanceId: INSTANCE_ID, status: 'healthy' });
});

// Application Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Static frontend serving (When built in production for Google Cloud Run)
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDistPath)) {
  console.log(`[Server] Serving production frontend build from ${frontendDistPath}`);
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
      cloudProvider: CLOUD_PROVIDER,
      cloudService: CLOUD_SERVICE,
      instanceId: INSTANCE_ID,
      port: PORT,
      status: isHealthy ? 'healthy' : 'failing',
      requestsHandled: totalRequestsHandled
    });
  });
}

// Connect to DB and start listening
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n================================================================`);
    console.log(`>>> [NEXORA Server] Online`);
    console.log(`>>> Provider: ${CLOUD_PROVIDER}`);
    console.log(`>>> Service: ${CLOUD_SERVICE}`);
    console.log(`>>> Instance: ${INSTANCE_ID}`);
    console.log(`>>> Listening on: http://0.0.0.0:${PORT}`);
    console.log(`================================================================\n`);
  });
});
