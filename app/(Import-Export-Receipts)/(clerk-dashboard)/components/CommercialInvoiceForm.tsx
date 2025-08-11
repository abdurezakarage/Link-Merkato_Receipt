"use client";

import { useState, FormEvent, ChangeEvent } from "react";

interface CommercialInvoicePayload {
  commertialDate: string;
  invoiceno: string;
  amountcommercialinvoce: number;
}

export default function CommercialInvoiceForm() {
  const [formData, setFormData] = useState<CommercialInvoicePayload>({
    commertialDate: "",
    invoiceno: "",
    amountcommercialinvoce: 0,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setMessage(null);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  if (!userId || !token) {
    setMessage("Authentication error: Please log in again. ❌");
    return;
  }

  try {
    const response = await fetch(
      `https://customreceiptmanagement.onrender.com/api/v1/clerk/commercialinvoice/${97645398}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      }
    );

    // Check the response content type before parsing
    const contentType = response.headers.get("content-type");
    let data: any;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const textData = await response.text();
      data = { message: textData }; // wrap plain text into an object for consistency
    }

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong ❌");
    }

    setMessage(data.message || "Commercial invoice submitted successfully! ✅");
    setIsSubmitted(true);
  } catch (error) {
    setMessage(
      error instanceof Error
        ? error.message
        : "Failed to submit data. Please try again. ❌"
    );
    setFormData({
      commertialDate: "",
      invoiceno: "",
      amountcommercialinvoce: 0,
    });
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {isSubmitted ? (
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-xl border border-gray-200">
          <h2 className="text-3xl font-extrabold text-green-600 mb-4">
            Submission Successful! 🎉
          </h2>
          <p className="text-gray-700 text-lg">
            Your commercial invoice has been recorded.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setMessage(null);
              setFormData({
                commertialDate: "",
                invoiceno: "",
                amountcommercialinvoce: 0,
              });
            }}
            className="mt-8 w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700"
          >
            Submit Another Form
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl bg-white p-6 rounded shadow"
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Commercial Invoice Form
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

          <div className="mb-4">
            <label
              htmlFor="commertialDate"
              className="block font-medium mb-1"
            >
              Commercial Date
            </label>
            <input
              type="date"
              id="commertialDate"
              name="commertialDate"
              value={formData.commertialDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="invoiceno" className="block font-medium mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              id="invoiceno"
              name="invoiceno"
              value={formData.invoiceno}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="amountcommercialinvoce"
              className="block font-medium mb-1"
            >
              Commercial Invoice Amount
            </label>
            <input
              type="number"
              id="amountcommercialinvoce"
              name="amountcommercialinvoce"
              value={
                formData.amountcommercialinvoce || ""
              }
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Submit Commercial Invoice
          </button>
        </form>
      )}
    </div>
  );
}
