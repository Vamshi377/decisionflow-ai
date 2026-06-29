import React from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';

interface RecommendationCardProps {
  primaryAction: string;
  confidence: number;
  businessImpact: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  primaryAction,
  confidence,
  businessImpact
}) => {
  return (
    <div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 text-primary dark:text-primary-light mb-4">
        <Sparkles className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Primary Next Best Action
        </span>
      </div>

      <h2 className="text-base font-bold text-neutral-950 dark:text-white leading-snug">
        {primaryAction}
      </h2>

      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <div>
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
            Confidence Score
          </span>
          <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-1 block">
            {confidence}%
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-neutral-400" /> Business Impact
          </span>
          <span className={`text-xs font-bold mt-1 inline-block px-2.5 py-0.5 rounded-full ${
            businessImpact.toLowerCase() === 'high' 
              ? 'text-primary bg-primary/10' 
              : 'text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300'
          }`}>
            {businessImpact} Impact
          </span>
        </div>
      </div>
    </div>
  );
};
