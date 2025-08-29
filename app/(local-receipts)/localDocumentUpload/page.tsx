
'use client'
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { DJANGO_BASE_URL } from "../api/api";
import FileUpload from "../local-data-forms/local_Receipt_Forms/FileUpload";
import FormSection from "../local-data-forms/local_Receipt_Forms/FormSection";
import type { CompanyData} from '../local-data-forms/types'
import { useAuth } from "../../Context/AuthContext";
import { useRouter } from "next/navigation";

export default function LocalDocumentUpload() {
    const { user, logout, token, isLoading } = useAuth();
    const router = useRouter();
  
    // Token validation function
    const isTokenValid = useCallback(() => {
      if (!token) return false;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp > currentTime;
      } catch (e) {
        return false;
      }
    }, [token]);

    // State variables
    const [MainReceipt, setMainReceipt] = useState<File | null>(null);
    const [attachment, setAttachment] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [withholding, setWithholding] = useState<File | null>(null);
    const [receiptNumber, setReceiptNumber] = useState("");
    const [hasWithholding, setHasWithholding] = useState<"yes" | "no">("no");
    const [withholdingReceiptNumber, setWithholdingReceiptNumber] = useState("");
    const [receiptNumberExists, setReceiptNumberExists] = useState<boolean | null>(null);
    const [checkingReceiptNumber, setCheckingReceiptNumber] = useState(false);
    const [isImportExport, setIsImportExport] = useState<"yes" | "no">("no");
    const [declarationNumber, setDeclarationNumber] = useState("");
    const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

    // Debounced receipt number validator
    const checkReceiptNumber = useCallback(async (num: string) => {
      if (!num || !token || !isTokenValid()) return;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setCheckingReceiptNumber(true);
      timeoutRef.current = setTimeout(async () => {
        try {
          const response = await axios.get(`${DJANGO_BASE_URL}/check-receipt-exists/?receipt_number=${encodeURIComponent(num)}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          setReceiptNumberExists(response.data.exists);
        } catch (err) {
          console.error('Error checking receipt number:', err);
          setReceiptNumberExists(null);
        } finally {
          setCheckingReceiptNumber(false);
        }
      }, 500);
    }, [token, isTokenValid]);

    // Trigger validation when receipt number changes
    // useEffect(() => {
    //   if (receiptNumber) {
    //     checkReceiptNumber(receiptNumber);
    //   } else {
    //     setReceiptNumberExists(null);
    //   }
    // }, [receiptNumber, checkReceiptNumber]);

    // Cleanup debounce on unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

//extract tin_number from companydata
  // Parse JWT token to get company information
  const parseJwt = (token: string): any => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  

    // Handler functions

    const handleMainReceiptChange = (file: File | null) => {
      setMainReceipt(file);
    };

    const handleAttachmentChange = (file: File | null) => {
      setAttachment(file);
    };

    const handleWithholdingFile = (file: File | null) => {
      setWithholding(file);
    };

    // Handle withholding option change
    const handleWithholdingChange = (value: "yes" | "no") => {
      setHasWithholding(value);
      if (value === "no") {
        setWithholdingReceiptNumber("");
        setWithholding(null);
      }
    };

    // Handle import/export option change
    const handleImportExportChange = (value: "yes" | "no") => {
      setIsImportExport(value);
      if (value === "no") {
        setDeclarationNumber("");
      }
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitting(true);
      setError("");
      setSuccess("");
      
      try {
        const tin_number = localStorage.getItem("tin_number");
      
        // Check if userId exists
        if (!tin_number) {
          setError("TIN number not found. Please log in again.");
          setSubmitting(false);
          return;
        }

        // Validate required fields
        if (!receiptNumber.trim()) {
          setError("Receipt number is required.");
          setSubmitting(false);
          return;
        }

        // Prevent submit if duplicate receipt number
        if (receiptNumberExists === true) {
          setError('This receipt number already submitted. ');
          setSubmitting(false);
          return;
        }

        // Validate withholding fields if withholding is yes
        if (hasWithholding === "yes") {
          if (!withholdingReceiptNumber.trim()) {
            setError("Withholding receipt number is required when withholding is selected.");
            setSubmitting(false);
            return;
          }
          if (!withholding) {
            setError("Withholding document is required when withholding is selected.");
            setSubmitting(false);
            return;
          }
        }

        // Validate declaration number if import/export is yes
        if (isImportExport === "yes") {
          if (!declarationNumber.trim()) {
            setError("Declaration number is required for import/export receipts.");
            setSubmitting(false);
            return;
          }
        }
        const roles = localStorage.getItem("roles");
        if (!roles) {
          setError("User role not found. Please log in again.");
          setSubmitting(false);
          return;
        }

        // Handle file uploads if present
        if (MainReceipt || attachment || (hasWithholding === "yes" && withholding)) {
          try { 
            const fileFormData = new FormData();
            
            if (MainReceipt) {
              fileFormData.append("main_receipt_data.receipt_number", receiptNumber);
              fileFormData.append("main_receipt_data.main_receipt", MainReceipt);
              fileFormData.append("main_receipt_data.main_receipt_filename", MainReceipt.name);
              fileFormData.append("main_receipt_data.main_receipt_content_type", MainReceipt.type);
              fileFormData.append("main_receipt_data.is_import_export", isImportExport);
              if (isImportExport === "yes" && declarationNumber.trim()) {
                fileFormData.append("declaration_number", declarationNumber.trim());
              }
            }
            
            if (attachment) {
              fileFormData.append("main_receipt_data.attachment", attachment);
              fileFormData.append("main_receipt_data.attachment_filename", attachment.name);
              fileFormData.append("main_receipt_data.attachment_content_type", attachment.type);
            }
            
            if (hasWithholding === "yes" && withholding) {
              fileFormData.append("withholding_receipt_data.withholding_receipt_number", withholdingReceiptNumber);
              fileFormData.append("withholding_receipt_data.withholding_receipt", withholding);
              fileFormData.append("withholding_receipt_data.withholding_receipt_filename", withholding.name);
              fileFormData.append("withholding_receipt_data.withholding_receipt_content_type", withholding.type);
            }
            
            const uploadResponse = await axios.post(`${DJANGO_BASE_URL}/upload-receipt-documents`, fileFormData, {
              headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
              },
            });
            
           // console.log('Files uploaded successfully:', uploadResponse.data);
            setSuccess("Documents uploaded successfully!");
            // Briefly show success then navigate based on role
            try {
              // Allow the user to see the success message
              setSubmitting(false);
              await new Promise((resolve) => setTimeout(resolve, 2000));

              const rolesStr = localStorage.getItem("roles");
              if (!rolesStr) {
                setError("User role not found. Please log in again.");
                return;
              }

              let userRoles;
              try {
                userRoles = JSON.parse(rolesStr);
              } catch (parseError) {
                console.error('Error parsing roles:', parseError);
                setError("Invalid role format. Please log in again.");
                return;
              }

              if (Array.isArray(userRoles)) {
                if (userRoles.includes("USER")) {
                  router.push('/auth/owner-dashboard');
                } else if (userRoles.includes("CLERK")) {
                  router.push('/userinfo');
                } else {
                  setError("Invalid user role. Please log in again.");
                }
              } else {
                setError("Invalid role format. Please log in again.");
              }
            } catch (navError) {
              console.error('Navigation error:', navError);
              setError("Failed to navigate. Please try again.");
            }
            return;
          } catch (uploadError) {
            console.error('File upload error:', uploadError);
            // Try to extract a meaningful error message from server response
            let message = "Failed to upload documents. Please try again.";
            if (axios.isAxiosError(uploadError)) {
              const data = uploadError.response?.data as any;
              if (data) {
                if (typeof data === 'string') {
                  message = data;
                } else if (Array.isArray(data)) {
                  message = data.join(' ');
                } else if (typeof data === 'object') {
                  const preferredKeys = [
                    'file',
                    'main_receipt',
                    'attachment',
                    'withholding_receipt',
                    'detail',
                    'non_field_errors'
                  ];
                  for (const key of preferredKeys) {
                    const value = data[key];
                    if (!value) continue;
                    if (typeof value === 'string') {
                      message = value;
                      break;
                    }
                    if (Array.isArray(value)) {
                      message = value.join(' ');
                      break;
                    }
                  }
                  if (message === "Failed to upload documents. Please try again.") {
                    const firstValue = Object.values(data)[0] as unknown;
                    if (typeof firstValue === 'string') {
                      message = firstValue;
                    } else if (Array.isArray(firstValue)) {
                      message = (firstValue as unknown[]).join(' ');
                    }
                  }
                }
              }
            }
            setError(message);
            setSubmitting(false);
            return;
          }
        } else {
          //console.log('No files to upload');
        }
        
       
        
      } catch (error) {
        console.error('Error submitting form:', error);
        setError("Failed to submit form. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }

    return (
        <div className="in-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 text-black ">
          
          <div className="container mx-auto px-4 py-8 max-w-6xl bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Upload Local Receipts</h2>
          <form onSubmit={handleSubmit}>
                {/*Documents Section */}
               
 {/* Error and Success Messages */}
 {error && (
                  <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                    {success}
                  </div>
                )}
                  {/* File Upload Section */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Receipt Number */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Receipt Number *
                      </label>
                      <input
                        type="text"
                        name="receiptNumber"
                        value={receiptNumber}
                        onChange={(e) => setReceiptNumber(e.target.value)}
                        className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {/* {checkingReceiptNumber && (
                        <p className="text-sm text-blue-600 mt-1">Checking receipt number...</p>
                      )}
                      {receiptNumber && receiptNumberExists === true && !checkingReceiptNumber && (
                        <p className="text-sm text-red-600 mt-1">This receipt number already submitted.</p>
                      )} */}
                      {/* {receiptNumber && receiptNumberExists === false && !checkingReceiptNumber && (
                        <p className="text-sm text-green-600 mt-1">Receipt number is available.</p>
                      )} */}
                    </div>
{/* does the receipt relate to a local or import/export receipt*/}
<div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Does this receipt relate to an import/export receipt? *
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="isImportExport"
                              value="yes"
                              checked={isImportExport === "yes"}
                              onChange={(e) => handleImportExportChange(e.target.value as "yes" | "no")}
                              className="mr-2"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="isImportExport"
                              value="no"
                              checked={isImportExport === "no"}
                              onChange={(e) => handleImportExportChange(e.target.value as "yes" | "no")}
                              className="mr-2"
                            />
                            No
                          </label>
                        </div>
                        {isImportExport === "yes" && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Declaration Number *
                            </label>
                            <input
                              type="text"
                              name="declarationNumber"
                              value={declarationNumber}
                              onChange={(e) => setDeclarationNumber(e.target.value)}
                              className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        )}
                      </div>


                    <FileUpload
                      label="Upload Receipt *"
                      accept="image/*,.pdf"
                      onChange={handleMainReceiptChange}
                      value={MainReceipt}
                      maxSize={10}
                      required={true}
                    />
                    <FileUpload
                      label="Upload Attachment"
                      accept="image/*,.pdf"
                      onChange={handleAttachmentChange}
                      value={attachment}
                      maxSize={10}
                      required={false}
                    />
                     

                    </div>

                    {/* Withholding Section */}
                    <div className="mb-6">
                      {/* Withholding Option */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Does this receipt have withholding? *
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="hasWithholding"
                              value="yes"
                              checked={hasWithholding === "yes"}
                              onChange={(e) => handleWithholdingChange(e.target.value as "yes" | "no")}
                              className="mr-2"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="hasWithholding"
                              value="no"
                              checked={hasWithholding === "no"}
                              onChange={(e) => handleWithholdingChange(e.target.value as "yes" | "no")}
                              className="mr-2"
                            />
                            No
                          </label>
                        </div>
                      </div>

                      {/* Conditional Withholding Fields - Responsive Grid */}
                      {hasWithholding === "yes" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                          {/* Withholding Receipt Number */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Withholding Receipt Number *
                            </label>
                            <input
                              type="text"
                              name="withholdingReceiptNumber"
                              value={withholdingReceiptNumber}
                              onChange={(e) => setWithholdingReceiptNumber(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>

                          {/* Withholding Document */}
                          <div className="lg:col-span-1 xl:col-span-2">
                            <FileUpload
                              label="Attach Withholding Document *"
                              accept="image/*,.pdf"
                              onChange={handleWithholdingFile}
                              value={withholding}
                              maxSize={10}
                              required={true}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  <div className="flex justify-end mt-8">
                      {/* Submit Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={submitting || checkingReceiptNumber || receiptNumberExists === true}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Documents'}
                  </button>
                </div>

               
                  </div>
             

              
            </form>
            </div>
        </div>
    );
}