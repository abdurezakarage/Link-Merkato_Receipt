"use client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, FormEvent, ChangeEvent } from "react";
import { format } from "date-fns";

interface TransportFeePayload {
  receiptnumber: string;
  receiptdate: string;
  receiptmachinenumber: string;
  receiptcalendar: string;
  withholdingtaxreceiptno: string;
  withholdingtaxReceiptdate: string;
  withholdingamount: number;
  amountbeforetax: number;
}

export default function TransportFeeForm() {
  const [formData, setFormData] = useState<TransportFeePayload>({
    receiptnumber: "",
    receiptdate: "",
    receiptmachinenumber: "",
    receiptcalendar: "",
    withholdingtaxreceiptno: "",
    withholdingtaxReceiptdate: "",
    withholdingamount: 0,
    amountbeforetax: 0,
  });

  const [isWithholdingTaxApplicable, setIsWithholdingTaxApplicable] =
    useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false); // ✅ Track form submission

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === "isWithholdingTaxApplicable") {
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

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage(
        "Authentication error: Token missing. Please log in again. ❌"
      );
      return;
    }

    const payload: TransportFeePayload = formData;

    try {
      const apiUrl = `https://customreceiptmanagement.onrender.com/api/v1/clerk/transportInfo/${97645398}`;

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
        } else {
          const errorText = await response.text();
          errorMessage = errorText || response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        setMessage(
          data.message || "Transport fee receipt submitted successfully! ✅"
        );
      } else {
        const successText = await response.text();
        setMessage(
          successText || "Transport fee receipt submitted successfully! ✅"
        );
      }

      setFormSubmitted(true); // ✅ Mark form as submitted

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

      setIsWithholdingTaxApplicable(false);
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        setMessage("Network error: Could not connect to the server. ❌");
      } else if (error instanceof Error) {
        setMessage(`Failed to submit data. Error: ${error.message} ❌`);
      } else {
        setMessage("Failed to submit data. An unknown error occurred. ❌");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white p-6 rounded shadow">
        {!formSubmitted ? (
          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Transport Fee
            </h2>

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
                className="w-full border rounded px-3 py-2"
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
                className="w-full border rounded px-3 py-2"
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
                    className="w-full border rounded px-3 py-2"
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
                    className="w-full border rounded px-3 py-2"
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
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              </>
            )}

            {/* Other Receipt Details */}
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
                className="w-full border rounded px-3 py-2"
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
                className="w-full border rounded px-3 py-2"
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
                className="w-full border rounded px-3 py-2"
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
                  formData.receiptdate ? new Date(formData.receiptdate) : null
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
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
            >
              Submit
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
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              Submit Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
