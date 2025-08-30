"use client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, FormEvent, ChangeEvent, useEffect, useRef } from "react";
import { format, parse } from "date-fns";
import { BASE_API_URL } from "../../import-api/ImportApi";
import { BASE_API_URL_local } from "../../import-api/ImportApi";

interface WarehouseFeePayload {
  receiptnumber: string;
  receiptdate: string;
   withholdingtaxreceiptdate: string; // Add this
  receiptmachinenumber: string;
  receiptcalendar: string;
  withholdingtaxreceiptno: string;
  withholdingamount: number | string;
  amountbeforetax: number | string;
}

interface ReceiptFormProps {
  declarationNumber?: string;
  onDeclarationNumberChange?: (value: string) => void;
}

export default function WarehouseFeeForm({ 
  declarationNumber = "", 
  onDeclarationNumberChange 
}: ReceiptFormProps) {
  const [formData, setFormData] = useState<WarehouseFeePayload>({
    receiptnumber: "",
    receiptdate: "",
   withholdingtaxreceiptdate: "", // Add this

    receiptmachinenumber: "",
    receiptcalendar: "",
    withholdingtaxreceiptno: "",
    withholdingamount: '',
    amountbeforetax: '',
  });

  const [declarationnumber, setDeclarationNumber] = useState<string>(declarationNumber);
  const [isWithholdingTaxApplicable, setIsWithholdingTaxApplicable] =
    useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(false);
  
  // Use a ref to track the last fetched declaration number
  const lastFetchedDeclarationNumber = useRef<string>("");

  // Update local state when prop changes
  useEffect(() => {
    setDeclarationNumber(declarationNumber);
  }, [declarationNumber]);

  // Add useEffect to fetch data when declarationnumber changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (declarationnumber ) {
        fetchWarehouseData();
      }
    }, 500); // Debounce to avoid too many API calls

    return () => clearTimeout(timer);
  }, [declarationnumber]);
const fetchWarehouseData = async () => {
  if (!declarationnumber) {
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("No token found in localStorage—cannot fetch");
    return;
  }

  setIsFetchingData(true);
  try {
    const url = `${BASE_API_URL_local}/api/warehouse-details/?declaration_number=${declarationnumber}`;
    console.log("Fetching from URL:", url);

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const json = await response.json();
      console.error(
        `Fetch failed. Status: ${response.status} ${response.statusText}.`,
        "Backend response:",
        json
      );
      setIsFetchingData(false);
      return;
    }

    const responseData = await response.json();
    console.log("Fetched warehouse data:", responseData);

    // Extract the data from the nested structure: {count: 1, data: Array(1)}
    const dataArray = responseData.data;
    
    // Check if data array exists and has at least one item
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      console.log("No data found for this declaration number - empty array returned");
      setIsFetchingData(false);
      return;
    }

    // Extract the first item from the data array
    const actualData = dataArray[0];
    console.log("Actual data to use:", actualData);

    if (!actualData) {
      console.log("No data found for this declaration number");
      setIsFetchingData(false);
      return;
    }

    // Update the form data with fetched values
    setFormData({
      receiptnumber: actualData.receiptnumber || "",
      receiptdate: actualData.receiptdate || "",
      withholdingtaxreceiptdate: actualData.withholdingtaxReceiptdate || actualData.withholdingtaxreceiptdate || "",
      receiptmachinenumber: actualData.receiptmachinenumber || "",
      receiptcalendar: actualData.receiptcalendar || "",
      withholdingtaxreceiptno: actualData.withholdingtaxreceiptno || "",
      withholdingamount: actualData.withholdingamount !== undefined && actualData.withholdingamount !== null 
        ? actualData.withholdingamount.toString() 
        : '',
      amountbeforetax: actualData.amountbeforetax !== undefined && actualData.amountbeforetax !== null 
        ? actualData.amountbeforetax.toString() 
        : '',
    });
    
    console.log("receiptcalendar from actualData:", actualData.receiptcalendar);

    // Set withholding tax applicability based on fetched data
    setIsWithholdingTaxApplicable(!!actualData.withholdingtaxreceiptno);
    
    // Update last fetched declaration number
    lastFetchedDeclarationNumber.current = declarationnumber;
  } catch (error) {
    console.error("Network or other error during fetch:", error);
  } finally {
    setIsFetchingData(false);
  }
};
 

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === "declarationnumber") {
      setDeclarationNumber(value);
      // Call the callback to update parent state
      if (onDeclarationNumberChange) {
        onDeclarationNumberChange(value);
      }
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
          withholdingamount: '',
        }));
      }
    } else {
      // For number inputs, keep as string for proper display but convert to number when submitting
      setFormData((prev) => ({ ...prev, [name]: value }));
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
      // Prepare data for submission - convert string numbers back to numbers
      const submissionData = {
        ...formData,
        withholdingamount: formData.withholdingamount ? parseFloat(formData.withholdingamount as string) : 0,
        amountbeforetax: formData.amountbeforetax ? parseFloat(formData.amountbeforetax as string) : 0,
      };

      const apiUrl = `${BASE_API_URL}/api/v1/clerk/warehouseInfo/${declarationnumber}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(submissionData),
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
        withholdingtaxreceiptdate:"",
        receiptmachinenumber: "",
        receiptcalendar: "",
        withholdingtaxreceiptno: "",
        withholdingamount: '',
        amountbeforetax: '',
      });
      setDeclarationNumber("");
      // Reset parent state
      if (onDeclarationNumberChange) {
        onDeclarationNumberChange("");
      }
      setIsWithholdingTaxApplicable(false);
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
              <div className="relative">
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
                value={formData.amountbeforetax}
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
                    value={formData.withholdingamount}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="500.00"
                    required={isWithholdingTaxApplicable}
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
                    required={isWithholdingTaxApplicable}
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
                // Reset declaration number in parent state
                if (onDeclarationNumberChange) {
                  onDeclarationNumberChange("");
                }
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