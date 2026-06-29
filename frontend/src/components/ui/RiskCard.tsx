import React from 'react';
import { AlertTriangle, AlertCircle, ShieldCheck, ShieldAlert } from 'lucide-react';

interface RiskCardProps {
  level: 'low' | 'medium' | 'high' | 'critical' | string;
}

export const RiskCard: React.FC<RiskCardProps> = ({ level = 'low' }) => {
  const normLevel = level.toLowerCase();
  
  const getRiskDetails = () => {
    switch (normLevel) {
      case 'critical':
        return {
          color: 'text-danger bg-danger/10 border-danger/20',
          title: 'Critical Churn Risk',
          desc: 'Immediate sponsor contact and mitigation patch deployment required. Renewal timeframe is near.',
          icon: ShieldAlert
        };
      case 'high':
        return {
          color: 'text-danger bg-danger/5 border-danger/20',
          title: 'High Risk Alert',
          desc: 'Significant adoption decline and negative client sentiment detected. Sponsor alignment meeting required.',
          icon: AlertCircle
        };
      case 'medium':
        return {
          color: 'text-warning bg-warning/10 border-warning/20',
          title: 'Moderate Risk',
          desc: 'Minor pricing concerns and support tickets pending resolution. Schedule roadmap review sync.',
          icon: AlertTriangle
        };
      default:
        return {
          color: 'text-success bg-success/10 border-success/20',
          title: 'Low Churn Risk',
          desc: 'Stable platform operations. Maintain normal scheduled business review sequence.',
          icon: ShieldCheck
        };
    }
  };

  const details = getRiskDetails();
  const Icon = details.icon;

  return (
    <div className={`p-6 border rounded-xl shadow-sm flex items-start gap-4 ${details.color}`}>
      <div className="p-2 rounded-lg bg-white dark:bg-neutral-900/50 flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
          Renewal Risk Level
        </span>
        <h3 className="text-sm font-bold mt-0.5 leading-none">
          {details.title}
        </h3>
        <p className="text-xs mt-2 opacity-85 leading-relaxed">
          {details.desc}
        </p>
      </div>
    </div>
  );
};
