const { spawn } = require('child_process');
const path = require('path');

console.log('================================================================');
console.log('         NEXORA CLOUD E-COMMERCE & INFRASTRUCTURE SYSTEM        ');
console.log('================================================================');
console.log('1. Starting Load Balancer & Auto-Scaling Cluster Manager (:5000)');
console.log('2. Starting Vite React Frontend Client (:3000)');
console.log('----------------------------------------------------------------\n');

// 1. Start Infrastructure (Load Balancer + Cluster Manager)
const infraProcess = spawn(process.execPath, [path.join(__dirname, 'infrastructure', 'loadBalancer.js')], {
  stdio: 'inherit'
});

// 2. Start Frontend
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const frontendProcess = spawn(npmCmd, ['run', 'dev', '--prefix', 'frontend'], {
  stdio: 'inherit'
});

function cleanup() {
  console.log('\n[Orchestrator] Shutting down NEXORA services...');
  try {
    infraProcess.kill();
    frontendProcess.kill();
  } catch {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
