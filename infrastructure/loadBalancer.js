const express = require('express');
const cors = require('cors');
const http = require('http');
const clusterManager = require('./clusterManager');
const autoScaler = require('./autoScaler');
const metricsStore = require('./metricsStore');

const PORT = process.env.LB_PORT || 5000;
const app = express();

let roundRobinIndex = 0;

app.use(cors());
app.use(express.json());

// Reverse proxy forwarding
function forwardRequest(targetInstance, req, res) {
  const startTime = process.hrtime();
  const options = {
    hostname: '127.0.0.1',
    port: targetInstance.port,
    path: req.originalUrl,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${targetInstance.port}`,
      'x-forwarded-for': req.ip,
      'x-forwarded-host': req.headers.host,
      'x-load-balancer': 'nexora-rr-proxy'
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    const diff = process.hrtime(startTime);
    const durationMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6);

    targetInstance.requestsHandled = (targetInstance.requestsHandled || 0) + 1;
    metricsStore.recordRequest(targetInstance.id, durationMs);

    Object.keys(proxyRes.headers).forEach(header => {
      res.setHeader(header, proxyRes.headers[header]);
    });

    res.setHeader('X-Backend-Instance', targetInstance.id);
    res.setHeader('X-Backend-Port', targetInstance.port);
    res.setHeader('X-Response-Time', `${durationMs}ms`);
    res.setHeader('X-Load-Balancer', 'NEXORA-RoundRobin-5000');

    res.status(proxyRes.statusCode);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`[LoadBalancer] Error forwarding to ${targetInstance.id}:`, err.message);
    metricsStore.addEvent('ALERT', `Failed to reach ${targetInstance.id} on port :${targetInstance.port}. Rerouting...`);
    targetInstance.status = 'failing';
    res.status(502).json({
      error: `Bad Gateway: Target instance ${targetInstance.id} unreachable`,
      instanceId: targetInstance.id
    });
  });

  if (req.body && Object.keys(req.body).length > 0) {
    const bodyData = JSON.stringify(req.body);
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  }

  proxyReq.end();
}

// Telemetry & metrics endpoint queried by the Cloud Control Center dashboard
app.get('/api/infra/metrics', (req, res) => {
  const snapshot = metricsStore.getSnapshot(clusterManager.getAllInstances());
  res.json(snapshot);
});

app.post('/api/infra/simulate-traffic', (req, res) => {
  const { rate } = req.body;
  autoScaler.setTrafficSimulation(rate || 'normal');
  res.json({ success: true, rate });
});

app.post('/api/infra/fail-instance', async (req, res) => {
  const { instanceId } = req.body;
  const inst = clusterManager.instances.find(i => i.id === instanceId);
  if (!inst) return res.status(404).json({ error: 'Instance not found' });

  try {
    const postReq = http.request({
      hostname: '127.0.0.1',
      port: inst.port,
      path: '/health/fail',
      method: 'POST'
    }, () => {});
    postReq.on('error', () => {});
    postReq.end();
  } catch {}

  inst.status = 'failing';
  metricsStore.addEvent('ALERT', `Instance ${instanceId} forced to FAILING state. Removed from Load Balancer pool.`);
  res.json({ success: true, instanceId, status: 'failing' });
});

app.post('/api/infra/restore-instance', async (req, res) => {
  const { instanceId } = req.body;
  const inst = clusterManager.instances.find(i => i.id === instanceId);
  if (!inst) return res.status(404).json({ error: 'Instance not found' });

  try {
    const postReq = http.request({
      hostname: '127.0.0.1',
      port: inst.port,
      path: '/health/restore',
      method: 'POST'
    }, () => {});
    postReq.on('error', () => {});
    postReq.end();
  } catch {}

  inst.status = 'healthy';
  metricsStore.addEvent('INFO', `Instance ${instanceId} restored to HEALTHY state. Re-added to Load Balancer pool.`);
  res.json({ success: true, instanceId, status: 'healthy' });
});

// Proxy client API requests
app.use('/api', (req, res) => {
  const healthyInstances = clusterManager.getHealthyInstances();

  if (healthyInstances.length === 0) {
    metricsStore.addEvent('ALERT', 'CRITICAL: No healthy backend instances available to serve request!');
    return res.status(503).json({
      error: 'Service Unavailable: All backend instances are down or failing health checks'
    });
  }

  const selectedInstance = healthyInstances[roundRobinIndex % healthyInstances.length];
  roundRobinIndex++;

  forwardRequest(selectedInstance, req, res);
});

// Clean termination handling
process.on('SIGINT', () => {
  console.log('\n[LoadBalancer] Terminating cluster manager and shutting down...');
  clusterManager.shutdownAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  clusterManager.shutdownAll();
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n================================================================`);
  console.log(`>>> [NEXORA Load Balancer] Listening on http://localhost:${PORT}`);
  console.log(`>>> Reverse Proxy: Round-Robin distribution over ports 5001-5004`);
  console.log(`>>> Cloud Metrics API: http://localhost:${PORT}/api/infra/metrics`);
  console.log(`================================================================\n`);
});
