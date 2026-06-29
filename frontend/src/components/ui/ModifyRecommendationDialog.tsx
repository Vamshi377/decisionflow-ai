import React, { useState } from 'react';
import { apiService } from '../../services/api';
import { Edit2, Loader2, AlertCircle } from 'lucide-react';

interface ModifyRecommendationDialogProps {
  recommendationId: number;
  customerName: string;
  currentAction: string;
  currentPriority: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (modifiedAction: string, priority: string, followUp: string, notes: string) => void;
}

export const ModifyRecommendationDialog: React.FC<ModifyRecommendationDialogProps> = ({
  recommendationId,
  customerName,
  currentAction,
  currentPriority,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [actionText, setActionText] = useState(currentAction);
  const [priority, setPriority] = useState(currentPriority || 'High');
  const [followUp, setFollowUp] = useState('Within 48 Hours');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!actionText.trim()) {
      setError("An action description is required.");
      return;
    }
    if (!notes.trim()) {
      setError("Please write override notes detailing why you modified this recommendation.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await apiService.submitDecision(
        recommendationId,
        'modified',
        'Customer Success Manager',
        notes,
        actionText,
        priority,
        followUp
      );
      setSubmitting(false);
      onSuccess(actionText, priority, followUp, notes);
      onClose();
    } catch (err: any) {
      setSubmitting(false);
      setError(err?.response?.data?.detail || "Failed to update recommendation.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/10 text-warning">
            <Edit2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Modify recommendation override
            </h3>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
              Customer Account: {customerName}
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs font-semibold text-danger bg-danger/10 border border-danger/20 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3">
          {/* Action text */}
          <div>
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              Modified Primary Action
            </label>
            <textarea
              value={actionText}
              onChange={(e) => setActionText(e.target.value)}
              rows={2}
              className="w-full p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority Select */}
            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Override Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2.5 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Critical">Critical Priority</option>
              </select>
            </div>

            {/* Follow-up Timeline select */}
            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Follow-up Timeline
              </label>
              <select
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                className="w-full p-2.5 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Within 24 Hours">Within 24 Hours</option>
                <option value="Within 48 Hours">Within 48 Hours</option>
                <option value="Within 1 Week">Within 1 Week</option>
                <option value="Within 1 Month">Within 1 Month</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              Override Justification Notes (Required)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain why you adjusted the AI model's recommendation parameters..."
              rows={3}
              className="w-full p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-semibold text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-950"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !actionText.trim() || !notes.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Submit Override"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
