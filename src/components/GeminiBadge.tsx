import React from 'react';
import { Sparkles, Activity, Compass, ThumbsDown } from 'lucide-react';

interface GeminiBadgeProps {
  type: 'ai' | 'urgency' | 'confidence' | 'category' | 'sentiment';
  value: string | number;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
}

export const GeminiBadge: React.FC<GeminiBadgeProps> = ({
  type,
  value,
  urgency,
  className = ''
}) => {
  if (type === 'ai') {
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase rounded-full text-white bg-gradient-to-r from-blue-600 via-indigo-500 to-teal-500 shadow-[0_2px_8px_rgba(59,130,246,0.25)] animate-gradient bg-[length:200%_auto] border border-blue-400/20 ${className}`}>
        <Sparkles size={10} className="animate-pulse" />
        AI {value}
      </span>
    );
  }

  if (type === 'urgency') {
    const urgencyMap = {
      low: 'bg-slate-100 text-slate-600 border-slate-200/50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50',
      medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 dark:bg-amber-950/20',
      high: 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400 dark:bg-orange-950/20',
      critical: 'bg-red-500/15 text-red-600 border-red-500/30 dark:text-red-400 dark:bg-red-950/30 animate-pulse-slow'
    };
    const active = urgency || 'low';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full border ${urgencyMap[active]} ${className}`}>
        {active}
      </span>
    );
  }

  if (type === 'confidence') {
    const scoreVal = typeof value === 'number' ? value : parseFloat(value.toString());
    const pct = Math.round(scoreVal * 100);
    const color = pct >= 90 
      ? 'text-teal-600 bg-teal-500/10 border-teal-500/20 dark:text-teal-400 dark:bg-teal-950/20' 
      : pct >= 80 
        ? 'text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400 dark:bg-blue-950/20' 
        : 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400 dark:bg-amber-950/20';
    
    return (
      <span className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${color} ${className}`}>
        <Sparkles size={9} />
        {pct}% confidence
      </span>
    );
  }

  if (type === 'sentiment') {
    const s = value.toString().toLowerCase();
    const map = {
      positive: 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400 dark:bg-green-950/20',
      negative: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400 dark:bg-red-950/20',
      neutral: 'bg-slate-100 text-slate-500 border-slate-200/50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50'
    };
    const active = s as 'positive' | 'negative' | 'neutral';
    
    const icon = active === 'positive' ? <Compass size={9} /> : active === 'negative' ? <ThumbsDown size={9} /> : <Activity size={9} />;

    return (
      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-bold rounded-full border ${map[active] || map.neutral} ${className}`}>
        {icon}
        {s}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-slate-100 text-slate-500 border border-slate-200/40 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50 ${className}`}>
      {value}
    </span>
  );
};
