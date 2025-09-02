"use client";

import { useState, FormEvent, ChangeEvent, useEffect, useRef } from "react";
import { BASE_API_URL } from "../../import-api/ImportApi";
import { BASE_API_URL_local } from "../../import-api/ImportApi";

interface BankPermitPayload {
  bankdate: string;
  bankname: string;
  bankpermitdate: string;
  permitno: string;
  permitamount: number | string;
  bankreference: string;
  bankservice: number | string;
}
interface BankServiceChargeFormProps {
  declarationNumber?: string;
  onDeclarationNumberChange?: (value: string) => void;
}
export default function BankServiceFeeForm({ declarationNumber, onDeclarationNumberChange }: BankServiceChargeFormProps) {
  const [formData, setFormData] = useState<BankPermitPayload>({
    bankdate: "",
    bankname: "",
    bankpermitdate: "",
    permitno: "",
    permitamount: "",
    bankreference: "",
    bankservice: "",
  });

  const [declarationnumber, setDeclarationNumber] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // Track the last fetched declaration number
  const lastFetchedDeclarationNumber = useRef<string>("");

  // Fetch when declaration number changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        declarationnumber &&
        declarationnumber !== lastFetchedDeclarationNumber.current
      ) {
        fetchBankData();
      }
    }, 800); // Increased debounce time
    return () => clearTimeout(timer);
  }, [declarationnumber]);

  const fetchBankData = async () => {
    if (!declarationnumber) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found in localStorage—cannot fetch");
      return;
    }

    setIsFetchingData(true);
    try {
      const url = `${BASE_API_URL_local}/api/bank-details/?declaration_number=${declarationnumber}`;
      
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // If not found, don't show error - just don't autofill
        if (response.status === 404) {
          console.log("No data found for this declaration number");
          setIsFetchingData(false);
          return;
        }
        
        const json = await response.json().catch(() => ({}));
        console.error(
          `Fetch failed. Status: ${response.status} ${response.statusText}.`,
          "Backend response:", json
        );
        setIsFetchingData(false);
        return;
      }

      const responseData = await response.json();
      
      // Check if data array exists and has at least one item
      if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
        // Extract the first item from the data array
        const actualData = responseData.data[0];
        
        // Update form with response fields
        setFormData({
          bankdate: actualData.bankdate || "",
          bankname: actualData.bankname || "",
          bankpermitdate: actualData.bankpermitdate || "",
          permitno: actualData.permitno || "",
          permitamount:
            actualData.permitamount !== undefined && actualData.permitamount !== null
              ? actualData.permitamount.toString()
              : "",
          bankreference: actualData.bankreference || "",
          bankservice:
            actualData.bankservice !== undefined && actualData.bankservice !== null
              ? actualData.bankservice.toString()
              : "",
        });

        lastFetchedDeclarationNumber.current = declarationnumber;
        
        // Auto-remove success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        // Handle flat object response (backward compatibility)
        const actualData = responseData;
        
        if (!actualData || Object.keys(actualData).length === 0) {
          console.log("No data found for this declaration number");
          setIsFetchingData(false);
          return;
        }

        // Update form with response fields
        setFormData({
          bankdate: actualData.bankdate || "",
          bankname: actualData.bankname || "",
          bankpermitdate: actualData.bankpermitdate || "",
          permitno: actualData.permitno || "",
          permitamount:
            actualData.permitamount !== undefined && actualData.permitamount !== null
              ? actualData.permitamount.toString()
              : "",
          bankreference: actualData.bankreference || "",
          bankservice:
            actualData.bankservice !== undefined && actualData.bankservice !== null
              ? actualData.bankservice.toString()
              : "",
        });

        lastFetchedDeclarationNumber.current = declarationnumber;
        
        // Auto-remove success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error("Network or other error during fetch:", error);
    } finally {
      setIsFetchingData(false);
    }
  };

  // Add a manual fetch button handler
  const handleManualFetch = () => {
    if (declarationnumber) {
      fetchBankData();
    } else {
      setMessage("Please enter a declaration number first");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "declarationnumber") {
      setDeclarationNumber(value)
      onDeclarationNumberChange && onDeclarationNumberChange(value);
      if (isDuplicate) {
        setIsDuplicate(false);
        e.target.classList.remove("border-red-500", "ring-2", "ring-red-200");
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setIsDuplicate(false);
    setIsSubmitting(true);

    if (!declarationnumber) {
      setMessage("Declaration number is required");
      setIsSubmitting(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Authentication error: Please log in again. ❌");
      setIsSubmitting(false);
      return;
    }

    try {
      // Convert numeric fields back to numbers
      const submissionData = {
        ...formData,
        permitamount: formData.permitamount
          ? parseFloat(formData.permitamount as string)
          : 0,
        bankservice: formData.bankservice
          ? parseFloat(formData.bankservice as string)
          : 0,
      };

      const response = await fetch(
        `${BASE_API_URL}/api/v1/clerk/bankInfo/${declarationnumber}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submissionData),
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = `HTTP error! status: ${response.status}`;

        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;

          if (
            response.status === 409 ||
            errorMessage.toLowerCase().includes("already exists")
          ) {
            setMessage(
              "This declaration number already exists. Please use a different one. ❌"
            );
            setIsDuplicate(true);
            setIsSubmitting(false);
            const input = document.getElementById("declarationnumber");
            input?.classList.add("border-red-500", "ring-2", "ring-red-200");
            return;
          }
        }
        throw new Error(errorMessage);
      }

      setFormSubmitted(true);
      setMessage("Form submitted successfully! ✅");

      // Reset form
      setFormData({
        bankdate: "",
        bankname: "",
        bankpermitdate: "",
        permitno: "",
        permitamount: "",
        bankreference: "",
        bankservice: "",
      });
      setDeclarationNumber("");
      lastFetchedDeclarationNumber.current = "";
    } catch (error) {
      console.error("Submission error:", error);

      let errorMessage = "An unknown error occurred. ❌";
      if (error instanceof Error) {
        errorMessage = error.message.includes("Failed to fetch")
          ? "Network error. Please check your connection. ❌"
          : `Error: ${error.message} ❌`;
      }

      setMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-black">
      <div className="w-full max-w-xl bg-white p-6 rounded shadow">
        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.includes("✅")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {!formSubmitted ? (
          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Bank Permit Details
            </h2>

            {/* Declaration Number */}
            <div className="mb-4">
              <label
                htmlFor="declarationnumber"
                className="block font-medium mb-1"
              >
                Declaration Number
              </label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    id="declarationnumber"
                    name="declarationnumber"
                    value={declarationnumber}
                    onChange={handleChange}
                    className={`w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDuplicate
                        ? "border-red-500 ring-2 ring-red-200"
                        : "border-gray-300"
                    }`}
                    placeholder="D123456"
                    required
                  />
                  {isFetchingData && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
             
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the declaration number to auto-fill the form. 
                Form will auto-fill after typing stops, or click Fetch.
              </p>
            </div>

            {/* Bank Details */}
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label htmlFor="bankname" className="block font-medium mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  id="bankname"
                  name="bankname"
                  value={formData.bankname}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="permitno" className="block font-medium mb-1">
                  Permit Number
                </label>
                <input
                  type="text"
                  id="permitno"
                  name="permitno"
                  value={formData.permitno}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label
                  htmlFor="permitamount"
                  className="block font-medium mb-1"
                >
                  Permit Amount
                </label>
                <input
                  type="number"
                  id="permitamount"
                  name="permitamount"
                  value={formData.permitamount}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  step="0.01"
                />
              </div>

              <div>
                <label htmlFor="bankservice" className="block font-medium mb-1">
                  Bank Service Fee
                </label>
                <input
                  type="number"
                  id="bankservice"
                  name="bankservice"
                  value={formData.bankservice}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  step="0.01"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="bankreference" className="block font-medium mb-1">
                Bank Reference
              </label>
              <input
                type="text"
                id="bankreference"
                name="bankreference"
                value={formData.bankreference}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
              <div>
                <label htmlFor="bankdate" className="block font-medium mb-1">
                  Bank Date
                </label>
                <input
                  type="date"
                  id="bankdate"
                  name="bankdate"
                  value={formData.bankdate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="bankpermitdate"
                  className="block font-medium mb-1"
                >
                  Permit Date
                </label>
                <input
                  type="date"
                  id="bankpermitdate"
                  name="bankpermitdate"
                  value={formData.bankpermitdate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-green-700 mb-4">
              ✅ Form Submitted Successfully!
            </h2>
            <button
              onClick={() => {
                setFormSubmitted(false);
                setMessage(null);
              }}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
            >
              Submit Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}