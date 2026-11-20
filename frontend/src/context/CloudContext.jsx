import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CloudContext = createContext();

export const CloudProvider = ({ children }) => {
  const [metrics, setMetrics] = useState({
    activeInstances: [
      { id: 'cloud-run-primary', port: 8080, status: 'healthy', requestsHandled: 0, cpuUsage: '12%', memoryUsage: '48 MB' }
    ],
    activeCount: 1,
    minInstances: 1,
    maxInstances: 4,
    totalRequests: 0,
    currentRps: 1.2,
    mongoStatus: 'Connected',
    mongoHost: 'MongoDB / Google Cloud',
    cloud: {
      provider: 'Google Cloud Platform (GCP)',
      service: 'Google Cloud Run',
      region: 'us-central1',
      projectId: 'nexora-gcp',
      revision: 'nexora-v1',
      isGcp: false,
      consoleUrl: 'https://console.cloud.google.com/run'
    },
    scalingEvents: [
      { id: 1, timestamp: new Date().toLocaleTimeString(), type: 'INFO', message: 'NEXORA connected to Google Cloud infrastructure.' }
    ],
    history: [
      { time: '00:00', rps: 1, instances: 1 },
      { time: '00:05', rps: 2, instances: 1 },
      { time: '00:10', rps: 1, instances: 1 },
      { time: '00:15', rps: 2, instances: 1 }
    ],
    lastServedInstance: 'cloud-run-primary',
    lastResponseTime: '12ms'
  });

  const [simulationMode, setSimulationMode] = useState('normal'); // 'normal' | 'surge' | 'low'
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Poll metrics from backend
  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/infra/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(prev => ({
          ...prev,
          ...data,
          cloud: {
            ...prev.cloud,
            ...(data.cloud || {})
          },
          history: data.history && data.history.length > 0 ? data.history : prev.history
        }));
        setIsLiveConnected(true);
      }
    } catch {
      setIsLiveConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2500);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  // Record instance header whenever an API request completes
  const recordApiCall = (instanceId, responseTime) => {
    if (instanceId) {
      setMetrics(prev => {
        const existingInst = prev.activeInstances.find(i => i.id === instanceId);
        let updatedInstances;
        if (existingInst) {
          updatedInstances = prev.activeInstances.map(inst =>
            inst.id === instanceId ? { ...inst, requestsHandled: inst.requestsHandled + 1, status: 'healthy' } : inst
          );
        } else {
          // Discovered a new container instance spawned by Google Cloud Run!
          updatedInstances = [
            ...prev.activeInstances,
            { id: instanceId, port: 8080, status: 'healthy', requestsHandled: 1, cpuUsage: '18%', memoryUsage: '45 MB' }
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
  };

  // Generate real concurrent HTTP load to test Google Cloud Run autoscaling
  const triggerTrafficSurge = async () => {
    setSimulationMode('surge');
    setMetrics(prev => ({
      ...prev,
      scalingEvents: [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'SCALE_UP',
          message: 'Firing 25 concurrent requests to trigger Google Cloud Run autoscaler...'
        },
        ...prev.scalingEvents
      ]
    }));

    // Fire 25 concurrent requests to generate real traffic for GCP Cloud Run
    const requests = Array.from({ length: 25 }, () =>
      fetch('/api/products?t=' + Math.random())
        .then(res => {
          const instId = res.headers.get('x-backend-instance');
          if (instId) recordApiCall(instId, '15ms');
        })
        .catch(() => {})
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

    setMetrics(prev => ({
      ...prev,
      currentRps: 1.5,
      scalingEvents: [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'SCALE_DOWN',
          message: 'Traffic normalized. Cloud Run maintains baseline instances.'
        },
        ...prev.scalingEvents
      ]
    }));
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

    setMetrics(prev => ({
      ...prev,
      currentRps: 0.5
    }));
  };

  const failServer = async (instanceId) => {
    try {
      await fetch('/api/infra/fail-instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceId })
      });
    } catch {}

    setMetrics(prev => ({
      ...prev,
      activeInstances: prev.activeInstances.map(inst =>
        inst.id === instanceId ? { ...inst, status: 'failing' } : inst
      ),
      scalingEvents: [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'ALERT',
          message: `Simulated outage on ${instanceId}. Google Cloud load balancer reroutes traffic.`
        },
        ...prev.scalingEvents
      ]
    }));
  };

  const restoreServer = async (instanceId) => {
    try {
      await fetch('/api/infra/restore-instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceId })
      });
    } catch {}

    setMetrics(prev => ({
      ...prev,
      activeInstances: prev.activeInstances.map(inst =>
        inst.id === instanceId ? { ...inst, status: 'healthy' } : inst
      ),
      scalingEvents: [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'INFO',
          message: `Container ${instanceId} restored to healthy status.`
        },
        ...prev.scalingEvents
      ]
    }));
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
