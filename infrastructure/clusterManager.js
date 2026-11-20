const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const metricsStore = require('./metricsStore');

const BACKEND_SCRIPT = path.join(__dirname, '..', 'backend', 'server.js');

class ClusterManager {
  constructor() {
    this.instances = [
      { id: 'backend-1', port: 5001, process: null, status: 'down', requestsHandled: 0, cpuUsage: '10%', memoryUsage: '45 MB' },
      { id: 'backend-2', port: 5002, process: null, status: 'down', requestsHandled: 0, cpuUsage: '8%', memoryUsage: '42 MB' },
      { id: 'backend-3', port: 5003, process: null, status: 'down', requestsHandled: 0, cpuUsage: '0%', memoryUsage: '0 MB' },
      { id: 'backend-4', port: 5004, process: null, status: 'down', requestsHandled: 0, cpuUsage: '0%', memoryUsage: '0 MB' }
    ];

    setInterval(() => {
      this.probeAllInstances();
    }, 1500);
  }

  startInstance(index) {
    const inst = this.instances[index - 1];
    if (!inst) return null;
    if (inst.process && !inst.process.killed) {
      return inst;
    }

    console.log(`[ClusterManager] Spawning process for ${inst.id} on port ${inst.port}...`);
    
    const child = spawn(process.execPath, [
      BACKEND_SCRIPT,
      '--port', String(inst.port),
      '--id', inst.id
    ], {
      env: {
        ...process.env,
        PORT: String(inst.port),
        NODE_INSTANCE_ID: inst.id
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    child.on('exit', (code) => {
      console.log(`[ClusterManager] ${inst.id} exited with code ${code}`);
      inst.process = null;
      inst.status = 'down';
    });

    inst.process = child;
    inst.status = 'healthy';
    inst.pid = child.pid;

    metricsStore.addEvent('INFO', `Process started for ${inst.id} (PID: ${child.pid}) on port :${inst.port}`);
    return inst;
  }

  stopInstance(index) {
    const inst = this.instances[index - 1];
    if (!inst || !inst.process) return false;

    console.log(`[ClusterManager] Terminating process for ${inst.id} (PID: ${inst.pid})...`);
    try {
      inst.process.kill('SIGTERM');
    } catch (e) {
      console.error(e);
    }
    inst.process = null;
    inst.status = 'down';

    metricsStore.addEvent('INFO', `Process terminated for ${inst.id} on port :${inst.port}`);
    return true;
  }

  probeInstance(inst) {
    return new Promise((resolve) => {
      if (!inst.process || inst.process.killed) {
        inst.status = 'down';
        return resolve(false);
      }

      const req = http.get(`http://127.0.0.1:${inst.port}/health`, { timeout: 1000 }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const data = JSON.parse(body);
              inst.status = 'healthy';
              inst.requestsHandled = data.requestsHandled || inst.requestsHandled;
              inst.cpuUsage = data.cpuUsage || '12%';
              inst.memoryUsage = data.memoryUsage || '45 MB';
              resolve(true);
            } catch {
              inst.status = 'healthy';
              resolve(true);
            }
          } else {
            inst.status = 'failing';
            resolve(false);
          }
        });
      });

      req.on('error', () => {
        inst.status = 'failing';
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        inst.status = 'failing';
        resolve(false);
      });
    });
  }

  async probeAllInstances() {
    for (const inst of this.instances) {
      if (inst.process) {
        await this.probeInstance(inst);
      } else {
        inst.status = 'down';
      }
    }
  }

  getHealthyInstances() {
    return this.instances.filter(i => i.status === 'healthy');
  }

  getAllInstances() {
    return this.instances.map(i => ({
      id: i.id,
      port: i.port,
      status: i.status,
      pid: i.pid || null,
      requestsHandled: i.requestsHandled,
      cpuUsage: i.cpuUsage,
      memoryUsage: i.memoryUsage
    }));
  }

  shutdownAll() {
    for (const inst of this.instances) {
      if (inst.process) {
        try {
          inst.process.kill();
        } catch {}
      }
    }
  }
}

module.exports = new ClusterManager();
