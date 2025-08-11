"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { XMarkIcon, DocumentIcon, PhotoIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  label: string;
  accept?: string;
  onChange: (file: File | null) => void;
  value: File | null;
  required?: boolean;
  maxSize?: number; // in MB
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = React.memo(({
  label,
  accept = "image/*,.pdf",
  onChange,
  value,
  required = false,
  maxSize = 10, // 10MB default
  className = ""
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Cleanup blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  // Create blob URL when file changes
  useEffect(() => {
    if (!value) {
      if (blobUrlRef.current) {
       // console.log('FileUpload: Cleaning up blob URL - no file');
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      return;
    }
    
   // console.log('FileUpload: File changed, creating new blob URL for:', value.name, value.type, value.size);
    
    // Clean up previous blob URL
    if (blobUrlRef.current) {
      //console.log('FileUpload: Cleaning up previous blob URL');
      URL.revokeObjectURL(blobUrlRef.current);
    }
    
    // Create new blob URL
    blobUrlRef.current = URL.createObjectURL(value);
    //console.log('FileUpload: Created blob URL:', blobUrlRef.current);
    
    // Force re-render to show the new blob URL
    setForceUpdate(prev => prev + 1);
  }, [value?.name, value?.size, value?.type, value?.lastModified]);

  // State to force re-render when blob URL changes
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Get current blob URL
  const blobUrl = blobUrlRef.current;

  const validateFile = useCallback((file: File): string => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    const acceptedTypes = accept.split(',');
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type || file.name.toLowerCase().endsWith(type.replace('.', ''));
    });

    if (!isValidType) {
      return `File type not supported. Please upload ${accept}`;
    }

    return "";
  }, [accept, maxSize]);

  const handleFile = useCallback((file: File) => {
    setIsLoading(true);
    setError("");
    setUploadProgress(0);
    
    // Simulate file processing with progress (you can remove this in production)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 50);
    
    setTimeout(() => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setIsLoading(false);
        setUploadProgress(0);
        clearInterval(interval);
        return;
      }
      
      setUploadProgress(100);
      setTimeout(() => {
        onChange(file);
        setIsLoading(false);
        setUploadProgress(0);
        setSuccess("File uploaded successfully!");
        clearInterval(interval);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      }, 200);
    }, 500);
  }, [validateFile, onChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const removeFile = useCallback(() => {
    onChange(null);
    setError("");
    setSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onChange]);

  const getFileIcon = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      return <PhotoIcon className="w-8 h-8 text-blue-500" />;
    }
    return <DocumentIcon className="w-8 h-8 text-gray-500" />;
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const openPreview = useCallback(() => {
    //console.log('FileUpload: openPreview called, blobUrl:', blobUrl);
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    } else {
      console.error('FileUpload: No blob URL available for preview');
    }
  }, [blobUrl]);

  // Memoize the file preview section to prevent unnecessary re-renders
  const filePreview = useMemo(() => {
    if (!value) return null;
    
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getFileIcon(value)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {value.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(value.size)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={openPreview}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Preview file"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={removeFile}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Remove file"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Image Preview */}
        {value.type.startsWith('image/') && blobUrl && (
          <div className="mt-3">
            <img
              src={blobUrl}
              alt="Preview"
              className="max-w-full h-32 object-contain rounded border border-gray-200 hover:scale-105 transition-transform duration-200 cursor-pointer"
              onClick={openPreview}
              title="Click to view full size"
              // onLoad={() => console.log('FileUpload: Image loaded successfully')}
              // onError={(e) => console.error('FileUpload: Image failed to load:', e)}
            />
          </div>
        )}
        {value.type.startsWith('image/') && !blobUrl && (
          <div className="mt-3 text-red-500 text-sm">
            Debug: Image file but no blob URL available
          </div>
        )}
      </div>
    );
  }, [value, blobUrl, getFileIcon, formatFileSize, openPreview, removeFile, forceUpdate]);

  // Memoize the upload area to prevent unnecessary re-renders
  const uploadArea = useMemo(() => {
    if (value) return null;
    
    return (
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        } ${error ? 'border-red-300 bg-red-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          required={required}
        />
        
        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            ) : (
              <DocumentIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">
              {isLoading ? 'Processing file...' : (
                <>
                  Drop your file here, or{' '}
                  <span className="text-blue-600 hover:text-blue-500 cursor-pointer">
                    browse
                  </span>
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports: {accept.replace(/\*/g, 'all')} (Max: {maxSize}MB)
            </p>
            
            {/* Progress Bar */}
            {isLoading && uploadProgress > 0 && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {uploadProgress}% complete
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [value, dragActive, error, isLoading, uploadProgress, accept, maxSize, required, handleDrag, handleDrop, handleChange]);

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* File Upload Area or File Preview */}
      {uploadArea || filePreview}
      
      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <XMarkIcon className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
      
      {/* Success Message */}
      {success && (
        <p className="mt-2 text-sm text-green-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </p>
      )}
    </div>
  );
});

FileUpload.displayName = 'FileUpload';

export default FileUpload; 