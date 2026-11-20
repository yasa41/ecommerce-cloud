import React from 'react';
import { Server, Activity } from 'lucide-react';
import { useCloud } from '../context/CloudContext';

export const InstanceBadge = ({ compact = false }) => {
  const { metrics } = useCloud();

  const instanceColors = {
    'backend-1': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'backend-2': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    'backend-3': 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    'backend-4': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  };

  const currentInstance = metrics.lastServedInstance || 'backend-1';
  const colorClass = instanceColors[currentInstance] || 'bg-slate-700/50 text-slate-300 border-slate-600';

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border backdrop-blur-sm ${colorClass}`}>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>{currentInstance}</span>
        <span className="text-gray-400 text-[10px]">({metrics.lastResponseTime})</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border backdrop-blur-sm ${colorClass}`}>
      <Server className="w-3.5 h-3.5" />
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="font-semibold">{currentInstance}</span>
      </div>
      <span className="text-gray-400">|</span>
      <div className="flex items-center gap-1 text-gray-300">
        <Activity className="w-3 h-3 text-emerald-400" />
        <span>{metrics.lastResponseTime}</span>
      </div>
    </div>
  );
};

