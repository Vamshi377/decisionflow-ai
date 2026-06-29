import React from 'react';
import { CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface ApprovalStatusBadgeProps {
  status: 'approved' | 'rejected' | 'modified' | 'pending' | string;
}

export const ApprovalStatusBadge: React.FC<ApprovalStatusBadgeProps> = ({ status }) => {
  const normStatus = status.toLowerCase();

  const getDetails = () => {
    switch (normStatus) {
      case 'approved':
        return {
          color: 'text-success bg-success/10 border-success/20',
          label: 'Approved',
          icon: CheckCircle
        };
      case 'rejected':
        return {
          color: 'text-danger bg-danger/10 border-danger/20',
          label: 'Rejected',
          icon: XCircle
        };
      case 'modified':
        return {
          color: 'text-warning bg-warning/10 border-warning/20',
          label: 'Modified',
          icon: AlertCircle
        };
      default:
        return {
          color: 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700',
          label: 'Pending Approval',
          icon: HelpCircle
        };
    }
  };

  const details = getDetails();
  const Icon = details.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider ${details.color}`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      {details.label}
    </span>
  );
};
