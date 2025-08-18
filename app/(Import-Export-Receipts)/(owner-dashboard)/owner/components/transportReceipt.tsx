"use client";

import { useState } from "react";
const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ReceiptUpload() {
  const [mainReceipt, setMainReceipt] = useState<File | null>(null);
  const [withholdingReceipt, setWithholdingReceipt] = useState<File | null>(
    null
  );
  const [hasWithholding, setHasWithholding] = useState<string>("no");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
    // Using exact field names expected by backend
    formData.append("MainReceipt", mainReceipt, mainReceipt.name);

    if (hasWithholding === "yes") {
      if (withholdingReceipt) {
        formData.append(
          "withholdingReceipt",
          withholdingReceipt,
          withholdingReceipt.name
        );
      } else {
        setStatus("Withholding receipt is required when selected");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch(
        `${BASE_API_URL}/api/v1/user/transport/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        setStatus("Files uploaded successfully!");
        // Reset form
        setMainReceipt(null);
        setWithholdingReceipt(null);
        setHasWithholding("no");
        setIsSuccess(true);
        // Clear file inputs
        document.querySelectorAll('input[type="file"]').forEach((input) => {
          (input as HTMLInputElement).value = "";
        });
      } else {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          setStatus(
            `Upload failed: ${
              errorData.message || errorData.error || "Please try again"
            }`
          );
        } catch {
          setStatus(`Upload failed: ${errorText || "Please try again"}`);
        }

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      setStatus(
        "An error occurred. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
        Upload Receipts
      </h2>
      {isSuccess ? (
        // Only show the status message when successful
        <div className="p-3 rounded-md text-center bg-green-100 text-green-700">
          {status}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Receipt Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Main Receipt <span className="text-red-500">*</span>
            </label>
            <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-blue-400 cursor-pointer hover:bg-blue-50 relative">
              <div className="flex flex-col items-center justify-center">
                <svg
                  className="w-10 h-10 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  {mainReceipt ? (
                    <span className="font-medium text-blue-600">
                      {mainReceipt.name} (
                      {(mainReceipt.size / 1024 / 1024).toFixed(2)}MB)
                    </span>
                  ) : (
                    <>
                      <span className="font-medium">Click to upload</span> or
                      drag and drop
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG up to 5MB
                </p>
              </div>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      setStatus("File must be smaller than 5MB");
                      e.target.value = "";
                      return;
                    }
                    setMainReceipt(file);
                    setStatus(null);
                  } else {
                    setMainReceipt(null);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {mainReceipt && (
                <button
                  type="button"
                  onClick={() => {
                    setMainReceipt(null);
                    const inputs =
                      document.querySelectorAll('input[type="file"]');
                    inputs.forEach((input) => {
                      if (
                        input.getAttribute("accept") ===
                        "application/pdf,image/*"
                      ) {
                        (input as HTMLInputElement).value = "";
                      }
                    });
                  }}
                  className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                  title="Remove file"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
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
                Withholding Receipt <span className="text-red-500">*</span>
              </label>
              <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-blue-400 cursor-pointer hover:bg-blue-50 relative">
                <div className="flex flex-col items-center justify-center">
                  <svg
                    className="w-10 h-10 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    {withholdingReceipt ? (
                      <span className="font-medium text-blue-600">
                        {withholdingReceipt.name} (
                        {(withholdingReceipt.size / 1024 / 1024).toFixed(2)}MB)
                      </span>
                    ) : (
                      <>
                        <span className="font-medium">Click to upload</span> or
                        drag and drop
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, JPG, PNG up to 5MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        setStatus("File must be smaller than 5MB");
                        e.target.value = "";
                        return;
                      }
                      setWithholdingReceipt(file);
                      setStatus(null);
                    } else {
                      setWithholdingReceipt(null);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {withholdingReceipt && (
                  <button
                    type="button"
                    onClick={() => {
                      setWithholdingReceipt(null);
                      const inputs =
                        document.querySelectorAll('input[type="file"]');
                      inputs.forEach((input) => {
                        if (
                          input.getAttribute("accept") ===
                          "application/pdf,image/*"
                        ) {
                          (input as HTMLInputElement).value = "";
                        }
                      });
                    }}
                    className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                    title="Remove file"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
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
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Submit Receipts
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
