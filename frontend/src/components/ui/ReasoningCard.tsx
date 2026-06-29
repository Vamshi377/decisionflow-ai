import React from 'react';
import { HelpCircle, FileText } from 'lucide-react';

interface ReasoningCardProps {
  reasoning: string;
  evidence?: string;
}

export const ReasoningCard: React.FC<ReasoningCardProps> = ({ reasoning, evidence }) => {
  return (
    <div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-sm space-y-5">
      {/* Rationale Section */}
      <div>
        <div className="flex items-center gap-2 text-neutral-450 dark:text-neutral-500 mb-2">
          <HelpCircle className="w-4 h-4 text-neutral-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Agentic Business Reasoning
          </span>
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
          {reasoning}
        </p>
      </div>

      {/* Evidence Section */}
      {evidence && (
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-450 dark:text-neutral-500 mb-2">
            <FileText className="w-4 h-4 text-neutral-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Supporting Evidence & Playbooks
            </span>
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-950 p-3 rounded-lg border border-neutral-100 dark:border-neutral-900 font-mono leading-relaxed whitespace-pre-line">
            {evidence}
          </div>
        </div>
      )}
    </div>
  );
};
