import React, { useState } from 'react';
import { apiService } from '../../services/api';
import { Check, Loader2, AlertCircle } from 'lucide-react';

interface ApprovalDialogProps {
  recommendationId: number;
  customerName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (notes?: string) => void;
}

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  recommendationId,
  customerName,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await apiService.submitDecision(recommendationId, 'approved', 'Customer Success Manager', notes);
      setSubmitting(false);
      onSuccess(notes);
      onClose();
    } catch (err: any) {
      setSubmitting(false);
      setError(err?.response?.data?.detail || "Failed to approve the recommendation.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            Confirm recommendation approval
          </h3>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
            You are approving the Next Best Action for <strong className="text-neutral-750 dark:text-neutral-300">{customerName}</strong>.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs font-semibold text-danger bg-danger/10 border border-danger/20 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            Approval Justification (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detail any context for the audit log..."
            rows={3}
            className="w-full p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
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
            onClick={handleApprove}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-success text-white rounded-lg text-xs font-semibold hover:bg-success-dark"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Approve Action
          </button>
        </div>
      </div>
    </div>
  );
};
