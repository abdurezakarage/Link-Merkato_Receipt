"use client";
import { useState, FormEvent, ChangeEvent } from "react";
const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
  const [formData, setFormData] = useState<BankPermitPayload>({
    bankdate: "",
    bankname: "",
    bankpermitdate: "",
    permitno: "",
    permitamount: 0,
    bankreference: "",
    bankservice: 0,
  });

  const [declarationnumber, setDeclarationNumber] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (name === "declarationnumber") {
      setDeclarationNumber(value);
      if (isDuplicate) {
        setIsDuplicate(false);
        e.target.classList.remove("border-red-500", "ring-2", "ring-red-200");
      }
    } else {
      if (type === "number") {
        const numValue = value === "" ? 0 : parseFloat(value);
        if (!isNaN(numValue)) {
          setFormData((prev) => ({
            ...prev,
            [name]: numValue,
          }));
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
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
      const response = await fetch(
        `${BASE_API_URL}/api/v1/clerk/bankInfo/${declarationnumber}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
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

      // Reset form
      setFormData({
        bankdate: "",
        bankname: "",
        bankpermitdate: "",
        permitno: "",
        permitamount: 0,
        bankreference: "",
        bankservice: 0,
      });
      setDeclarationNumber("");
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
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
                  value={formData.permitamount || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
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
                  value={formData.bankservice || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
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
