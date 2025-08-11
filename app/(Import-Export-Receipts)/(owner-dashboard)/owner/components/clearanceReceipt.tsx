"use client";

import { useState } from "react";

export default function ReceiptUpload() {
  const [mainReceipt, setMainReceipt] = useState<File | null>(null);
  const [withholdingReceipt, setWithholdingReceipt] = useState<File | null>(null);
  const [hasWithholding, setHasWithholding] = useState<string>("no");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Get authentication data from localStorage
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      setStatus("Authentication required. Please log in.");
      setIsSubmitting(false);
      return;
    }

    if (!mainReceipt) {
      setStatus("Main receipt is required.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    // Match the exact field name expected by backend (MainReceipt with capital M)
    formData.append("MainReceipt", mainReceipt, mainReceipt.name);
    
    // Match the exact field name expected by backend (withholdingReceipt lowercase)
    if (hasWithholding === "yes" && withholdingReceipt) {
      formData.append("withholdingReceipt", withholdingReceipt, withholdingReceipt.name);
    }

    try {
      const response = await fetch(
        `https://customreceiptmanagement.onrender.com/api/v1/user/clearance/${userId}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        setStatus("Files uploaded successfully!");
        setMainReceipt(null);
        setWithholdingReceipt(null);
        setHasWithholding("no");
      } else {
        const errorData = await response.text();
        setStatus(`Upload failed: ${errorData || "Please try again"}`);
        
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
        }
      }
    } catch (error) {
      setStatus("An error occurred. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
        Upload Receipts
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Receipt Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Main Receipt <span className="text-red-500">*</span>
          </label>
          <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-blue-400 cursor-pointer hover:bg-blue-50">
            <div className="flex flex-col items-center justify-center">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                {mainReceipt ? (
                  <span className="font-medium text-blue-600">{mainReceipt.name}</span>
                ) : (
                  <>
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 5MB</p>
            </div>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setMainReceipt(e.target.files?.[0] || null)}
              className="hidden"
              required
            />
          </label>
        </div>

        {/* Withholding Toggle */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Do you have a withholding receipt?
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-4 w-4 text-blue-600"
                checked={hasWithholding === "no"}
                onChange={() => setHasWithholding("no")}
              />
              <span className="ml-2 text-gray-700">No</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-4 w-4 text-blue-600"
                checked={hasWithholding === "yes"}
                onChange={() => setHasWithholding("yes")}
              />
              <span className="ml-2 text-gray-700">Yes</span>
            </label>
          </div>
        </div>

        {/* Conditional Withholding Receipt */}
        {hasWithholding === "yes" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Withholding Receipt
            </label>
            <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-blue-400 cursor-pointer hover:bg-blue-50">
              <div className="flex flex-col items-center justify-center">
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  {withholdingReceipt ? (
                    <span className="font-medium text-blue-600">{withholdingReceipt.name}</span>
                  ) : (
                    <>
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 5MB</p>
              </div>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setWithholdingReceipt(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Submit Receipts
              </>
            )}
          </button>
        </div>

        {/* Status Message */}
        {status && (
          <div className={`p-3 rounded-md text-center ${
            status.includes("failed") || status.includes("error") || status.includes("required") 
              ? "bg-red-100 text-red-700" 
              : "bg-green-100 text-green-700"
          }`}>
            {status}
          </div>
        )}
      </form>
    </div>
  );
}