"use client";
import { useState, useEffect, useRef } from "react";
import { Download, Eye, File, ArrowLeft } from "lucide-react";
import Image from "next/image";
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

interface WarehouseViewerProps {
  warehouseDocument?: WarehouseDocument;
  declarationNumber?: string;
  fetchedDocuments?: FetchedDocument[];
}

export default function WarehouseViewer({ 
  warehouseDocument, 
  declarationNumber,
  fetchedDocuments: passedFetchedDocuments
}: WarehouseViewerProps) {
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    label: string;
  } | null>(null);
  const [fetchedDocuments, setFetchedDocuments] = useState<FetchedDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to track the last fetched declaration number
  const lastFetchedDeclarationNumber = useRef<string>("");

  // Use passed fetchedDocuments if available, otherwise fetch them
  useEffect(() => {
    if (passedFetchedDocuments) {
      setFetchedDocuments(passedFetchedDocuments);
      setIsLoading(false);
      setError(null);
    } else {
      // Only fetch if no documents are passed and we have a declaration number
      const timer = setTimeout(() => {
        if (declarationNumber && declarationNumber !== lastFetchedDeclarationNumber.current) {
          fetchWarehouseDocuments();
        }
      }, 500); // Debounce to avoid too many API calls

      return () => clearTimeout(timer);
    }
  }, [declarationNumber, passedFetchedDocuments]);

  const fetchWarehouseDocuments = async () => {
    if (!declarationNumber) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found in localStorage—cannot fetch");
      setError("Authentication error: Token missing. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const url = `${BASE_API_URL_local}/api/warehouse-details/?declaration_number=${declarationNumber}`;
      console.log("Fetching warehouse documents from URL:", url);

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
        
        // Handle specific error messages
        // if (json.message && json.message.includes("No matching items found")) {
        //   setError("No warehouse documents found for this declaration number. Please check the declaration number and try again.");
        // } else {
        //   setError(`Failed to fetch documents: ${json.message || response.statusText}`);
        // }
        setIsLoading(false);
        return;
      }

      const responseData = await response.json();
      console.log("Fetched warehouse documents:", responseData);

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
        setFetchedDocuments([]);
        setIsLoading(false);
        return;
      }

      // Transform the data to match our expected structure
      const transformedData = dataArray.map((item: any) => {
        // If the item has a 'documents' field (new structure)
        if (item.documents) {
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

      setFetchedDocuments(transformedData);
      
      // Update last fetched declaration number
      lastFetchedDeclarationNumber.current = declarationNumber;
    } catch (error) {
      console.error("Network or other error during fetch:", error);
      setError("Network error occurred while fetching documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPreview = (url: string, label: string) => {
    setPreviewFile({ url, label });
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  const createDataUrl = (filePath: string, contentType: string): string => {
    if (!filePath) return "";
    
    // If it's already a data URL, return as-is
    if (filePath.startsWith("data:")) {
      return filePath;
    }

    // If it's already a full URL, return as-is
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }

    // For file paths, construct the full URL with the correct base URL
    const baseUrl = "https://api.local.linkmerkato.com.et";
    return `${baseUrl}${filePath}`;
  };

  const handleDownload = (url: string, filename: string) => {
    try {
      // Extract just the filename from the path if it contains a path
      const actualFilename = filename.includes('/') ? filename.split('/').pop() : filename;
      
      const a = document.createElement("a");
      a.href = url;
      a.download = actualFilename || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  if (previewFile) {
    const isImage = previewFile.url.startsWith("data:image") || 
                   previewFile.url.includes("image/") ||
                   previewFile.label.toLowerCase().endsWith('.jpg') ||
                   previewFile.label.toLowerCase().endsWith('.jpeg') ||
                   previewFile.label.toLowerCase().endsWith('.png') ||
                   previewFile.label.toLowerCase().endsWith('.gif') ||
                   previewFile.label.toLowerCase().endsWith('.webp');
    const isPdf = previewFile.url.startsWith("data:application/pdf") || 
                  previewFile.url.includes("application/pdf") ||
                  previewFile.label.toLowerCase().endsWith('.pdf');

    return (
      <div className="p-4 bg-white rounded-lg shadow-lg h-full flex flex-col">
        <div className="flex items-center gap-4 border-b pb-4 mb-4">
          <button
            onClick={handleClosePreview}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-semibold">{previewFile.label} Preview</h2>
        </div>
        <div className="flex-grow overflow-auto">
          {isImage ? (
            <div className="relative w-full h-full">
              <Image
                src={previewFile.url}
                alt={previewFile.label}
                fill
                className="object-contain"
                unoptimized={true}
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={previewFile.url}
              className="w-full h-full border-none"
              title={`${previewFile.label} Preview`}
            />
          ) : (
            <div className="text-center py-10">
              <p className="text-red-600 mb-4">
                Unsupported format: {previewFile.label}
              </p>
              <a 
                href={previewFile.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Open in new tab
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          Warehouse Document Viewer
        </h1>
      </div>

      {declarationNumber && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Declaration Number: {declarationNumber}
          </h3>
          {isLoading && (
            <div className="text-blue-600 text-center py-4">
              Loading documents...
            </div>
          )}
          {error && (
            <div className="text-red-600 text-center py-4">
              {error}
            </div>
          )}
        </div>
      )}

      {!declarationNumber ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <File size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Enter a declaration number to view warehouse documents</p>
          </div>
        </div>
      ) : fetchedDocuments.length === 0 && !isLoading && !error ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <File size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No warehouse documents found for declaration number: {declarationNumber}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {fetchedDocuments.map((doc, index) => {
            console.log("Rendering document:", doc);
            return (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                <h4 className="text-lg font-semibold mb-4">Document Details</h4>
                
                {/* Receipt Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded">
                    <h5 className="font-semibold mb-2">Receipt Information</h5>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Receipt Number:</span> {doc.receiptnumber}</div>
                      <div><span className="font-medium">Receipt Date:</span> {doc.receiptdate}</div>
                      <div><span className="font-medium">Machine Number:</span> {doc.receiptmachinenumber}</div>
                      <div><span className="font-medium">Calendar:</span> {doc.receiptcalendar}</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <h5 className="font-semibold mb-2">Withholding Tax Information</h5>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Receipt No:</span> {doc.withholdingtaxreceiptno || 'N/A'}</div>
                      <div><span className="font-medium">Receipt Date:</span> {doc.withholdingtaxReceiptdate || 'N/A'}</div>
                      <div><span className="font-medium">Withholding Amount:</span> {doc.withholdingamount || 'N/A'}</div>
                      <div><span className="font-medium">Amount Before Tax:</span> {doc.amountbeforetax || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Document Files */}
                <div className="space-y-4">
                  <h5 className="font-semibold">Document Files</h5>
                  
                  {/* Main Document */}
                  {doc.documents.main_file_url && (
                    <div className="bg-gray-100 p-4 rounded shadow">
                      <h6 className="text-md font-semibold mb-2">Main Document</h6>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">{doc.documents.main_filename}</p>
                          <p className="text-xs text-gray-500">Type: {doc.documents.main_content_type}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const url = createDataUrl(
                                doc.documents.main_file_url,
                                doc.documents.main_content_type
                              );
                              handleOpenPreview(url, doc.documents.main_filename);
                            }}
                            className="flex items-center gap-1 text-sm text-purple-600 hover:underline bg-purple-50 px-3 py-1 rounded"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            onClick={() => {
                              const url = createDataUrl(
                                doc.documents.main_file_url,
                                doc.documents.main_content_type
                              );
                              handleDownload(url, doc.documents.main_filename);
                            }}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1 rounded"
                          >
                            <Download size={14} /> Download
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Withholding Document */}
                  {doc.documents.withholding_file_url && (
                    <div className="bg-gray-100 p-4 rounded shadow">
                      <h6 className="text-md font-semibold mb-2">Withholding Document</h6>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">{doc.documents.withholding_filename}</p>
                          <p className="text-xs text-gray-500">Type: {doc.documents.withholding_content_type}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const url = createDataUrl(
                                doc.documents.withholding_file_url!,
                                doc.documents.withholding_content_type!
                              );
                              handleOpenPreview(url, doc.documents.withholding_filename!);
                            }}
                            className="flex items-center gap-1 text-sm text-purple-600 hover:underline bg-purple-50 px-3 py-1 rounded"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            onClick={() => {
                              const url = createDataUrl(
                                doc.documents.withholding_file_url!,
                                doc.documents.withholding_content_type!
                              );
                              handleDownload(url, doc.documents.withholding_filename!);
                            }}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1 rounded"
                          >
                            <Download size={14} /> Download
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main Attachment */}
                  {doc.documents.has_main_attachment && doc.documents.main_attachment_url && (
                    <div className="bg-gray-100 p-4 rounded shadow">
                      <h6 className="text-md font-semibold mb-2">Main Attachment</h6>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">{doc.documents.main_attachment_filename}</p>
                          <p className="text-xs text-gray-500">Type: {doc.documents.main_attachment_content_type}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const url = createDataUrl(
                                doc.documents.main_attachment_url!,
                                doc.documents.main_attachment_content_type!
                              );
                              handleOpenPreview(url, doc.documents.main_attachment_filename!);
                            }}
                            className="flex items-center gap-1 text-sm text-purple-600 hover:underline bg-purple-50 px-3 py-1 rounded"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            onClick={() => {
                              const url = createDataUrl(
                                doc.documents.main_attachment_url!,
                                doc.documents.main_attachment_content_type!
                              );
                              handleDownload(url, doc.documents.main_attachment_filename!);
                            }}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1 rounded"
                          >
                            <Download size={14} /> Download
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Withholding Attachment */}
                  {doc.documents.has_withholding_attachment && doc.documents.withholding_attachment_url && (
                    <div className="bg-gray-100 p-4 rounded shadow">
                      <h6 className="text-md font-semibold mb-2">Withholding Attachment</h6>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">{doc.documents.withholding_attachment_filename}</p>
                          <p className="text-xs text-gray-500">Type: {doc.documents.withholding_attachment_content_type}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const url = createDataUrl(
                                doc.documents.withholding_attachment_url!,
                                doc.documents.withholding_attachment_content_type!
                              );
                              handleOpenPreview(url, doc.documents.withholding_attachment_filename!);
                            }}
                            className="flex items-center gap-1 text-sm text-purple-600 hover:underline bg-purple-50 px-3 py-1 rounded"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            onClick={() => {
                              const url = createDataUrl(
                                doc.documents.withholding_attachment_url!,
                                doc.documents.withholding_attachment_content_type!
                              );
                              handleDownload(url, doc.documents.withholding_attachment_filename!);
                            }}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1 rounded"
                          >
                            <Download size={14} /> Download
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legacy support for warehouseDocument prop */}
      {warehouseDocument && fetchedDocuments.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
          <h4 className="text-lg font-semibold mb-4">Legacy Document</h4>
          
          <div className="bg-gray-100 p-4 rounded shadow flex flex-col justify-between">
            <div>
              <h5 className="text-md font-semibold mb-2">
                {warehouseDocument.filename}
              </h5>
              <div
                className="w-full h-48 rounded cursor-pointer overflow-hidden flex items-center justify-center bg-gray-200"
                onClick={() => {
                  const url = createDataUrl(
                    warehouseDocument.file,
                    warehouseDocument.content_type
                  );
                  handleOpenPreview(url, warehouseDocument.filename);
                }}
              >
                {warehouseDocument.content_type.startsWith("image/") ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={createDataUrl(
                        warehouseDocument.file,
                        warehouseDocument.content_type
                      )}
                      alt={warehouseDocument.filename}
                      fill
                      className="object-contain"
                      unoptimized={true}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/image-error-placeholder.png";
                      }}
                    />
                  </div>
                ) : warehouseDocument.content_type === "application/pdf" ? (
                  <p className="text-blue-600 text-center p-4 flex items-center gap-2">
                    <File size={20} /> Click to view PDF
                  </p>
                ) : (
                  <p className="text-gray-500">Unsupported file format</p>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 gap-2">
              <button
                onClick={() => {
                  const url = createDataUrl(
                    warehouseDocument.file,
                    warehouseDocument.content_type
                  );
                  handleOpenPreview(url, warehouseDocument.filename);
                }}
                className="flex-1 flex items-center justify-center gap-2 text-sm text-purple-600 hover:underline bg-purple-50 py-2 rounded cursor-pointer"
              >
                <Eye size={16} /> View
              </button>
              <button
                onClick={() => {
                  const url = createDataUrl(
                    warehouseDocument.file,
                    warehouseDocument.content_type
                  );
                  handleDownload(url, warehouseDocument.filename);
                }}
                className="flex-1 flex items-center justify-center gap-2 text-sm text-blue-600 hover:underline bg-blue-50 py-2 rounded cursor-pointer"
              >
                <Download size={16} /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
