import React, { useEffect, useState } from 'react';
import { useNav } from '../context/NavContext';
import { apiService, type Customer, type UploadedFile } from '../services/api';
import { UploadCard } from '../components/ui/UploadCard';
import { 
  FileText, 
  ArrowRight, 
  Loader2, 
  Database,
  Mail,
  AlertCircle
} from 'lucide-react';

export const Upload: React.FC = () => {
  const { selectedCustomerId, navigate } = useNav();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [targetCustomerId, setTargetCustomerId] = useState<number | null>(selectedCustomerId);
  const [uploadedRecord, setUploadedRecord] = useState<UploadedFile | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await apiService.getCustomers();
        setCustomers(list);
        
        // Default target to first customer if none is selected
        if (!targetCustomerId && list.length > 0) {
          setTargetCustomerId(list[0].id);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load customer list for uploader context.");
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [selectedCustomerId]);

  const handleUploadSuccess = (file: UploadedFile) => {
    setUploadedRecord(file);
  };

  const handleAnalyze = async () => {
    if (!targetCustomerId) return;
    setAnalyzing(true);
    try {
      const response = await apiService.analyzeCustomer(targetCustomerId);
      setAnalyzing(false);
      if (response.success && response.task_id) {
        // Navigate directly to agent execution page
        navigate('execution', targetCustomerId, response.task_id);
      }
    } catch (err) {
      setAnalyzing(false);
      alert("Failed to start agentic pipeline analysis.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-2">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-xs text-neutral-400">Loading uploader configs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
          Artifact Upload Center
        </h1>
        <p className="text-xs text-neutral-450 dark:text-neutral-500 mt-0.5">
          Ingest unstructured interactions and prepare them for agentic intelligence parsing.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-light/20 border border-danger/30 text-danger-dark dark:text-danger-light">
          <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
          <p className="text-xs font-semibold leading-tight">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left pane: File drag and drop */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-sm space-y-4">
            
            {/* Customer select box */}
            <div>
              <label className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider block mb-1.5">
                Target Customer Account
              </label>
              <select
                value={targetCustomerId || ''}
                onChange={(e) => {
                  setTargetCustomerId(Number(e.target.value));
                  setUploadedRecord(null); // clear uploaded status
                }}
                className="w-full p-2.5 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-950 text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Zone */}
            {targetCustomerId && (
              <UploadCard 
                customerId={targetCustomerId}
                onUploadSuccess={handleUploadSuccess}
                onUploadStart={() => setUploadedRecord(null)}
              />
            )}

            {/* Step 2: Trigger Analysis once uploaded */}
            {uploadedRecord && (
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-850 flex justify-end">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-lg text-xs font-bold shadow-sm shadow-primary/20 hover:bg-primary-dark active:scale-[0.98] transition-all duration-150 disabled:opacity-60"
                >
                  {analyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Run Analysis Agents <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Right pane: Upload Instructions & Guides */}
        <div className="space-y-6">
          <div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-neutral-950 dark:text-white uppercase tracking-wider">
              Supported Artifact Types
            </h3>
            
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Meeting Transcripts</h4>
                  <p className="text-[10px] text-neutral-450 dark:text-neutral-500 leading-normal mt-0.5">
                    Upload Zoom, Teams or Meet transcript logs (.txt/.pdf/.docx).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10 text-accent mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Client Emails</h4>
                  <p className="text-[10px] text-neutral-450 dark:text-neutral-500 leading-normal mt-0.5">
                    Drag and drop email body logs expressing sentiment or renewal requests.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-success/10 text-success mt-0.5">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">CRM CSVs</h4>
                  <p className="text-[10px] text-neutral-450 dark:text-neutral-500 leading-normal mt-0.5">
                    Import standard CSV tables mapping client adoption drop metrics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
