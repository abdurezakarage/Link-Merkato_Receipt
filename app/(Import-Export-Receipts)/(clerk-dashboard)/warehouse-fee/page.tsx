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

interface FetchedDocument {
  receiptnumber: string;
  receiptdate: string;
  receiptmachinenumber: string;
  receiptcalendar: string;
  withholdingtaxreceiptno: string;
  withholdingtaxReceiptdate: string;
  withholdingamount: string;
  amountbeforetax: string;
  documents: {
    id: number;
    company_tin: string;
    declaration_number: string;
    uploaded_at: string;
    status: string;
    main_file_url: string;
    main_filename: string;
    main_content_type: string;
    main_attachment_url: string | null;
    main_attachment_filename: string | null;
    main_attachment_content_type: string | null;
    has_main_attachment: boolean;
    withholding_file_url: string | null;
    withholding_filename: string | null;
    withholding_content_type: string | null;
    withholding_attachment_url: string | null;
    withholding_attachment_filename: string | null;
    withholding_attachment_content_type: string | null;
    has_withholding_attachment: boolean;
  };
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
  const [fetchedDocuments, setFetchedDocuments] = useState<FetchedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWarehouseData = async () => {
      if (!declarationNumber) {
        setWarehouseDocument(null);
        setFetchedDocuments([]);
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

        const responseData = await response.json();
        console.log("Fetched warehouse data:", responseData);

        // Handle different response structures
        let dataArray = [];
        
        // Check if response has the new structure with 'data' array
        if (responseData.data && Array.isArray(responseData.data)) {
          dataArray = responseData.data;
        } 
        // Check if response has the old structure with 'warehouse_document'
        else if (responseData.count > 0 && responseData.data && Array.isArray(responseData.data)) {
          dataArray = responseData.data;
        }
        // If response is directly an array
        else if (Array.isArray(responseData)) {
          dataArray = responseData;
        }
        
        // Check if data array exists and has at least one item
        if (!Array.isArray(dataArray) || dataArray.length === 0) {
          console.log("No warehouse documents found for this declaration number");
          setWarehouseDocument(null);
          setFetchedDocuments([]);
          setLoading(false);
          return;
        }

        // Transform the data to match our expected structure
        const transformedData = dataArray.map((item: any) => {
          console.log("Processing item:", item);
          
          // If the item has a 'documents' field (new structure)
          if (item.documents) {
            console.log("Found documents field:", item.documents);
            return {
              receiptnumber: item.receiptnumber || "",
              receiptdate: item.receiptdate || "",
              receiptmachinenumber: item.receiptmachinenumber || "",
              receiptcalendar: item.receiptcalendar || "",
              withholdingtaxreceiptno: item.withholdingtaxreceiptno || "",
              withholdingtaxReceiptdate: item.withholdingtaxReceiptdate || "",
              withholdingamount: item.withholdingamount || "",
              amountbeforetax: item.amountbeforetax || "",
              documents: item.documents
            };
          }
          // If the item has a 'warehouse_document' field (old structure)
          else if (item.warehouse_document) {
            console.log("Found warehouse_document field:", item.warehouse_document);
            return {
              receiptnumber: item.receiptnumber || "",
              receiptdate: item.receiptdate || "",
              receiptmachinenumber: item.receiptmachinenumber || "",
              receiptcalendar: item.receiptcalendar || "",
              withholdingtaxreceiptno: item.withholdingtaxreceiptno || "",
              withholdingtaxReceiptdate: item.withholdingtaxReceiptdate || "",
              withholdingamount: item.withholdingamount || "",
              amountbeforetax: item.amountbeforetax || "",
              documents: {
                id: item.warehouse_document.id || 0,
                company_tin: item.warehouse_document.company_tin || "",
                declaration_number: item.declaration_number || "",
                uploaded_at: item.warehouse_document.uploaded_at || "",
                status: item.warehouse_document.status || "",
                main_file_url: item.warehouse_document.file || "",
                main_filename: item.warehouse_document.filename || "",
                main_content_type: item.warehouse_document.content_type || "",
                main_attachment_url: null,
                main_attachment_filename: null,
                main_attachment_content_type: null,
                has_main_attachment: false,
                withholding_file_url: null,
                withholding_filename: null,
                withholding_content_type: null,
                withholding_attachment_url: null,
                withholding_attachment_filename: null,
                withholding_attachment_content_type: null,
                has_withholding_attachment: false
              }
            };
          }
          // If the item is the document itself
          else {
            console.log("Item appears to be a document itself:", item);
            return {
              receiptnumber: "",
              receiptdate: "",
              receiptmachinenumber: "",
              receiptcalendar: "",
              withholdingtaxreceiptno: "",
              withholdingtaxReceiptdate: "",
              withholdingamount: "",
              amountbeforetax: "",
              documents: {
                id: item.id || 0,
                company_tin: item.company_tin || "",
                declaration_number: declarationNumber,
                uploaded_at: item.uploaded_at || "",
                status: item.status || "",
                main_file_url: item.main_file_url || item.file || "",
                main_filename: item.main_filename || item.filename || "",
                main_content_type: item.main_content_type || item.content_type || "",
                main_attachment_url: item.main_attachment_url || null,
                main_attachment_filename: item.main_attachment_filename || null,
                main_attachment_content_type: item.main_attachment_content_type || null,
                has_main_attachment: item.has_main_attachment || false,
                withholding_file_url: item.withholding_file_url || null,
                withholding_filename: item.withholding_filename || null,
                withholding_content_type: item.withholding_content_type || null,
                withholding_attachment_url: item.withholding_attachment_url || null,
                withholding_attachment_filename: item.withholding_attachment_filename || null,
                withholding_attachment_content_type: item.withholding_attachment_content_type || null,
                has_withholding_attachment: item.has_withholding_attachment || false
              }
            };
          }
        });

        console.log("Transformed data:", transformedData);
        setFetchedDocuments(transformedData);
        
        // For backward compatibility, also set the warehouse document if it exists
        if (dataArray[0]?.warehouse_document) {
          setWarehouseDocument(dataArray[0].warehouse_document);
        } else {
          setWarehouseDocument(null);
        }
      } catch (err: any) {
        console.error("Error fetching warehouse data:", err);
        setError(err.message || "An unexpected error occurred");
        setWarehouseDocument(null);
        setFetchedDocuments([]);
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
            fetchedDocuments={fetchedDocuments}
          />
        )}
      </div>
    </div>
  );
}
