"use client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, FormEvent, ChangeEvent } from "react";
import { format, parse } from "date-fns";
const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface WarehouseFeePayload {
  receiptnumber: string;
  receiptdate: string;
  receiptmachinenumber: string;
  receiptcalendar: string;
  withholdingtaxreceiptno: string;
  withholdingtaxReceiptdate: string;
  withholdingamount: number;
  amountbeforetax: number;
}

export default function WarehouseFeeForm() {
  const [formData, setFormData] = useState<WarehouseFeePayload>({
    receiptnumber: "",
    receiptdate: "",
    receiptmachinenumber: "",
    receiptcalendar: "",
    withholdingtaxreceiptno: "",
    withholdingtaxReceiptdate: "",
    withholdingamount: 0,
    amountbeforetax: 0,
  });

  const [declarationnumber, setDeclarationNumber] = useState<string>("");
  const [isWithholdingTaxApplicable, setIsWithholdingTaxApplicable] =
    useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === "declarationnumber") {
      setDeclarationNumber(value);
      if (isDuplicate) {
        setIsDuplicate(false);
        e.target.classList.remove("border-red-500", "ring-2", "ring-red-200");
      }
    } else if (name === "isWithholdingTaxApplicable") {
      const isApplicable = value === "Yes";
      setIsWithholdingTaxApplicable(isApplicable);
      if (!isApplicable) {
        setFormData((prev) => ({
          ...prev,
          withholdingtaxreceiptno: "",
          withholdingtaxReceiptdate: "",
          withholdingamount: 0,
        }));
      }
    } else {
      const processedValue =
        type === "number" ? (value === "" ? 0 : parseFloat(value)) : value;
      setFormData((prev) => ({ ...prev, [name]: processedValue }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    setIsDuplicate(false);

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
      const apiUrl = `${BASE_API_URL}/api/v1/clerk/warehouseInfo/${declarationnumber}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = `HTTP error! status: ${response.status}`;

        if (contentType && contentType.includes("application/json")) {
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
            const input = document.getElementById("declarationnumber");
            input?.classList.add("border-red-500", "ring-2", "ring-red-200");
            setIsSubmitting(false);
            return;
          }
        } else {
          const errorText = await response.text();
          errorMessage = errorText || response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const successMsg = "Warehouse fee receipt submitted successfully! ✅";
      setMessage(successMsg);
      setFormSubmitted(true);

      // Reset form
      setFormData({
        receiptnumber: "",
        receiptdate: "",
        receiptmachinenumber: "",
        receiptcalendar: "",
        withholdingtaxreceiptno: "",
        withholdingtaxReceiptdate: "",
        withholdingamount: 0,
        amountbeforetax: 0,
      });
      setDeclarationNumber("");
      setIsWithholdingTaxApplicable(false);
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
              Warehouse Fee
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
                className={`w-full border rounded px-3 py-2 ${
                  isDuplicate
                    ? "border-red-500 ring-2 ring-red-200"
                    : "border-gray-300"
                }`}
                placeholder="D123456"
                required
              />
            </div>

            {/* Amount Before Tax */}
            <div className="mb-4">
              <label
                htmlFor="amountbeforetax"
                className="block font-medium mb-1"
              >
                Amount Before Tax
              </label>
              <input
                type="number"
                id="amountbeforetax"
                name="amountbeforetax"
                value={
                  formData.amountbeforetax === 0 ? "" : formData.amountbeforetax
                }
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1000.00"
                required
              />
            </div>

            {/* Withholding Tax Applicable */}
            <div className="mb-4">
              <label
                htmlFor="isWithholdingTaxApplicable"
                className="block font-medium mb-1"
              >
                Withholding Tax Applicable?
              </label>
              <select
                id="isWithholdingTaxApplicable"
                name="isWithholdingTaxApplicable"
                value={isWithholdingTaxApplicable ? "Yes" : "No"}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {/* Withholding Fields */}
            {isWithholdingTaxApplicable && (
              <>
                <div className="mb-4">
                  <label
                    htmlFor="withholdingamount"
                    className="block font-medium mb-1"
                  >
                    Withholding Amount
                  </label>
                  <input
                    type="number"
                    id="withholdingamount"
                    name="withholdingamount"
                    value={
                      formData.withholdingamount === 0
                        ? ""
                        : formData.withholdingamount
                    }
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="500.00"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="withholdingtaxreceiptno"
                    className="block font-medium mb-1"
                  >
                    Withholding Tax Receipt No.
                  </label>
                  <input
                    type="text"
                    id="withholdingtaxreceiptno"
                    name="withholdingtaxreceiptno"
                    value={formData.withholdingtaxreceiptno}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="WHT-789"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="withholdingtaxReceiptdate"
                    className="block font-medium mb-1"
                  >
                    Withholding Tax Receipt Date
                  </label>
                  <input
                    type="date"
                    id="withholdingtaxReceiptdate"
                    name="withholdingtaxReceiptdate"
                    value={formData.withholdingtaxReceiptdate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </>
            )}

            {/* Receipt Details */}
            <div className="mb-4">
              <label htmlFor="receiptnumber" className="block font-medium mb-1">
                Receipt Number
              </label>
              <input
                type="text"
                id="receiptnumber"
                name="receiptnumber"
                value={formData.receiptnumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="R123456"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="receiptmachinenumber"
                className="block font-medium mb-1"
              >
                Receipt Machine Number
              </label>
              <input
                type="text"
                id="receiptmachinenumber"
                name="receiptmachinenumber"
                value={formData.receiptmachinenumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="M98765"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="receiptcalendar"
                className="block font-medium mb-1"
              >
                Receipt Calendar
              </label>
              <input
                type="text"
                id="receiptcalendar"
                name="receiptcalendar"
                value={formData.receiptcalendar}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Gregorian"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="receiptdate" className="block font-medium mb-1">
                Receipt Date
              </label>
              <DatePicker
                id="receiptdate"
                selected={
                  formData.receiptdate
                    ? parse(formData.receiptdate, "dd-MM-yyyy", new Date())
                    : null
                }
                onChange={(date: Date | null) => {
                  const formattedDate = date ? format(date, "dd-MM-yyyy") : "";
                  setFormData((prev) => ({
                    ...prev,
                    receiptdate: formattedDate,
                  }));
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
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
              Submit Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
