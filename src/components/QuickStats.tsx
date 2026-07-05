import React from 'react';
import { GlassCard } from './GlassCard';
import { 
  Inbox, 
  AlertOctagon, 
  CheckCircle2, 
  TrendingUp 
} from 'lucide-react';

interface QuickStatsProps {
  stats: {
    totalComplaints: number;
    activeIssues: number;
    resolvedIssues: number;
    highPriority: number;
  };
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Submissions',
      value: stats.totalComplaints,
      icon: <Inbox className="text-primary" size={20} />,
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
      description: 'Incoming citizen requests'
    },
    {
      title: 'Active Issues',
      value: stats.activeIssues,
      icon: <TrendingUp className="text-secondary" size={20} />,
      bgColor: 'bg-teal-500/10 dark:bg-teal-500/20',
      description: 'Under review or processing'
    },
    {
      title: 'Resolved Projects',
      value: stats.resolvedIssues,
      icon: <CheckCircle2 className="text-success" size={20} />,
      bgColor: 'bg-green-500/10 dark:bg-green-500/20',
      description: 'Development completed'
    },
    {
      title: 'High Priority Alerts',
      value: stats.highPriority,
      icon: <AlertOctagon className="text-error animate-pulse" size={20} />,
      bgColor: 'bg-red-500/10 dark:bg-red-500/20',
      description: 'Require immediate MP attention'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {cards.map((card, idx) => (
        <GlassCard key={idx} className="flex items-start gap-4 p-5" delay={idx * 0.05}>
          <div className={`p-3 rounded-2xl ${card.bgColor} shrink-0`}>
            {card.icon}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{card.title}</span>
            <span className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">{card.value}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">{card.description}</span>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};
