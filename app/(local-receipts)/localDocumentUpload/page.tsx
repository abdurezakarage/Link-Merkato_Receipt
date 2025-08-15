
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
    const [success, setSuccess] = useState("");;
    const [withholding, setWithholding] = useState<File | null>(null);

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
    // Handle form submit
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitting(true);
      
      try {


        const tin_number = localStorage.getItem("tin_number");
      
        // Check if userId exists
        if (!tin_number) {
          setError("TIN number not found. Please log in again.");
          setSubmitting(false);
          return;
        }
        // Handle file uploads if present
        if (MainReceipt || attachment || withholding) {
          try { 
            const fileFormData = new FormData();
            
            if (MainReceipt) {
              fileFormData.append("main_receipt_data.main_receipt", MainReceipt);
              fileFormData.append("main_receipt_data.main_receipt_filename", MainReceipt.name);
              fileFormData.append("main_receipt_data.main_receipt_content_type", MainReceipt.type);
            }
            
            if (attachment) {
              fileFormData.append("main_receipt_data.attachment", attachment);
              fileFormData.append("main_receipt_data.attachment_filename", attachment.name);
              fileFormData.append("main_receipt_data.attachment_content_type", attachment.type);
            }
            
            if (withholding) {
              fileFormData.append("withholding_receipt_data.withholding_receipt", withholding);
              fileFormData.append("withholding_receipt_data.withholding_receipt_filename", withholding.name);
              fileFormData.append("withholding_receipt_data.withholding_receipt_content_type", withholding.type);
            }
            
            const uploadResponse = await axios.post(`${DJANGO_BASE_URL}/upload-receipt-documents/${tin_number}`, fileFormData, {
              headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
              },
            });
            router.push('/auth/owner-dashboard');
            console.log('Files uploaded successfully:', uploadResponse.data);
          } catch (uploadError) {
            console.error('File upload error:', uploadError);
            setError("failed to upload documents. Please try again.");
            setSubmitting(false);
            return;
          }
        } else {
          console.log('No files to upload');
        }
        
       
        
      } catch (error) {
        console.error('Error submitting form:', error);
        setError("Failed to submit form. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }

    return (
        <div className="in-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 ">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
          <form onSubmit={handleSubmit}>
                {/*Documents Section */}
                <FormSection
                  title="upload Documents"
                  description="upload documents"
                  isActive={true}
                 isCompleted={true}
                >
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
                    <FileUpload
                      label="Upload Receipt"
                      accept="image/*,.pdf"
                      onChange={handleMainReceiptChange}
                      value={MainReceipt}
                      maxSize={10}
                      required={false}
                    />
                    <FileUpload
                      label="Upload Attachment"
                      accept="image/*,.pdf"
                      onChange={handleAttachmentChange}
                      value={attachment}
                      maxSize={10}
                      required={false}
                    />
                     <FileUpload
                      label="Attach Withholding Document"
                      accept="image/*,.pdf"
                      onChange={handleWithholdingFile}
                      value={withholding}
                      maxSize={10}
                      required={false}
                    />
                  </div>
                  <div className="flex justify-end mt-8">
                      {/* Submit Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Documents'}
                  </button>
                </div>

               
                  </div>
                </FormSection>

              
            </form>
            </div>
        </div>
    );
}