"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent } from '../../components/ui/card';
import { local_receipt, import_receipt, export_receipt, custom_receipt } from '../api/api';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getToken } from '../../components/auth';
import { jwtDecode } from 'jwt-decode';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface FormData {
  officeType: 'tax' | 'custom';
  receiptCategory: 'local' | 'import' | 'export';
  receiptDate: string;
  calendarType: 'ETHIOPIAN' | 'GREGORIAN';
  hasWithholdingTax: 'yes' | 'no';
  paymentMethod: 'BANK' | 'CASH';
  bankName?: string;
  receipt_number?: string;
  documents: {
    Main?: FileList;
    Attachment?: FileList;
    importDeclaration?: FileList;
    exportDeclaration?: FileList;
    importLicense?: FileList;
    commercialInvoice?: FileList;
    packingList?: FileList;
    airwayBill?: FileList;
    certificateOfOrigin?: FileList;
    bankPermit?: FileList;
    insuranceCost?: FileList;
    insurancePolicy?: FileList;
    others?: FileList;
  };
}
interface DecodedToken {
  user_id: string;
  roles: string;
  username?: string;
  email?: string;
}

// User information interface
// interface UserInfo {
//   user_id: string;
//   roles: string;
//   username?: string;
//   email?: string;
// }

// File preview interface
interface FilePreview {
  name: string;
  size: string;
  type: string;
  url: string;
}

const banks = [
'Abay Bank',
'Addis International Bank',
'Amhara Bank',
'Awash International Bank',
'Bank of Abyssinia',
'Berhan International Bank',
'Bunna International Bank',
'Commercial Bank of Ethiopia',
'Cooperative Bank of Oromia',
'Dashen Bank',
'Global Bank',
'Lion International Bank',
'Oromia International Bank',
'Hibret Bank',
'Wegagen Bank',
'Zemen Bank',
'Zemzem Bank',
'Sinqe Bank',
'Tsedey Bank',
];



export default function DataUploadPage() {
  const [selectedOfficeType, setSelectedOfficeType] = useState<'tax' | 'custom' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'local' | 'import' | 'export' | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'BANK' | 'CASH' | null>(null);
  const [selectedDateType, setSelectedDateType] = useState<'ETHIOPIAN' | 'GREGORIAN' | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmittingTax, setIsSubmittingTax] = useState(false);
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
  const router = useRouter();
  // File preview states
  const [filePreviews, setFilePreviews] = useState<Record<string, FilePreview[]>>({});

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, FileList | null>>({});

  const { register, handleSubmit, setError, clearErrors, setValue, formState: { errors }, reset } = useForm<FormData>();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const documentUploadRef = useRef<HTMLDivElement | null>(null);
  const attachmentsRef = useRef<HTMLDivElement | null>(null);
  const receiptNumberRef = useRef<HTMLDivElement | null>(null);
  const dateSelectionRef = useRef<HTMLDivElement | null>(null);
  const withholdingRef = useRef<HTMLDivElement | null>(null);
  const paymentMethodRef = useRef<HTMLDivElement | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Cleanup file URLs on component unmount
  useEffect(() => {
    return () => {
      // Cleanup all file URLs to prevent memory leaks
      Object.values(filePreviews).flat().forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [filePreviews]);

  // Check authentication on component mount
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/auth/login');
    }
  }, [router]);

  // Separate onSubmit for tax office
  const onSubmitTax = async (data: FormData) => {
    setIsSubmittingTax(true);
    // console.log("[onSubmitTax] Submitting form with data:", data);
    if (!data.calendarType) {
      setIsSubmittingTax(false);
      return;
    }
    if (!data.receiptDate) {
      setError('receiptDate', { type: 'manual', message: 'Please provide a date' });
      setIsSubmittingTax(false);
      return;
    } else {
      clearErrors(['receiptDate']);
    }

    // Prepare non-file fields object
    const info: Record<string, unknown> = {
      officeType: 'tax',
      receiptCategory: data.receiptCategory,
      calendarType: data.calendarType,
      receiptDate: data.receiptDate,
      hasWithholdingTax: data.hasWithholdingTax,
      paymentMethod: data.paymentMethod,
      bankName: data.bankName || undefined,
      receipt_number: data.receipt_number || undefined,
    };

    // Prepare FormData
    const formData = new FormData();
    formData.append('info', new Blob([JSON.stringify(info)], { type: 'application/json' }));

    // Always append Main file (single file) for all categories
    const mainFiles = uploadedFiles['main'];
    if (mainFiles && mainFiles.length > 0) {
      formData.append('Main', mainFiles[0]);
    }

    // Always append Attachment files (can be multiple) for all categories
    const attachmentFiles = uploadedFiles['attachments'];
    if (attachmentFiles && attachmentFiles.length > 0) {
      for (let i = 0; i < attachmentFiles.length; i++) {
        formData.append('Attachment', attachmentFiles[i]);
      }
    }
    const token = getToken();
    const decodedToken = jwtDecode(token || '') as DecodedToken;
    const userId = decodedToken.user_id;
    // console.log(userId);
    try {
      let response;
      if (data.receiptCategory === 'local') {
        response = await axios.post(`${local_receipt}/${userId}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else if (data.receiptCategory === 'import') {
        response = await axios.post(`${import_receipt}/${userId}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else if (data.receiptCategory === 'export') {
        response = await axios.post(`${export_receipt}/${userId}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        // console.log("[onSubmitTax] Response data (export):", response.data);
      } else {
      }

      if (!response || response.status < 200 || response.status >= 300) {
        setIsSubmittingTax(false);
        return;
      }

      // Success! Show message and reset form
      setSuccessMessage('Documents uploaded successfully!');
      resetForm();
      setIsSubmittingTax(false);
      setTimeout(() => setSuccessMessage(null), 4000);

    } catch (error) {
      setIsSubmittingTax(false);
      let message = 'Failed to upload documents';
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data;
        message =
          data?.message ||
          data?.error ||
          data?.detail ||
          data?.msg ||
          (Array.isArray(data?.non_field_errors) ? data.non_field_errors.join(' ') : undefined) ||
          (typeof data === 'string' ? data : undefined) ||
          message;

        if (message.toLowerCase().includes('receipt number')) {
          setError('receipt_number', { type: 'server', message });
          // Scroll to the receipt number input
          setTimeout(() => {
            receiptNumberRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        } else {
          setServerError(message);
        }
      } else {
        setServerError(message);
      }
    }
  };

  // Separate onSubmit for custom office
  const onSubmitCustom = async () => {
    setIsSubmittingCustom(true);
    // console.log("[onSubmitCustom] Submitting custom office form");
    // Prepare FormData
    const formData = new FormData();
    formData.append('officeType', 'custom');
    // Append files
    const docFields = [
      'importLicense', 'commercialInvoice', 'packingList', 'airwayBill', 'certificateOfOrigin',
      'bankPermit', 'insuranceCost', 'insurancePolicy', 'others'
    ];
    let hasFile = false;
    docFields.forEach(field => {
      const files = uploadedFiles[field];
      if (files && files.length > 0) {
        hasFile = true;
        for (let i = 0; i < files.length; i++) {
          formData.append(field, files[i]);
        }
      }
    });
    if (!hasFile) {
      // alert('Please upload at least one document for custom office.');
      setIsSubmittingCustom(false);
      return;
    }
    try {
      // console.log("[onSubmitCustom] Sending request to custom_receipt endpoint");
      const response = await axios.post(custom_receipt, formData);
      // console.log("[onSubmitCustom] Full response:", response);
      // console.log("[onSubmitCustom] Response data:", response.data);
      if (!response || response.status < 200 || response.status >= 300) {
        // alert('Failed to upload data');
        setIsSubmittingCustom(false);
        return;
      }
      setSuccessMessage('Documents uploaded successfully!');
      // Reset form after successful submission
      resetForm();
      setTimeout(() => setSuccessMessage(null), 4000);
      setIsSubmittingCustom(false);
    } catch (error) {
      setIsSubmittingCustom(false);
      let message = 'Failed to upload documents';
      if (axios.isAxiosError(error) && error.response) {
        // console.log("Server error response:", error.response.data); // Debug log
        const data = error.response.data;
        message =
          data?.message ||
          data?.error ||
          data?.detail ||
          data?.msg ||
          (Array.isArray(data?.non_field_errors) ? data.non_field_errors.join(' ') : undefined) ||
          (typeof data === 'string' ? data : undefined) ||
          message;
        setServerError(message);
      } else {
        setServerError(message);
      }
    }
  };

  const handleOfficeTypeSelect = (type: 'tax' | 'custom') => {
    setSelectedOfficeType(type);
    setValue('officeType', type);
    setCurrentStep(2);
  };

  const handleCategorySelect = (category: 'local' | 'import' | 'export') => {
    setSelectedCategory(category);
    setValue('receiptCategory', category);
    // Auto-scroll to document upload section
    setTimeout(() => {
      if (documentUploadRef.current) {
        documentUploadRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100); // Delay to ensure DOM update
  };

  // Unified file input handler for single/multiple files with preview support
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files) return;

    // Store the files for submission
    setUploadedFiles(prev => ({
      ...prev,
      [name]: files
    }));

    const newPreviews: FilePreview[] = Array.from(files).map((file) => ({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      url: URL.createObjectURL(file)
    }));

    setFilePreviews(prev => ({
      ...prev,
      [name]: newPreviews
    }));

    // Auto-scroll logic for tax office
    if (selectedOfficeType === 'tax') {
      if (name === 'main' && attachmentsRef.current) {
        setTimeout(() => attachmentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
      if (name === 'attachments' && dateSelectionRef.current) {
        setTimeout(() => dateSelectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Remove file preview
  const removeFilePreview = (fieldName: string, index: number) => {
    setFilePreviews(prev => {
      const updated = { ...prev };
      if (updated[fieldName]) {
        // Cleanup the URL before removing
        URL.revokeObjectURL(updated[fieldName][index].url);
        updated[fieldName] = updated[fieldName].filter((_, i) => i !== index);
      }
      return updated;
    });

    // Also remove the file from uploadedFiles state
    setUploadedFiles(prev => {
      const updated = { ...prev };
      if (updated[fieldName]) {
        // Convert FileList to Array and remove the file
        const fileArray = Array.from(updated[fieldName] || []);
        fileArray.splice(index, 1);
        
        // If no files left, set to null, otherwise keep the remaining files
        updated[fieldName] = fileArray.length > 0 ? fileArray as unknown as FileList : null;
      }
      return updated;
    });
  };



  // File preview component
  const FilePreviewComponent = ({ fieldName }: { fieldName: string }) => {
    const previews = filePreviews[fieldName] || [];
    
    if (previews.length === 0) return null;

    return (
      <div className="mt-4 space-y-3">
        {previews.map((preview, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm max-w-md">
            <div className="p-3">
              <div className="flex items-center space-x-3">
                {/* Document Content Preview */}
                <div className="flex-shrink-0">
                  {preview.type.startsWith('image/') ? (
                    <div className="relative">
                      <img 
                        src={preview.url} 
                        alt={preview.name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        style={{ width: '64px', height: '64px' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  ) : preview.type === 'application/pdf' ? (
                    <div className="w-16 h-16 bg-red-50 rounded-lg border border-red-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  ) : preview.type.includes('word') || preview.type.includes('document') ? (
                    <div className="w-16 h-16 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  ) : preview.type.includes('excel') || preview.type.includes('spreadsheet') ? (
                    <div className="w-16 h-16 bg-green-50 rounded-lg border border-green-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* File Information */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{preview.name}</p>
                      <p className="text-xs text-gray-500 truncate">{preview.size} • {preview.type}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <button
                        type="button"
                        onClick={() => window.open(preview.url, '_blank')}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex items-center space-x-1"
                        title="Preview file"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>view</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFilePreview(fieldName, index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                        title="Remove file"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderOfficeTypeSelection = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Office Type</h2>
        <p className="text-gray-600">Choose the type of office you want to upload documents for</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div
          onClick={() => handleOfficeTypeSelect('tax')}
          className="relative p-6 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-200 group"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tax Office</h3>
            <p className="text-gray-600 text-sm">Upload documents for tax office processing</p>
          </div>
        </div>

        <div
          onClick={() => handleOfficeTypeSelect('custom')}
          className="relative p-6 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-200 group"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Office</h3>
            <p className="text-gray-600 text-sm">Upload documents for custom office processing</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTaxOfficeForm = () => (
    <div className="space-y-8">
      {/* Receipt Category */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-blue-600 font-semibold">1</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Receipt Category</h3>
                              <p className="text-gray-600">Select the type of receipt you&apos;re uploading</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { value: 'local', label: 'Local Receipt', icon: '🏠', description: 'Local business receipts' },
              { value: 'import', label: 'Import Documents', icon: '📦', description: 'Import-related documents' },
              { value: 'export', label: 'Export Documents', icon: '🚢', description: 'Export-related documents' }
            ].map((category) => (
              <label key={category.value} className="relative">
                <input
                  type="radio"
                  value={category.value}
                  {...register('receiptCategory', { required: 'Receipt category is required' })}
                  onChange={(e) => handleCategorySelect(e.target.value as 'local' | 'import' | 'export')}
                  className="sr-only peer"
                />
                <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-50">
                  <div className="text-center">
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className="font-medium text-gray-900">{category.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{category.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
          {errors.receiptCategory && (
            <p className="text-red-500 text-sm mt-2">{errors.receiptCategory.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Document Upload */}
      {selectedCategory && (
        <div ref={documentUploadRef}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Document Upload</h3>
                  <p className="text-gray-600">Upload the required documents</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {selectedCategory === 'local' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                      Receipt <span className="text-red-500">*</span>
                      </label>
                      {(!uploadedFiles['main'] || uploadedFiles['main'].length === 0) && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors max-w-md">
                          <input
                            type="file"
                            {...register('documents.Main', { required: 'Main document is required' })}
                            name="main"
                            onChange={handleFileChange}
                            className="hidden"
                            id="main-doc"
                          />
                          <label htmlFor="main-doc" className="cursor-pointer">
                            <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p className="mt-1 text-xs text-gray-600">Click to upload main document</p>
                          </label>
                        </div>
                      )}
                      <FilePreviewComponent fieldName="main" />
                      {errors.documents?.Main && (
                        <p className="text-red-500 text-sm mt-2">{errors.documents.Main.message}</p>
                      )}
                    </div>
                    
                    <div ref={attachmentsRef}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (Optional)</label>
                      {(!uploadedFiles['attachments'] || uploadedFiles['attachments'].length === 0) && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors max-w-md">
                          <input
                            type="file"
                            multiple
                            {...register('documents.Attachment')}
                            name="attachments"
                            onChange={handleFileChange}
                            className="hidden"
                            id="attachments"
                          />
                          <label htmlFor="attachments" className="cursor-pointer">
                            <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p className="mt-1 text-xs text-gray-600">Click to upload additional attachments</p>
                          </label>
                        </div>
                      )}
                      <FilePreviewComponent fieldName="attachments" />
                    </div>
                  </div>
                )}

                {(selectedCategory === 'import' || selectedCategory === 'export') && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Main Document <span className="text-red-500">*</span>
                      </label>
                      {(!uploadedFiles['main'] || uploadedFiles['main'].length === 0) && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors max-w-md">
                          <input
                            type="file"
                            {...register('documents.Main', { required: 'Main document is required' })}
                            name="main"
                            onChange={handleFileChange}
                            className="hidden"
                            id="main-doc-import"
                          />
                          <label htmlFor="main-doc-import" className="cursor-pointer">
                            <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p className="mt-1 text-xs text-gray-600">Click to upload main document</p>
                          </label>
                        </div>
                      )}
                      <FilePreviewComponent fieldName="main" />
                      {errors.documents?.Main && (
                        <p className="text-red-500 text-sm mt-2">{errors.documents.Main.message}</p>
                      )}
                    </div>
                    
                    <div ref={attachmentsRef}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                      {(!uploadedFiles['attachments'] || uploadedFiles['attachments'].length === 0) && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors max-w-md">
                          <input
                            type="file"
                            multiple
                            {...register('documents.Attachment')}
                            name="attachments"
                            onChange={handleFileChange}
                            className="hidden"
                            id="attachments-import"
                          />
                          <label htmlFor="attachments-import" className="cursor-pointer">
                            <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p className="mt-1 text-xs text-gray-600">Click to upload additional attachments</p>
                          </label>
                        </div>
                      )}
                      <FilePreviewComponent fieldName="attachments" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
       
      {/* Receipt Date */}
      {/* Receipt Number (Step 3) */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div ref={receiptNumberRef}>
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-pink-600 font-semibold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Receipt Number <span className="text-red-500">*</span></h3>
                <p className="text-gray-600">Enter the receipt number</p>
              </div>
            </div>
            <input
              type="text"
              {...register('receipt_number', { required: 'Receipt number is required' })}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full max-w-[300px]"
              placeholder="Enter receipt number"
              onBlur={() => {
                if (dateSelectionRef.current) {
                  setTimeout(() => dateSelectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                }
              }}
            />
            {errors.receipt_number && (
              <p className="text-red-500 text-sm mt-2">{errors.receipt_number.message}</p>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Receipt Date (Step 4) */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div ref={dateSelectionRef}>
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-purple-600 font-semibold">4</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Receipt Date</h3>
                <p className="text-gray-600">Select date type and provide the receipt date</p>
              </div>
            </div>
            {/* Date Type Selection and Date Input in the same row */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end gap-4">
              {/* Date Type Selection (compact) */}
              <div className="flex flex-row gap-3 min-w-fit">
                {[{
                  value: 'ETHIOPIAN',
                  label: 'Ethiopian Date',
                  icon: '🇪🇹',
                  bg: 'bg-yellow-50',
                  ring: 'ring-yellow-400',
                  hover: 'hover:bg-yellow-100',
                }, {
                  value: 'GREGORIAN',
                  label: 'Gregorian Date',
                  icon: '🌍',
                  bg: 'bg-blue-50',
                  ring: 'ring-blue-400',
                  hover: 'hover:bg-blue-100',
                }].map((dateType) => (
                  <label
                    key={dateType.value}
                    className={`relative w-32 cursor-pointer transition-all duration-200 group ${dateType.bg} ${dateType.hover} rounded-xl shadow-md border-2 border-transparent ${selectedDateType === dateType.value ? `ring-2 ${dateType.ring}` : ''}`}
                    style={{ minWidth: '110px', maxWidth: '140px' }}
                  >
                    <input
                      type="radio"
                      value={dateType.value}
                      checked={selectedDateType === dateType.value}
                      onChange={() => {
                        handleDateTypeChange(dateType.value as 'ETHIOPIAN' | 'GREGORIAN');
                        setValue('calendarType', dateType.value as 'ETHIOPIAN' | 'GREGORIAN');
                        setTimeout(() => {
                          if (dateSelectionRef.current) {
                            dateSelectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 100);
                      }}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center justify-center py-3 px-2">
                      <span className="text-2xl mb-1">{dateType.icon}</span>
                      <span className="font-semibold text-xs text-gray-900 mb-0.5 text-center leading-tight">{dateType.label}</span>
                      <span className="text-[10px] text-gray-500 text-center">{dateType.value === 'ETHIOPIAN' ? 'Ethiopian Calendar' : 'International Standard'}</span>
                    </div>
                    {selectedDateType === dateType.value && (
                      <span className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow-lg animate-bounce">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </label>
                ))}
              </div>
              {/* Date Input */}
              {selectedDateType && (
                <div className="flex-1 flex flex-col items-start">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedDateType === 'ETHIOPIAN' ? 'ETHIOPIAN' : 'GREGORIAN'} Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('receiptDate', { required: 'Date is required' })}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full max-w-[180px]"
                    onBlur={() => {
                      if (withholdingRef.current) {
                        setTimeout(() => withholdingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                      }
                    }}
                  />
                  {errors.receiptDate && (
                    <p className="text-red-500 text-sm mt-2">{errors.receiptDate.message}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Withholding Tax (Step 5) */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div ref={withholdingRef}>
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-orange-600 font-semibold">5</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Withholding Tax <span className="text-red-500">*</span></h3>
                <p className="text-gray-600">Does the receipt have withholding tax?</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value={option.value}
                    {...register('hasWithholdingTax', { required: 'Withholding tax selection is required' })}
                    onChange={() => {
                      if (paymentMethodRef.current) {
                        setTimeout(() => paymentMethodRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
              {errors.hasWithholdingTax && (
                <p className="text-red-500 text-sm mt-2">{errors.hasWithholdingTax.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Payment Method (Step 6) */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div ref={paymentMethodRef}>
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-indigo-600 font-semibold">6</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Payment Method</h3>
                <p className="text-gray-600">Select your preferred payment method</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                {[
                  { value: 'BANK', label: 'Bank' },
                  { value: 'CASH', label: 'Cash' }
                ].map((method) => (
                  <label key={method.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      value={method.value}
                      {...register('paymentMethod', { required: 'Payment method is required' })}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value as 'BANK' | 'CASH')}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{method.label}</span>
                  </label>
                ))}
                {errors.paymentMethod && (
                  <p className="text-red-500 text-sm mt-2">{errors.paymentMethod.message}</p>
                )}
              </div>
              {selectedPaymentMethod === 'BANK' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Bank <span className="text-red-500">*</span></label>
                  <select
                    {...register('bankName')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choose a bank</option>
                    {banks.map((bank) => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
// Custom Office Documents
  const renderCustomForm = () => (
    <div className="space-y-8">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-green-600 font-semibold">1</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Custom Office Documents</h3>
              <p className="text-gray-600">Upload required documents for custom office processing</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { key: 'importLicense', label: 'Import/Export License', icon: '📋' },
              { key: 'commercialInvoice', label: 'Commercial Invoice', icon: '🧾' },
              { key: 'packingList', label: 'Packing List', icon: '📦' },
              { key: 'airwayBill', label: 'Airway Bill or Bill of Loading', icon: '✈️' },
              { key: 'certificateOfOrigin', label: 'Certificate of Origin', icon: '🏛️' },
              { key: 'bankPermit', label: 'Bank Permit', icon: '🏦' },
              { key: 'insuranceCost', label: 'Insurance Cost', icon: '💰' },
              { key: 'insurancePolicy', label: 'Insurance Policy', icon: '📄' },
              { key: 'others', label: 'Others', icon: '📎' }
            ].map((doc) => (
              <div key={doc.key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {doc.icon} {doc.label}
                </label>
                {(!uploadedFiles[doc.key] || uploadedFiles[doc.key]?.length === 0) && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-500 transition-colors max-w-sm">
                    <input
                      type="file"
                      {...register(`documents.${doc.key as keyof FormData['documents']}`)}
                      name={doc.key}
                      onChange={handleFileChange}
                      className="hidden"
                      id={doc.key}
                    />
                    <label htmlFor={doc.key} className="cursor-pointer">
                      <svg className="mx-auto h-6 w-6 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-1 text-xs text-gray-600">Click to upload</p>
                    </label>
                  </div>
                )}
                <FilePreviewComponent fieldName={doc.key} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Controlled date type selection
  const handleDateTypeChange = (type: 'ETHIOPIAN' | 'GREGORIAN') => {
    setSelectedDateType(type);
    setValue('receiptDate', '');
  };

  // Reset form and go back to step 1
  const resetForm = () => {
    // Reset all form states
    setSelectedOfficeType(null);
    setSelectedCategory(null);
    setSelectedPaymentMethod(null);
    setSelectedDateType(null);
    setCurrentStep(1);
    
    // Reset form using react-hook-form reset
    reset();
    
    // Clear file uploads and previews
    setUploadedFiles({});
    setFilePreviews({});
    
    // Clear form errors
    clearErrors();
    setServerError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Document Upload</h1>
          <p className="text-gray-600 text-lg">Upload your documents for processing</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 flex justify-center">
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg flex items-center space-x-3 shadow">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMessage}</span>
              <button onClick={() => setSuccessMessage(null)} className="ml-4 text-green-700 hover:text-green-900 focus:outline-none">&times;</button>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {selectedOfficeType && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
            <div className="text-center mt-2 text-sm text-gray-600">
              Step {currentStep} of 2: {currentStep === 1 ? 'Select Office Type' : 'Complete Form'}
            </div>
          </div>
        )}

        {serverError && (
          <div className="mb-4 text-red-600 bg-red-100 border border-red-300 rounded p-3 flex items-center justify-between">
            <span>{serverError}</span>
            <button onClick={() => setServerError(null)} className="ml-4 text-red-800 font-bold">×</button>
          </div>
        )}

        <form
          onSubmit={selectedOfficeType === 'tax' ? handleSubmit(onSubmitTax) : (e) => { e.preventDefault(); onSubmitCustom(); }}
          className="space-y-8"
        >
          {/* Only show hidden inputs for tax form */}
          {selectedOfficeType === 'tax' && (
            <>
              <input
                type="hidden"
                value={selectedOfficeType || ''}
                {...register('officeType', { required: true })}
              />
              <input
                type="hidden"
                value={selectedCategory || ''}
                {...register('receiptCategory', {
                  required: selectedOfficeType === 'tax' ? 'Receipt category is required' : false
                })}
              />
            </>
          )}
          {currentStep === 1 && renderOfficeTypeSelection()}
          {currentStep === 2 && (
            <>
              {selectedOfficeType === 'tax' && renderTaxOfficeForm()}
              {selectedOfficeType === 'custom' && renderCustomForm()}
            </>
          )}
          {selectedOfficeType && (
            <div className="flex justify-between items-center pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  setSelectedOfficeType(null);
                  setSelectedCategory(null);
                  setSelectedPaymentMethod(null);
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
              <button
                type="submit"
                className={`px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg${(isSubmittingTax || isSubmittingCustom) ? ' opacity-60 cursor-not-allowed' : ''}`}
                disabled={isSubmittingTax || isSubmittingCustom}
              >
                {(isSubmittingTax || isSubmittingCustom) && (
                  <div className="mr-2 inline-block align-middle">
                    <LoadingSpinner size="sm" color="white" />
                  </div>
                )}
                <span>{(isSubmittingTax || isSubmittingCustom) ? 'Submitting...' : 'Submit Documents'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

