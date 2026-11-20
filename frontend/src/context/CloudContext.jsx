import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CloudContext = createContext();

export const CloudProvider = ({ children }) => {
  const [metrics, setMetrics] = useState({
    activeInstances: [
      { id: 'backend-1', port: 5001, status: 'healthy', requestsHandled: 14, cpuUsage: '14%', memoryUsage: '48 MB' },
      { id: 'backend-2', port: 5002, status: 'healthy', requestsHandled: 10, cpuUsage: '11%', memoryUsage: '45 MB' }
    ],
    activeCount: 2,
    minInstances: 2,
    maxInstances: 4,
    totalRequests: 24,
    currentRps: 1.4,
    mongoStatus: 'Connected to Local MongoDB (Port 27017)',
    cloud: {
      provider: 'NEXORA Cloud Cluster',
      service: 'Round-Robin Multi-Instance Cluster',
      region: 'local / us-central1',
      projectId: 'nexora-demo',
      revision: 'v1.0.0',
      isGcp: false,
      consoleUrl: 'https://console.cloud.google.com/run'
    },
    scalingEvents: [
      { id: 1, timestamp: new Date().toLocaleTimeString(), type: 'INFO', message: 'NEXORA cluster initialized with 2 baseline instances (:5001, :5002).' }
    ],
    history: [
      { time: '00:00', rps: 1.2, instances: 2 },
      { time: '00:02', rps: 1.5, instances: 2 },
      { time: '00:04', rps: 1.3, instances: 2 },
      { time: '00:06', rps: 1.4, instances: 2 }
    ],
    lastServedInstance: 'backend-1',
    lastResponseTime: '12ms'
  });

  const [simulationMode, setSimulationMode] = useState('normal'); // 'normal' | 'surge' | 'low'
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Poll metrics from backend every 2 seconds
  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/infra/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(prev => ({
          ...prev,
          ...data,
          history: Array.isArray(data.history) && data.history.length > 0 ? data.history : prev.history
        }));
        setIsLiveConnected(true);
      }
    } catch {
      setIsLiveConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  // Record instance header whenever an API request completes
  const recordApiCall = useCallback((instanceId, responseTime) => {
    if (instanceId) {
      setMetrics(prev => {
        const existingInst = prev.activeInstances.find(i => i.id === instanceId);
        let updatedInstances;
        if (existingInst) {
          updatedInstances = prev.activeInstances.map(inst =>
            inst.id === instanceId ? { ...inst, requestsHandled: inst.requestsHandled + 1, status: 'healthy' } : inst
          );
        } else {
          updatedInstances = [
            ...prev.activeInstances,
            { id: instanceId, port: 5000, status: 'healthy', requestsHandled: 1, cpuUsage: '12%', memoryUsage: '45 MB' }
          ];
        }

        return {
          ...prev,
          lastServedInstance: instanceId,
          lastResponseTime: responseTime || `${Math.floor(8 + Math.random() * 15)}ms`,
          totalRequests: prev.totalRequests + 1,
          activeCount: updatedInstances.filter(i => i.status === 'healthy').length,
          activeInstances: updatedInstances
        };
      });
    }
  }, []);

  // Simulation controls that trigger real server updates and live graph changes
  const triggerTrafficSurge = async () => {
    setSimulationMode('surge');
    try {
      await fetch('/api/infra/simulate-traffic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: 'high' })
      });
    } catch {}

    // Send rapid burst to drive live load
    const requests = Array.from({ length: 15 }, () =>
      fetch('/api/products?burst=' + Math.random()).catch(() => {})
    );
    await Promise.all(requests);
    fetchMetrics();
  };

  const triggerNormalTraffic = async () => {
    setSimulationMode('normal');
    try {
      await fetch('/api/infra/simulate-traffic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: 'normal' })
      });
    } catch {}
    setTimeout(fetchMetrics, 300);
  };

  const triggerLowTraffic = async () => {
    setSimulationMode('low');
    try {
      await fetch('/api/infra/simulate-traffic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: 'low' })
      });
    } catch {}
    setTimeout(fetchMetrics, 300);
  };

  const failServer = async (instanceId) => {
    const target = instanceId || 'backend-2';
    try {
      await fetch('/api/infra/fail-instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceId: target })
      });
    } catch {}
    setTimeout(fetchMetrics, 300);
  };

  const restoreServer = async (instanceId) => {
    const target = instanceId || 'backend-2';
    try {
      await fetch('/api/infra/restore-instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceId: target })
      });
    } catch {}
    setTimeout(fetchMetrics, 300);
  };

  return (
    <CloudContext.Provider
      value={{
        metrics,
        simulationMode,
        isLiveConnected,
        recordApiCall,
        triggerTrafficSurge,
        triggerNormalTraffic,
        triggerLowTraffic,
        failServer,
        restoreServer,
        refreshMetrics: fetchMetrics
      }}
    >
      {children}
    </CloudContext.Provider>
  );
};

export const useCloud = () => useContext(CloudContext);
