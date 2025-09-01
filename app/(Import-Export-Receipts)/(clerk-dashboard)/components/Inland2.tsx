"use client";
import { useState, FormEvent, ChangeEvent, useEffect, useRef } from "react";
import { BASE_API_URL } from "../../import-api/ImportApi";
import { BASE_API_URL_local } from "../../import-api/ImportApi";



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
  const [isFetchingData, setIsFetchingData] = useState<boolean>(false);
  
  // Use a ref to track the last fetched declaration number
  const lastFetchedDeclarationNumber = useRef<string>("");

  useEffect(() => {
    if (!declarationnumber) {
      // Clear form if declaration number is empty
      setFormData({
        inlandfreight2: "",
        loadingcost: "",
        laodingvat: "",
      });
      lastFetchedDeclarationNumber.current = "";
      return;
    }

    // Don't fetch if we already have data for this declaration number
    if (declarationnumber === lastFetchedDeclarationNumber.current) {
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        setIsFetchingData(true);
        const res = await fetch(
          `${BASE_API_URL_local}/api/inland-freight/?declaration_number=${declarationnumber}`,
          {
            headers: { Authorization: `Bearer ${token}` },

          }
        );

        if (res.ok) {
          const data = await res.json();
          setFormData({
            inlandfreight2: data.inlandfreight2 || "",
            loadingcost: data.loadingcost || "",
            laodingvat: data.laodingvat || "",
          });
          lastFetchedDeclarationNumber.current = declarationnumber;
        } else {
          // Clear form if no data found or error
          setFormData({
            inlandfreight2: "",
            loadingcost: "",
            laodingvat: "",
          });
          lastFetchedDeclarationNumber.current = "";
        }
      } catch (err) {
        console.error("Error fetching inland2 info:", err);
        // Clear form on error
        setFormData({
          inlandfreight2: "",
          loadingcost: "",
          laodingvat: "",
        });
        lastFetchedDeclarationNumber.current = "";
      } finally {
        setIsFetchingData(false);
      }
    }, 600); // debounce 600ms

    return () => clearTimeout(timeout);
  }, [declarationnumber]);

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
      lastFetchedDeclarationNumber.current = "";
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 text-black">
      <div className="w-full max-w-xl bg-white p-2 rounded shadow">
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
            <h2 className="text-center font-semibold mb-4 text-gray-800">
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
              <div className="relative">
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
                {isFetchingData && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the declaration number to auto-fill the form
              </p>
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
              onClick={() => {
                setFormSubmitted(false);
                setMessage(null);
              }}
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