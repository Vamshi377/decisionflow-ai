import React from 'react';

interface ConfidenceCardProps {
  score: number;
}

export const ConfidenceCard: React.FC<ConfidenceCardProps> = ({ score }) => {
  // SVG circular progress details
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-sm flex items-center justify-between">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
          Recommendation Certitude
        </span>
        <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
          Agent Alignment
        </h3>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 max-w-[12rem] leading-relaxed">
          Confidence score derived from consensus weights across Planner, Signal, and Knowledge.
        </p>
      </div>

      <div className="relative flex items-center justify-center w-20 h-20">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-neutral-100 dark:stroke-neutral-800"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="#06B6D4" // accent color (cyan)
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <span className="absolute text-base font-bold text-neutral-900 dark:text-white">
          {score}%
        </span>
      </div>
    </div>
  );
};
