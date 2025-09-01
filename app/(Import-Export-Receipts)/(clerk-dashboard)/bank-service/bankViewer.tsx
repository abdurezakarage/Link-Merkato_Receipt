"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Download, Eye, File, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { BASE_API_URL_local } from "../../import-api/ImportApi";

interface BankDocument {
  file: string;
  filename: string;
  content_type: string;
}

interface FetchedBankDocument {
  bankdate: string;
  bankname: string;
  bankpermitdate: string;
  permitno: string;
  permitamount: string;
  bankreference: string;
  bankservice: string;
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

interface BankViewerProps {
  bankDocument?: BankDocument;
  declarationNumber?: string;
  fetchedDocuments?: FetchedBankDocument[];
}

export default function BankViewer({ 
  bankDocument, 
  declarationNumber,
  fetchedDocuments: passedFetchedDocuments
}: BankViewerProps) {
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    label: string;
  } | null>(null);
  const [fetchedDocuments, setFetchedDocuments] = useState<FetchedBankDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to track the last fetched declaration number
  const lastFetchedDeclarationNumber = useRef<string>("");
  
  // Add logging for component renders
  console.log("bankViewer render:", {
    declarationNumber,
    passedFetchedDocumentsCount: passedFetchedDocuments?.length || 0,
    fetchedDocumentsCount: fetchedDocuments.length,
    isLoading,
    error
  });

  const fetchBankDocuments = useCallback(async () => {
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
      const url = `${BASE_API_URL_local}/api/bank-details/?declaration_number=${declarationNumber}`;
      console.log("Fetching bank documents from URL:", url);

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
        
        setIsLoading(false);
        return;
      }

      const responseData = await response.json();
      console.log("Fetched bank documents:", responseData);
      console.log("Response data structure:", {
        hasData: !!responseData.data,
        dataIsArray: Array.isArray(responseData.data),
        dataLength: responseData.data?.length || 0,
        hasCount: !!responseData.count,
        isDirectArray: Array.isArray(responseData)
      });

      // Handle different response structures
      let dataArray = [];
      
      // Check if response has the new structure with 'data' array
      if (responseData.data && Array.isArray(responseData.data)) {
        dataArray = responseData.data;
        console.log("Using 'data' array structure, length:", dataArray.length);
      } 
      // Check if response has the old structure with 'warehouse_document'
      else if (responseData.count > 0 && responseData.data && Array.isArray(responseData.data)) {
        dataArray = responseData.data;
        console.log("Using 'warehouse_document' structure, length:", dataArray.length);
      }
      // If response is directly an array
      else if (Array.isArray(responseData)) {
        dataArray = responseData;
        console.log("Using direct array structure, length:", dataArray.length);
      }
      
      console.log("Selected data array:", dataArray);
      
      // Check if data array exists and has at least one item
      if (!Array.isArray(dataArray) || dataArray.length === 0) {
        console.log("No transport documents found for this declaration number");
        setFetchedDocuments([]);
        setIsLoading(false);
        return;
      }

      // Log the raw data array to see its structure
      console.log("Raw data array:", dataArray);
      console.log("Data array length:", dataArray.length);
      
      // Check for any obvious duplicates in the raw data
      const rawFileUrls = dataArray.map(item => {
        if (item.documents?.main_file_url) return item.documents.main_file_url;
        if (item.warehouse_document?.file) return item.warehouse_document.file;
        if (item.main_file_url) return item.main_file_url;
        if (item.file) return item.file;
        return null;
      }).filter(Boolean);
      
      const uniqueRawUrls = [...new Set(rawFileUrls)];
      console.log("Raw file URLs:", rawFileUrls);
      console.log("Unique raw file URLs:", uniqueRawUrls);
      console.log("Duplicates in raw data:", rawFileUrls.length - uniqueRawUrls.length);

      // Transform the data to match our expected structure and remove duplicates
      const transformedData = dataArray.map((item: any, index: number) => {
        console.log(`Transforming item ${index}:`, item);
        
        // If the item has a 'documents' field (new structure)
        if (item.documents) {
          console.log(`Item ${index} has 'documents' field`);
          return {
           
            bankdate: item.bankdate || "",
            bankname: item.bankname || "",
            bankpermitdate: item.bankpermitdate || "",
            permitno: item. permitno|| "",
            permitamount: item.permitamount || "",
            bankreference: item. bankreference || "",
            bankservice: item.bankservice || "",
            documents: item.documents
          };
        }
        // If the item has a 'warehouse_document' field (old structure)
        else if (item.warehouse_document) {
          console.log(`Item ${index} has 'warehouse_document' field`);
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
          console.log(`Item ${index} is document itself`);
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

      // Remove duplicates based on document ID and file URL
      const uniqueDocuments = transformedData.filter((item, index, self) => {
        const currentId = item.documents.id;
        const currentMainFile = item.documents.main_file_url;
        const currentWithholdingFile = item.documents.withholding_file_url;
        
        console.log(`Checking item ${index} for duplicates:`, {
          id: currentId,
          mainFile: currentMainFile,
          withholdingFile: currentWithholdingFile
        });
        
        // Find if this document already exists
        const isDuplicate = self.findIndex(existing => {
          // Check if it's the same document by ID
          if (existing.documents.id === currentId && currentId !== 0) {
            console.log(`Duplicate found by ID: ${currentId}`);
            return true;
          }
          
          // Check if it has the same main file URL (and it's not empty)
          if (currentMainFile && currentMainFile.trim() !== "" && 
              existing.documents.main_file_url === currentMainFile) {
            console.log(`Duplicate found by main file URL: ${currentMainFile}`);
            return true;
          }
          
          // Check if it has the same withholding file URL (and it's not empty)
          if (currentWithholdingFile && currentWithholdingFile.trim() !== "" && 
              existing.documents.withholding_file_url === currentWithholdingFile) {
            console.log(`Duplicate found by withholding file URL: ${currentWithholdingFile}`);
            return true;
          }
          
          return false;
        });
        
        const isDuplicateResult = isDuplicate !== index;
        console.log(`Item ${index} is ${isDuplicateResult ? 'duplicate' : 'unique'}`);
        
        // Keep only the first occurrence
        return !isDuplicateResult;
      });

      // Additional safety check: ensure we don't have documents with identical content
      const finalUniqueDocuments = uniqueDocuments.filter((item, index, self) => {
        const currentMainFile = item.documents.main_file_url;
        const currentMainFilename = item.documents.main_filename;
        
        // Find if there's another document with identical file content
        const hasIdenticalContent = self.findIndex(existing => {
          if (index === self.indexOf(existing)) return false; // Skip self
          
          return existing.documents.main_file_url === currentMainFile && 
                 existing.documents.main_filename === currentMainFilename;
        });
        
        if (hasIdenticalContent !== -1) {
          console.log(`Removing duplicate with identical content: ${currentMainFilename}`);
          return false;
        }
        
        return true;
      });


      // Final validation: ensure no duplicates by content
      const finalValidation = finalUniqueDocuments.filter((item, index, self) => {
        const currentFileUrl = item.documents.main_file_url;
        const currentFilename = item.documents.main_filename;
        
        // Check if this exact file appears elsewhere
        const duplicateIndex = self.findIndex(other => 
          other.documents.main_file_url === currentFileUrl && 
          other.documents.main_filename === currentFilename
        );
        
        if (duplicateIndex !== index) {
          console.log(`Final validation: removing duplicate ${currentFilename} at index ${index}`);
          return false;
        }
        
        return true;
      });
      
      console.log("Final validation result:", finalValidation);
      console.log("Documents being set:", finalValidation.length);

      setFetchedDocuments(finalValidation);
      
      // Update last fetched declaration number
      lastFetchedDeclarationNumber.current = declarationNumber;
    } catch (error) {
      console.error("Network or other error during fetch:", error);
      setError("Network error occurred while fetching documents");
    } finally {
      setIsLoading(false);
    }
  }, [declarationNumber]);

  // Use passed fetchedDocuments if available, otherwise fetch them
  useEffect(() => {
    console.log("useEffect triggered with:", { declarationNumber, passedFetchedDocuments: !!passedFetchedDocuments });
    
    if (passedFetchedDocuments) {
      console.log("Using passed fetchedDocuments, count:", passedFetchedDocuments.length);
      
      // Deduplicate passed documents as well to prevent duplicates
      const uniquePassedDocuments = passedFetchedDocuments.filter((item, index, self) => {
        const currentId = item.documents.id;
        const currentMainFile = item.documents.main_file_url;
        const currentWithholdingFile = item.documents.withholding_file_url;
        
        // Find if this document already exists
        const isDuplicate = self.findIndex(existing => {
          // Check if it's the same document by ID
          if (existing.documents.id === currentId && currentId !== 0) return true;
          
          // Check if it has the same main file URL (and it's not empty)
          if (currentMainFile && currentMainFile.trim() !== "" && 
              existing.documents.main_file_url === currentMainFile) return true;
          
          // Check if it has the same withholding file URL (and it's not empty)
          if (currentWithholdingFile && currentWithholdingFile.trim() !== "" && 
              existing.documents.withholding_file_url === currentWithholdingFile) return true;
          
          return false;
        });
        
        // Keep only the first occurrence
        return isDuplicate === index;
      });
      
      console.log("Unique passed documents after deduplication:", uniquePassedDocuments.length);
      setFetchedDocuments(uniquePassedDocuments);
      setIsLoading(false);
      setError(null);
    } else {
      // Only fetch if no documents are passed and we have a declaration number
      const timer = setTimeout(() => {
        if (declarationNumber && declarationNumber !== lastFetchedDeclarationNumber.current) {
          console.log("Fetching clearance documents for declaration:", declarationNumber);
          fetchBankDocuments();
        } else {
          console.log("Skipping fetch - already fetched or no declaration number");
        }
      }, 500); // Debounce to avoid too many API calls

      return () => clearTimeout(timer);
    }
  }, [declarationNumber, passedFetchedDocuments, fetchBankDocuments]);

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
          Bank Service  Document 
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
            <p className="text-lg">Enter a declaration number to view transitor documents</p>
          </div>
        </div>
      ) : fetchedDocuments.length === 0 && !isLoading && !error ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <File size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No bank service documents found for declaration number: {declarationNumber}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Receipt Information - Display once for all documents */}
          {fetchedDocuments.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded">
                  <h5 className="font-semibold mb-2">Receipt Information</h5>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Bank Date:</span> {fetchedDocuments[0].bankdate}</div>
                    <div><span className="font-medium">Bank Name:</span> {fetchedDocuments[0].bankname}</div>
                    <div><span className="font-medium">Bank Reference:</span> {fetchedDocuments[0].bankreference}</div>
                    <div><span className="font-medium">Bank Permit Date:</span> {fetchedDocuments[0].bankpermitdate}</div>
                    <div><span className="font-medium">Permit No:</span> {fetchedDocuments[0].permitno}</div>
                    <div><span className="font-medium">Permit Amount:</span> {fetchedDocuments[0].permitamount}</div>
                    <div><span className="font-medium">Bank Service:</span> {fetchedDocuments[0].bankservice}</div>
                    
                  </div>
                </div>
                
             
              </div>
            </div>
          )}

                     {/* Document Files - Display all documents together */}
           <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
             <h5 className="font-semibold mb-4">Document Files</h5>
             <div className="space-y-4">
               {/* Main Documents */}
               {fetchedDocuments.some(doc => doc.documents.main_file_url) && (
                 <div className="bg-gray-100 p-4 rounded shadow">
                   <h6 className="text-md font-semibold mb-3">Main Documents</h6>
                   <div className="space-y-3">
                     {fetchedDocuments
                       .filter(doc => doc.documents.main_file_url)
                       .map((doc, index) => (
                         <div key={`main-${index}`} className="flex items-center justify-between bg-white p-3 rounded border">
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
                       ))}
                   </div>
                 </div>
               )}



        
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
