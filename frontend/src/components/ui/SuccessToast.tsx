import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface SuccessToastProps {
  message: string;
  type?: 'success' | 'danger' | 'warning';
  onClose: () => void;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({ 
  message, 
  type = 'success', 
  onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyle = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-50/90 dark:bg-red-950/90 border-red-200/50 dark:border-red-900/50',
          text: 'text-red-800 dark:text-red-200',
          icon: XCircle,
          iconColor: 'text-danger'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50/90 dark:bg-amber-950/90 border-amber-200/50 dark:border-amber-900/50',
          text: 'text-amber-800 dark:text-amber-200',
          icon: AlertCircle,
          iconColor: 'text-warning'
        };
      default:
        return {
          bg: 'bg-emerald-50/90 dark:bg-emerald-950/90 border-emerald-200/50 dark:border-emerald-900/50',
          text: 'text-emerald-800 dark:text-emerald-200',
          icon: CheckCircle,
          iconColor: 'text-success'
        };
    }
  };

  const config = getStyle();
  const Icon = config.icon;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 max-w-sm p-4 rounded-xl border backdrop-blur-md shadow-lg animate-in slide-in-from-bottom-5 duration-200 ${config.bg} ${config.text}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
      <p className="text-xs font-semibold leading-normal mr-2">
        {message}
      </p>
      <button 
        onClick={onClose}
        className="p-1 rounded-md opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
