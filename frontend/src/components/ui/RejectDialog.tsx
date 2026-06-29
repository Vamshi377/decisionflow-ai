import React, { useState } from 'react';
import { apiService } from '../../services/api';
import { AlertTriangle, Loader2, AlertCircle } from 'lucide-react';

interface RejectDialogProps {
  recommendationId: number;
  customerName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reason: string) => void;
}

export const RejectDialog: React.FC<RejectDialogProps> = ({
  recommendationId,
  customerName,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReject = async () => {
    if (!reason.trim()) {
      setError("A rejection reason is required to document the audit trail.");
      return;
    }
    
    setError(null);
    setSubmitting(true);
    try {
      await apiService.submitDecision(recommendationId, 'rejected', 'Customer Success Manager', reason);
      setSubmitting(false);
      onSuccess(reason);
      onClose();
    } catch (err: any) {
      setSubmitting(false);
      setError(err?.response?.data?.detail || "Failed to reject the recommendation.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-danger/10 text-danger">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Reject recommendation action
            </h3>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
              Account: {customerName}
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs font-semibold text-danger bg-danger/10 border border-danger/20 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            Rejection Reason (Required)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this action is not appropriate for this customer..."
            rows={3}
            className="w-full p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            required
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
            onClick={handleReject}
            disabled={submitting || !reason.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-danger text-white rounded-lg text-xs font-semibold hover:bg-danger-dark disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Confirm Rejection"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
