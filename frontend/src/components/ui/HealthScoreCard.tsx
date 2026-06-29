import React from 'react';

interface HealthScoreCardProps {
  score: number;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ score }) => {
  const getColor = (val: number) => {
    if (val < 50) return 'text-danger bg-danger/10 border-danger/25';
    if (val < 75) return 'text-warning bg-warning/10 border-warning/25';
    return 'text-success bg-success/10 border-success/25';
  };

  const getStrokeColor = (val: number) => {
    if (val < 50) return '#EF4444'; // red
    if (val < 75) return '#F59E0B'; // amber
    return '#10B981'; // emerald
  };

  const statusColor = getColor(score);
  const strokeColor = getStrokeColor(score);
  
  // Circle calculations
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-sm text-center">
      <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
        Account Health Index
      </span>
      
      <div className="relative flex items-center justify-center w-24 h-24 mb-3">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="stroke-neutral-100 dark:stroke-neutral-800"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <span className="absolute text-2xl font-bold tracking-tight text-neutral-955 dark:text-white">
          {score}
        </span>
      </div>

      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${statusColor}`}>
        {score < 50 ? 'Critical Health' : score < 75 ? 'At Risk' : 'Healthy Account'}
      </span>
    </div>
  );
};
