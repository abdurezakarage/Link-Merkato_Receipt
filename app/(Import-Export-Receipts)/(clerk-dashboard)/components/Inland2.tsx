"use client";
import { useState, FormEvent, ChangeEvent } from "react";
const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface TransportFeePayload {
  inlandfreight2: number | "";
  loadingcost: number | "";
  laodingvat: number | "";
}

export default function Inland2() {
  const [formData, setFormData] = useState<TransportFeePayload>({
    inlandfreight2: "",
    loadingcost: "",
    laodingvat: "",
  });

  const [declarationnumber, setDeclarationNumber] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    if (!declarationnumber) {
      setMessage("Declaration number is required");
      setIsSubmitting(false);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage(
        "Authentication error: Token missing. Please log in again. ❌"
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const apiUrl = `${BASE_API_URL}/api/v1/clerk/inland2/${declarationnumber}`;

      // Convert empty strings to 0 before sending
      const payload = {
        inlandfreight2:
          formData.inlandfreight2 === "" ? 0 : formData.inlandfreight2,
        loadingcost: formData.loadingcost === "" ? 0 : formData.loadingcost,
        laodingvat: formData.laodingvat === "" ? 0 : formData.laodingvat,
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = `HTTP error! status: ${response.status}`;

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;

          if (response.status === 409) {
            setMessage(
              "Declaration is already taken. Please use a different one."
            );
          }
        } else {
          const errorText = await response.text();
          errorMessage = errorText || response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      setFormSubmitted(true);
      setFormData({
        inlandfreight2: "",
        loadingcost: "",
        laodingvat: "",
      });
      setDeclarationNumber("");
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        setMessage("Network error: Could not connect to the server. ❌");
      } else if (error instanceof Error) {
        setMessage(`Failed to submit data. Error: ${error.message} ❌`);
      } else {
        setMessage("Failed to submit data. An unknown error occurred. ❌");
      }
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
              Inland Fee
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
                onChange={(e) => setDeclarationNumber(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="D123456"
                required
              />
            </div>

            {/* Inland Freight */}
            <div className="mb-4">
              <label
                htmlFor="inlandfreight2"
                className="block font-medium mb-1"
              >
                Inland Freight
              </label>
              <input
                type="number"
                id="inlandfreight2"
                name="inlandfreight2"
                value={formData.inlandfreight2}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter amount"
              />
            </div>

            {/* Loading Cost */}
            <div className="mb-4">
              <label htmlFor="loadingcost" className="block font-medium mb-1">
                Loading Cost
              </label>
              <input
                type="number"
                id="loadingcost"
                name="loadingcost"
                value={formData.loadingcost}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter amount"
              />
            </div>

            {/* Loading VAT */}
            <div className="mb-6">
              <label htmlFor="laodingvat" className="block font-medium mb-1">
                Loading VAT
              </label>
              <input
                type="number"
                id="laodingvat"
                name="laodingvat"
                value={formData.laodingvat}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter amount"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
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
              onClick={() => setFormSubmitted(false)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
            >
              Submit Another Transport Fee
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
