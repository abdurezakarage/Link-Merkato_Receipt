"use client";

import { useState, FormEvent, ChangeEvent } from "react";

// Define the expected structure for the POST request payload
interface BankPermitPayload {
  bankdate: string;
  bankname: string;
  bankpermitdate: string;
  permitno: string;
  permitamount: number;
  bankreference: string;
  bankservice: number;
}

export default function BankServiceFeeForm() {
  // Initialize formData with the new backend enum fields
  const [formData, setFormData] = useState<BankPermitPayload>({
    bankdate: "",
    bankname: "",
    bankpermitdate: "",
    permitno: "",
    permitamount: 0,
    bankreference: "",
    bankservice: 0,
  });

  const [message, setMessage] = useState<string | null>(null); // For user feedback
  // 1. NEW STATE VARIABLE to track success
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? parseFloat(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null); // Clear previous messages
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage(
        "Authentication error: User ID or token is missing. Please log in again. ❌"
      );
      return;
    }

    const payload: BankPermitPayload = formData;

    try {
      const response = await fetch(
        `https://customreceiptmanagement.onrender.com/api/v1/clerk/bankInfo/${97645398}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = `HTTP error! status: ${response.status}`;

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = errorText || response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("Success:", data);
        setMessage(
          data.message || "Bank permit details submitted successfully! ✅"
        );
      } else {
        const successText = await response.text();
        console.log("Success:", successText);
        setMessage(
          successText || "Bank permit details submitted successfully! ✅"
        );
      }

      // 2. Set the success state to true
      setIsSubmitted(true);

      // No need to reset the form data here if you're unmounting the form
      // setFormData({ ... });
    } catch (error) {
      console.error("Error submitting bank permit data:", error);
      if (error instanceof Error) {
        setMessage(`Failed to submit data. Error: ${error.message} ❌`);
      } else {
        setMessage("Failed to submit data. An unknown error occurred. ❌");
      }
      // Make sure to reset the form data on error to allow the user to try again
      setFormData({
        bankdate: "",
        bankname: "",
        bankpermitdate: "",
        permitno: "",
        permitamount: 0,
        bankreference: "",
        bankservice: 0,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {/* 3. Conditional rendering to show either the form or the success message */}
      {isSubmitted ? (
        <div className="text-center p-8 bg-white rounded shadow-lg max-w-xl">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Submission Successful!
          </h2>
          <p className="text-gray-700">
            Thank you for submitting the bank permit details. A new record has
            been created.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl bg-white p-6 rounded shadow"
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Bank Permit Details Form
          </h2>
          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.includes("✅")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          {/* All your form input fields go here */}
          {/* ... */}
          <div className="mb-4">
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
              placeholder="e.g., Commercial Bank of Ethiopia"
              required
            />
          </div>
          {/* ... (rest of the form fields) */}
          <div className="mb-4">
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
              placeholder="e.g., P-1234567"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="permitamount" className="block font-medium mb-1">
              Permit Amount
            </label>
            <input
              type="number"
              id="permitamount"
              name="permitamount"
              value={formData.permitamount}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 50000.00"
              required
            />
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
              placeholder="e.g., REF-XYZ-123"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="bankservice" className="block font-medium mb-1">
              Bank Service
            </label>
            <input
              type="number"
              id="bankservice"
              name="bankservice"
              value={formData.bankservice}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 1500.00"
              required
            />
          </div>
          <div className="mb-4">
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
          <div className="mb-6">
            <label htmlFor="bankpermitdate" className="block font-medium mb-1">
              Bank Permit Date
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
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit Bank Permit Details
          </button>
        </form>
      )}
    </div>
  );
}
