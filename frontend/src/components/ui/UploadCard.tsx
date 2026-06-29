import React, { useState, useRef } from 'react';
import { apiService, type UploadedFile } from '../../services/api';
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface UploadCardProps {
  customerId: number;
  onUploadSuccess: (file: UploadedFile) => void;
  onUploadStart?: () => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({ 
  customerId, 
  onUploadSuccess,
  onUploadStart 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successFile, setSuccessFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    setSuccessFile(null);
    setUploading(true);
    setProgress(15);
    
    if (onUploadStart) onUploadStart();

    // Simulated progress tick during read phase
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          return 85;
        }
        return prev + 12;
      });
    }, 150);

    try {
      const result = await apiService.uploadFile(customerId, file);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setSuccessFile(result);
        onUploadSuccess(result);
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setUploading(false);
      setError(err?.response?.data?.detail || "File format not supported. Upload a CSV, TXT, DOCX or PDF.");
      console.error(err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {/* Upload Drag & Drop Area */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          onChange={handleChange}
          accept=".txt,.pdf,.docx,.csv"
        />

        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-primary/10 dark:bg-primary/5 text-primary">
            <UploadCloud className="w-6 h-6 animate-pulse" />
          </div>
          
          <h3 className="mb-1 text-sm font-semibold text-neutral-900 dark:text-white">
            Upload customer artifact
          </h3>
          <p className="mb-4 text-xs text-neutral-400 dark:text-neutral-500 max-w-xs">
            Drag & drop transcript, customer email threads, or CRM CSV.
          </p>
          <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-300 shadow-sm hover:shadow-md transition-shadow duration-150">
            Browse files
          </span>
        </div>

        {/* Overlay progress loader */}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm px-12 transition-all duration-200">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-xs font-semibold text-neutral-950 dark:text-white mb-2">
              Uploading customer documentation...
            </p>
            <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold mt-1.5">
              {progress}%
            </span>
          </div>
        )}
      </div>

      {/* Success alert message */}
      {successFile && (
        <div className="flex items-center gap-3 p-4 mt-4 rounded-xl bg-success-light/20 border border-success/30 text-success-dark dark:text-success-light">
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{successFile.filename}</p>
            <p className="text-[10px] opacity-70">
              {(successFile.file_size / 1024).toFixed(1)} KB • Upload completed successfully
            </p>
          </div>
        </div>
      )}

      {/* Error alert message */}
      {error && (
        <div className="flex items-center gap-3 p-4 mt-4 rounded-xl bg-danger-light/20 border border-danger/30 text-danger-dark dark:text-danger-light">
          <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
          <p className="text-xs font-semibold leading-tight">{error}</p>
        </div>
      )}
    </div>
  );
};
