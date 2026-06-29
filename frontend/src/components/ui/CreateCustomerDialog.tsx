import React, { useState } from 'react';
import { apiService } from '../../services/api';
import { UserPlus, Loader2, AlertCircle, Calendar, Sparkles } from 'lucide-react';

interface CreateCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCustomerDialog: React.FC<CreateCustomerDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('Basic');
  
  // Date Handlers
  const todayDate = () => new Date().toISOString().split('T')[0];
  const [contractStartDate, setContractStartDate] = useState(todayDate());

  const defaultRenewalDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 365); // Default to a 1 year contract
    return d.toISOString().split('T')[0];
  };
  const [renewalDate, setRenewalDate] = useState(defaultRenewalDate());

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !companyName.trim() || !email.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await apiService.createCustomer({
        name: name.trim(),
        company_name: companyName.trim(),
        email: email.trim(),
        health_score: 100, // Default baseline health
        risk_level: 'low', // Default baseline risk
        renewal_date: new Date(renewalDate).toISOString(),
        contract_start_date: new Date(contractStartDate).toISOString(),
        industry: '',
        plan: plan,
        nps: 10,
        domain: 'customer_success'
      });
      
      setSubmitting(false);
      onSuccess();
      onClose();
      
      // Reset Form
      setName('');
      setCompanyName('');
      setEmail('');
      setPlan('Basic');
      setContractStartDate(todayDate());
      setRenewalDate(defaultRenewalDate());
    } catch (err: any) {
      setSubmitting(false);
      setError(err?.response?.data?.detail || "Failed to register new client account.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-850 pb-3">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Register New Client Account
            </h3>
            <p className="text-[10px] text-neutral-450 dark:text-neutral-500">
              Create a custom customer profile to run AI decision agent models.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs font-semibold text-danger bg-danger/10 border border-danger/20 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Contact Name */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                Contact Person *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50/50 dark:bg-neutral-950/40 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold"
                required
              />
            </div>

            {/* Company Name */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                Company Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Stark Industries"
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50/50 dark:bg-neutral-950/40 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sarah@stark.com"
              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50/50 dark:bg-neutral-950/40 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold"
              required
            />
          </div>

          {/* Contract Start & End Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-neutral-400" /> Contract Start Date *
              </label>
              <input
                type="date"
                value={contractStartDate}
                onChange={(e) => setContractStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50/50 dark:bg-neutral-950/40 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-neutral-400" /> Renewal Date *
              </label>
              <input
                type="date"
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50/50 dark:bg-neutral-950/40 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold"
                required
              />
            </div>
          </div>

          {/* Plan Type */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
              Plan *
            </label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50/50 dark:bg-neutral-950/40 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold cursor-pointer"
            >
              <option value="Basic">Basic Plan</option>
              <option value="Premium">Premium Plan</option>
              <option value="Enterprise">Enterprise scale</option>
            </select>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-150 dark:border-neutral-850">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-semibold text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-950"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark shadow-sm shadow-primary/10"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              Register Account
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
export default CreateCustomerDialog;
