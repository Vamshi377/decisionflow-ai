import React from 'react';
import { Award } from 'lucide-react';

interface ExecutiveSummaryCardProps {
  summary: string;
}

export const ExecutiveSummaryCard: React.FC<ExecutiveSummaryCardProps> = ({ summary }) => {
  return (
    <div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl shadow-sm space-y-3">
      <div className="flex items-center gap-2 text-neutral-450 dark:text-neutral-500">
        <Award className="w-4 h-4 text-neutral-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Executive Summary
        </span>
      </div>

      <div className="p-4 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 shadow-inner">
        <p className="text-xs text-neutral-600 dark:text-neutral-350 leading-relaxed font-semibold italic">
          "{summary}"
        </p>
      </div>
    </div>
  );
};
