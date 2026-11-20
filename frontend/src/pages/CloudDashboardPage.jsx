import React, { useState } from 'react';
import { 
  Server, 
  Activity, 
  Database, 
  Cpu, 
  Zap, 
  RefreshCw, 
  Flame, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  Layers,
  SlidersHorizontal,
  Terminal,
  CheckCircle,
  ExternalLink,
  Cloud,
  Globe
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell
} from 'recharts';
import { useCloud } from '../context/CloudContext';

export const CloudDashboardPage = () => {
  const { 
    metrics, 
    simulationMode, 
    isLiveConnected,
    triggerTrafficSurge, 
    triggerNormalTraffic, 
    triggerLowTraffic, 
    failServer, 
    restoreServer,
    refreshMetrics
  } = useCloud();

  const isGcp = metrics.cloud?.isGcp;
  const cloudProvider = metrics.cloud?.provider || 'Google Cloud Platform (GCP)';
  const cloudService = metrics.cloud?.service || 'Google Cloud Run';
  const cloudRegion = metrics.cloud?.region || 'us-central1';

  // Chart data for instance distribution
  const instanceDistributionData = (metrics.activeInstances || []).map((inst, index) => ({
    name: inst.id,
    port: inst.port,
    requests: inst.requestsHandled || 0,
    status: inst.status,
    color: ['#4285F4', '#34A853', '#FBBC05', '#EA4335'][index % 4] // Google Cloud primary colors
  }));

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Google Cloud Infrastructure Center
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                  isGcp
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                }`}>
                  {isGcp ? 'GCP CLOUD RUN LIVE' : 'GCP READY (CLOUD RUN)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {cloudProvider} • {cloudService} • Region: <span className="font-mono text-slate-300">{cloudRegion}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls & Google Cloud Console Link */}
        <div className="flex items-center gap-3">
          <a
            href="https://console.cloud.google.com/run"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            <span>Google Cloud Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">DB:</span>
            <span className="text-emerald-400 font-semibold">{metrics.mongoStatus || 'MongoDB Connected'}</span>
          </div>

          <button
            onClick={refreshMetrics}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Active Cloud Run Instances */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Cloud Run Instances</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
              {metrics.activeCount || 1}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              / max {metrics.maxInstances || 4}
            </span>
          </div>
          <div className="text-[11px] text-blue-400 flex items-center gap-1 font-mono">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Managed Auto-Scaling: Concurrency 80
          </div>
        </div>

        {/* Total Cluster Requests */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Total Handled</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
              {(metrics.totalRequests || 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-mono">requests</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400 animate-ping" />
            Current: {metrics.currentRps || 1.2} Req / sec
          </div>
        </div>

        {/* Google Cloud Load Balancing */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">GCP Load Balancer</span>
            <Globe className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-yellow-400 font-mono">
              Global Anycast
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            HTTPS Termination • Auto SSL
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Shared Database</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              MongoDB
            </span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            Synchronized across all instances
          </div>
        </div>

      </div>

      {/* Real-World Traffic Generator & Autoscaler Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">
              Google Cloud Autoscaling & Load Testing
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Triggers real parallel HTTP bursts to test GCP container autoscaling
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Surge Traffic Button */}
          <button
            onClick={triggerTrafficSurge}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
              simulationMode === 'surge'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/10'
                : 'bg-slate-950/60 border-slate-800 hover:border-rose-500/50 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 text-rose-400">
                <Flame className="w-4 h-4 text-rose-500" /> 1. Generate Traffic Surge
              </span>
              {simulationMode === 'surge' && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>}
            </div>
            <h4 className="text-sm font-bold text-white">Burst 25 Concurrent Calls</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Sends 25 parallel API requests to trigger Google Cloud Run autoscaler to launch new container instances.
            </p>
          </button>

          {/* Normal Traffic Button */}
          <button
            onClick={triggerNormalTraffic}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
              simulationMode === 'normal'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-950/60 border-slate-800 hover:border-emerald-500/50 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 2. Normal Traffic
              </span>
              {simulationMode === 'normal' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>}
            </div>
            <h4 className="text-sm font-bold text-white">Baseline Steady State</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Restores steady traffic (~1-2 RPS). Google Cloud Run maintains baseline container.
            </p>
          </button>

          {/* Low Traffic Button */}
          <button
            onClick={triggerLowTraffic}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
              simulationMode === 'low'
                ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/10'
                : 'bg-slate-950/60 border-slate-800 hover:border-blue-500/50 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 text-blue-400">
                <TrendingDown className="w-4 h-4 text-blue-500" /> 3. Idle / Low Traffic
              </span>
              {simulationMode === 'low' && <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>}
            </div>
            <h4 className="text-sm font-bold text-white">Minimal Idle Mode</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Simulates idle periods with near-zero traffic.
            </p>
          </button>

          {/* Chaos / Fault Injection */}
          <div className="p-4 rounded-2xl border bg-slate-950/60 border-slate-800 text-slate-300 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-400 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> 4. Health Check Probe
              </span>
              <h4 className="text-sm font-bold text-white">Failover Testing</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Simulates container health degradation to test failover routing.
              </p>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => failServer(metrics.lastServedInstance)}
                className="flex-1 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-[10px] font-bold font-mono transition-colors"
              >
                Degrade Health
              </button>
              <button
                onClick={() => restoreServer(metrics.lastServedInstance)}
                className="flex-1 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold font-mono transition-colors"
              >
                Restore Health
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Cloud Run Container Instances Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            Google Cloud Run Containers ({metrics.activeCount || 1} Active)
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Provider: {cloudProvider}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(metrics.activeInstances || []).map((instance) => {
            const isFailing = instance.status === 'failing';
            const isHealthy = instance.status === 'healthy';

            return (
              <div
                key={instance.id}
                className={`rounded-2xl border p-5 space-y-4 relative overflow-hidden transition-all ${
                  isFailing
                    ? 'bg-rose-950/20 border-rose-800/80'
                    : isHealthy
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-900/50 border-slate-800/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      isFailing ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'
                    }`}></div>
                    <span className="font-mono font-bold text-sm text-white truncate max-w-40" title={instance.id}>
                      {instance.id}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isFailing
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {instance.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono divide-y divide-slate-800/60 pt-1">
                  <div className="flex justify-between text-slate-400 pb-1.5">
                    <span>Container Port</span>
                    <span className="text-slate-200 font-bold">:{instance.port}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 py-1.5">
                    <span>CPU Workload</span>
                    <span className="text-slate-200 font-semibold">{instance.cpuUsage || '10%'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 py-1.5">
                    <span>Memory Used</span>
                    <span className="text-slate-200 font-semibold">{instance.memoryUsage || '48 MB'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pt-1.5">
                    <span>Requests Served</span>
                    <span className="text-blue-400 font-bold">{instance.requestsHandled || 0}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Region:</span>
                  <span className="text-slate-200">{cloudRegion}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recharts Traffic & Instance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Live Traffic Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Traffic Timeline (Requests / Sec)
              </h3>
              <p className="text-xs text-slate-400">Incoming request load over time</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              {metrics.currentRps} RPS
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.history || []}>
                <defs>
                  <linearGradient id="colorGcpRps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4285F4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4285F4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontStyle="mono" />
                <YAxis stroke="#64748b" fontSize={11} fontStyle="mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  itemStyle={{ color: '#4285F4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="rps" 
                  stroke="#4285F4" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorGcpRps)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Requests Per Container Instance */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                Load Balancer Request Distribution
              </h3>
              <p className="text-xs text-slate-400">Requests handled across active container instances</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={instanceDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontStyle="mono" />
                <YAxis stroke="#64748b" fontSize={11} fontStyle="mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="requests" radius={[8, 8, 0, 0]}>
                  {instanceDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Google Cloud Events Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-400" />
            <h3 className="text-base font-bold text-white">
              Google Cloud Audit & Autoscaling Event Stream
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Real-time cluster telemetry
          </span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar font-mono text-xs">
          {(metrics.scalingEvents || []).map(event => (
            <div
              key={event.id}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3"
            >
              <span className="text-slate-500 text-[11px] whitespace-nowrap">
                {event.timestamp}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                event.type === 'SCALE_UP'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : event.type === 'SCALE_DOWN'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : event.type === 'ALERT'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {event.type}
              </span>
              <span className="text-slate-300 leading-relaxed">
                {event.message}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
