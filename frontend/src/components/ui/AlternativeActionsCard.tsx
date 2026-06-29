import React from 'react';
import { ToggleLeft } from 'lucide-react';

interface Alternative {
  action: string;
  confidence_score: number;
  business_impact: string;
  reasoning: string;
}

interface AlternativeActionsCardProps {
  alternatives: Alternative[] | string[];
}

export const AlternativeActionsCard: React.FC<AlternativeActionsCardProps> = ({ alternatives }) => {
  // Normalize alternative structure if they are strings
  const normalizedList: Alternative[] = React.useMemo(() => {
    if (!alternatives || !Array.isArray(alternatives)) return [];
    
    return alternatives.map((item, index) => {
      if (typeof item === 'string') {
        return {
          action: item,
          confidence_score: 80 - index * 10,
          business_impact: 'Medium',
          reasoning: 'Alternative playbooks trigger path option.'
        };
      }
      return item;
    });
  }, [alternatives]);

  return (
    <div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-neutral-450 dark:text-neutral-500">
        <ToggleLeft className="w-4 h-4 text-neutral-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Alternative Actions & Trade-offs
        </span>
      </div>

      <div className="space-y-3">
        {normalizedList.map((alt, idx) => (
          <div 
            key={idx} 
            className="p-3.5 border border-neutral-100 dark:border-neutral-800 rounded-xl hover:border-primary/20 dark:hover:border-primary/20 transition-colors duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                Option {idx + 1}: {alt.action}
              </span>
              <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {alt.confidence_score}% Confidence
              </span>
            </div>
            
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
              {alt.reasoning}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-semibold uppercase">
                Impact:
              </span>
              <span className="text-[9px] font-bold text-primary dark:text-primary-light bg-primary/10 px-2 py-0.5 rounded-full">
                {alt.business_impact}
              </span>
            </div>
          </div>
        ))}

        {normalizedList.length === 0 && (
          <p className="text-xs text-neutral-450 dark:text-neutral-500 text-center py-4">
            No alternative scenarios computed.
          </p>
        )}
      </div>
    </div>
  );
};
