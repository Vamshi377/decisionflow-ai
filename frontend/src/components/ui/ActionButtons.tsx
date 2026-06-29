import React, { useState } from 'react';
import { apiService } from '../../services/api';
import { Check, X, Edit, Loader2, AlertCircle } from 'lucide-react';

interface ActionButtonsProps {
  recommendationId: number;
  currentAction: string;
  onDecisionCompleted: (status: 'approved' | 'rejected' | 'modified') => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  recommendationId,
  currentAction,
  onDecisionCompleted
}) => {
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifiedText, setModifiedText] = useState(currentAction);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDecision = async (status: 'approved' | 'rejected' | 'modified', customAction?: string) => {
    setError(null);
    setSubmitting(status);
    try {
      await apiService.submitDecision(
        recommendationId, 
        status, 
        status === 'modified' ? customAction : undefined,
        status === 'modified' ? notes : undefined
      );
      setSubmitting(null);
      setShowModifyModal(false);
      onDecisionCompleted(status);
    } catch (err: any) {
      setSubmitting(null);
      setError(err?.response?.data?.detail || `Failed to submit recommendation ${status}.`);
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Success/Error status */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-xs font-semibold text-danger bg-danger/10 border border-danger/20 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Buttons row */}
      <div className="flex items-center gap-3">
        {/* Approve button */}
        <button
          onClick={() => handleDecision('approved')}
          disabled={!!submitting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-success hover:bg-success-dark active:scale-[0.98] transition-all duration-150 shadow-sm shadow-success/20 disabled:opacity-60"
        >
          {submitting === 'approved' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Approve Action
        </button>

        {/* Reject button */}
        <button
          onClick={() => handleDecision('rejected')}
          disabled={!!submitting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-danger hover:bg-danger-dark active:scale-[0.98] transition-all duration-150 shadow-sm shadow-danger/20 disabled:opacity-60"
        >
          {submitting === 'rejected' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <X className="w-4 h-4" />
          )}
          Reject Action
        </button>

        {/* Modify button */}
        <button
          onClick={() => {
            setModifiedText(currentAction);
            setNotes('');
            setShowModifyModal(true);
          }}
          disabled={!!submitting}
          className="flex items-center justify-center gap-2 py-2.5 px-4 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-350 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-950 active:scale-[0.98] transition-all duration-150"
        >
          <Edit className="w-4 h-4" />
          Modify
        </button>
      </div>

      {/* Modify Modal */}
      {showModifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Modify Next Best Action
              </h3>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                Customize the recommended CS response and document rationales.
              </p>
            </div>

            <div className="space-y-3">
              {/* Proposed Action Field */}
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Proposed Primary Action
                </label>
                <textarea
                  value={modifiedText}
                  onChange={(e) => setModifiedText(e.target.value)}
                  rows={2}
                  className="w-full p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* CSM Notes Field */}
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  CSM Justification Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain why you adjusted the AI model's recommendation..."
                  rows={3}
                  className="w-full p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowModifyModal(false)}
                className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-semibold text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-950"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecision('modified', modifiedText)}
                disabled={submitting === 'modified' || !modifiedText.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark"
              >
                {submitting === 'modified' && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Submit Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
