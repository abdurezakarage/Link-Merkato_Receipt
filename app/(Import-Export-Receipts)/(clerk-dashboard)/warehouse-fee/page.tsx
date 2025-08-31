"use client";

import { useState, useEffect } from "react";
import ReceiptForm from "./ReceiptForm";
import WarehouseViewer from "../components/warehouseViewer";
import { BASE_API_URL_local } from "../../import-api/ImportApi";

interface WarehouseDocument {
  file: string;
  filename: string;
  content_type: string;
}

interface WarehouseData {
  receiptnumber: string;
  receiptdate: string;
  receiptmachinenumber: string;
  receiptcalendar: string;
  withholdingtaxreceiptno: string | null;
  withholdingtaxReceiptdate: string | null;
  withholdingamount: string | null;
  amountbeforetax: string;
  warehouse_document: WarehouseDocument;
}

interface WarehouseResponse {
  count: number;
  declaration_number: string;
  category: string;
  data: WarehouseData[];
}

export default function MainLayout() {
  const [declarationNumber, setDeclarationNumber] = useState<string>("");
  const [warehouseDocument, setWarehouseDocument] = useState<WarehouseDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWarehouseData = async () => {
      if (!declarationNumber) {
        setWarehouseDocument(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${BASE_API_URL_local}/api/warehouse-details/?declaration_number=${declarationNumber}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data: WarehouseResponse = await response.json();
        
        // Extract the warehouse document from the first item in the data array
        if (data.count > 0 && data.data[0]?.warehouse_document) {
          setWarehouseDocument(data.data[0].warehouse_document);
        } else {
          setWarehouseDocument(null);
        }
      } catch (err: any) {
        console.error("Error fetching warehouse data:", err);
        setError(err.message || "An unexpected error occurred");
        setWarehouseDocument(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouseData();
  }, [declarationNumber]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* First Column: Receipt Upload Form */}
      <div className="w-full lg:w-1/3 p-4 border-r border-gray-200 lg:h-screen lg:overflow-y-auto">
        <ReceiptForm 
          declarationNumber={declarationNumber}
          onDeclarationNumberChange={setDeclarationNumber}
        />
      </div>

      {/* Second Column: Warehouse Document Viewer */}
      <div className="w-full lg:w-2/3 p-4 lg:h-screen lg:overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xl text-blue-600">
            <svg
              className="animate-spin h-5 w-5 mr-3 text-blue-500"
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
            Loading warehouse documents...
          </div>
        ) : error ? (
          <div className="text-center p-6 text-red-600 border border-red-300 bg-red-50 rounded-md mx-auto max-w-md mt-10">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        ) : (
          <WarehouseViewer 
            warehouseDocument={warehouseDocument || undefined}
            declarationNumber={declarationNumber}
          />
        )}
      </div>
    </div>
  );
}
