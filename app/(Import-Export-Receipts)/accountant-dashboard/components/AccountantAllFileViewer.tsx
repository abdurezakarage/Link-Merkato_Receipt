"use client";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Download,
  X,
  Eye,
  ChevronDown,
  File,
  ArrowLeft,
  Search,
} from "lucide-react";
import Image from "next/image";
import { BASE_API_URL } from "../../import-api/ImportApi";

// ---------------- Interfaces ----------------
interface FileData {
  file: string;
  fileType: string;
}

interface DeclarationNumber {
  declarionNumberPerCampany: string;
}

interface BaseFile {
  userId: string;
  tinNumber?: string; // For warehouse, transport, clearance
  tinNumebr?: string; // For custom API
  firstname?: string; // For custom API
  firstName?: string; // For other APIs
  lastname: string;
  companyname?: string; // For custom API
  companyName?: string; // For other APIs
  declartionNumber?: DeclarationNumber[];
}

interface CustomFile extends BaseFile {
  imagebaseCustomfile: FileData[];
  imagebaseBankPermitfile: FileData[];
  imageCummercialInvoicefile: FileData[];
}

interface OtherFile extends BaseFile {
  mainReceiptfile: FileData[];
  withHoldihReceiptfile: FileData[];
}

type FileType = "warehouse" | "custom" | "transport" | "clearance";

// ---------------- Helper Functions ----------------
const createDataUrl = (
  base64String: string | null | undefined,
  fileType: string
): string => {
  if (!base64String) return "";

  if (base64String.startsWith("data:")) {
    return base64String;
  }

  let mimeType = "application/octet-stream";
  if (fileType.toLowerCase().includes("pdf")) {
    mimeType = "application/pdf";
  } else if (fileType.match(/jpeg|jpg|png|gif|webp/i)) {
    mimeType = `image/${fileType.toLowerCase()}`;
  }

  const cleanedBase64 = base64String
    .replace(/^data:image\/\w+;base64,/, "")
    .replace(/\s/g, "");

  try {
    window.atob(cleanedBase64);
    return `data:${mimeType};base64,${cleanedBase64}`;
  } catch (e) {
    console.error("Invalid base64 string");
    return "";
  }
};

// ---------------- FilePreview Component ----------------
function FilePreview({
  label,
  url,
  onPreviewClick,
}: {
  label: string;
  url: string;
  onPreviewClick: (url: string, label: string) => void;
}) {
  const isImage = url.startsWith("data:image");
  const isPdf = url.startsWith("data:application/pdf");

  const handleDownload = () => {
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = `${label.replace(/[^a-zA-Z0-9]/g, "_")}.${
        isPdf ? "pdf" : url.split(";")[0].split("/")[1] || "file"
      }`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded shadow flex flex-col justify-between">
      <div>
        <h3 className="text-md font-semibold mb-2">{label}</h3>
        <div
          className="w-full h-48 rounded cursor-pointer overflow-hidden flex items-center justify-center bg-gray-200"
          onClick={() => onPreviewClick(url, label)}
        >
          {isImage ? (
            <div className="relative w-full h-full">
              <Image
                src={url}
                alt={label}
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
          ) : isPdf ? (
            <p className="text-blue-600 text-center p-4 flex items-center gap-2">
              <File size={20} /> Click to view PDF
            </p>
          ) : (
            <p className="text-gray-500">Unsupported file format</p>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 gap-2">
        {(isImage || isPdf) && (
          <button
            onClick={() => onPreviewClick(url, label)}
            className="flex-1 flex items-center justify-center gap-2 text-sm text-purple-600 hover:underline bg-purple-50 py-2 rounded cursor-pointer"
          >
            <Eye size={16} /> View
          </button>
        )}
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 text-sm text-blue-600 hover:underline bg-blue-50 py-2 rounded cursor-pointer"
        >
          <Download size={16} /> Download
        </button>
      </div>
    </div>
  );
}

// ---------------- CompanySection Component ----------------
function CompanySection({
  companyName,
  files,
  onPreviewClick,
  searchTerm,
}: {
  companyName: string;
  files: {
    warehouse: OtherFile[];
    custom: CustomFile[];
    transport: OtherFile[];
    clearance: OtherFile[];
  };
  onPreviewClick: (url: string, label: string) => void;
  searchTerm: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const hasMatchingFiles = useMemo(() => {
    if (!searchTerm) return true;

    const allFiles = [
      ...files.warehouse,
      ...files.custom,
      ...files.transport,
      ...files.clearance,
    ];

    return allFiles.some((file) =>
      file.declartionNumber?.some((decl) =>
        decl.declarionNumberPerCampany
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [files, searchTerm]);

  if (!hasMatchingFiles) return null;

  const totalFiles =
    files.warehouse.length +
    files.custom.length +
    files.transport.length +
    files.clearance.length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center text-left"
      >
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">
            {companyName || "Unnamed Company"}
          </h3>
          <p className="text-sm text-gray-500 font-medium">
            {totalFiles} file(s) across{" "}
            {
              Object.keys(files).filter(
                (key) => files[key as FileType].length > 0
              ).length
            }{" "}
            categories
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ChevronDown
            className={`text-gray-400 transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {expanded && (
        <div className="mt-6 space-y-6">
          {/* Warehouse Files */}
          {files.warehouse.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-blue-600 text-white px-4 py-2">
                <h4 className="font-bold">
                  Warehouse Files ({files.warehouse.length})
                </h4>
              </div>
              <div className="p-4 bg-gray-50">
                {files.warehouse.map((file, index) => (
                  <OtherFileSection
                    key={`warehouse-${index}`}
                    file={file}
                    type="warehouse"
                    onPreviewClick={onPreviewClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Custom Files */}
          {files.custom.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-green-600 text-white px-4 py-2">
                <h4 className="font-bold">
                  Custom Files ({files.custom.length})
                </h4>
              </div>
              <div className="p-4 bg-gray-50">
                {files.custom.map((file, index) => (
                  <CustomFileSection
                    key={`custom-${index}`}
                    file={file}
                    type="custom"
                    onPreviewClick={onPreviewClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Transport Files */}
          {files.transport.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-yellow-600 text-white px-4 py-2">
                <h4 className="font-bold">
                  Transport Files ({files.transport.length})
                </h4>
              </div>
              <div className="p-4 bg-gray-50">
                {files.transport.map((file, index) => (
                  <OtherFileSection
                    key={`transport-${index}`}
                    file={file}
                    type="transport"
                    onPreviewClick={onPreviewClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Clearance Files */}
          {files.clearance.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-purple-600 text-white px-4 py-2">
                <h4 className="font-bold">
                  Clearance Files ({files.clearance.length})
                </h4>
              </div>
              <div className="p-4 bg-gray-50">
                {files.clearance.map((file, index) => (
                  <OtherFileSection
                    key={`clearance-${index}`}
                    file={file}
                    type="clearance"
                    onPreviewClick={onPreviewClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------- CustomFileSection Component ----------------
function CustomFileSection({
  file,
  type,
  onPreviewClick,
}: {
  file: CustomFile;
  type: FileType;
  onPreviewClick: (url: string, label: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  // Get consistent property names
  const tinNumber = file.tinNumebr || file.tinNumber || "N/A";
  const firstName = file.firstname || file.firstName || "N/A";
  const companyName = file.companyname || file.companyName || "Unknown Company";

  return (
    <div className="mb-4 border border-gray-200 rounded-lg bg-white shadow-xs">
      <div
        className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 className="font-semibold text-gray-800">
            {firstName} {file.lastname}
          </h3>
          <p className="text-xs text-gray-600">TIN: {tinNumber}</p>
          <p className="text-xs text-gray-600">Company: {companyName}</p>
        </div>
        <div className="flex items-center">
          {file.declartionNumber && (
            <div className="mr-4">
              {file.declartionNumber.map((decl, i) => (
                <span
                  key={i}
                  className="bg-gray-100 px-2 py-1 rounded text-xs mr-1"
                >
                  {decl.declarionNumberPerCampany}
                </span>
              ))}
            </div>
          )}
          <ChevronDown
            size={18}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {expanded && (
        <div className="p-3 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <p className="text-xs font-medium mb-2">Custom Files</p>
              {file.imagebaseCustomfile &&
                file.imagebaseCustomfile.map((fileObj, index) => {
                  const url = createDataUrl(fileObj.file, fileObj.fileType);
                  return url ? (
                    <FilePreview
                      key={`custom-${index}`}
                      label={`Custom File ${index + 1}`}
                      url={url}
                      onPreviewClick={onPreviewClick}
                    />
                  ) : null;
                })}
            </div>
            <div>
              <p className="text-xs font-medium mb-2">Bank Permit Files</p>
              {file.imagebaseBankPermitfile &&
                file.imagebaseBankPermitfile.map((fileObj, index) => {
                  const url = createDataUrl(fileObj.file, fileObj.fileType);
                  return url ? (
                    <FilePreview
                      key={`bank-${index}`}
                      label={`Bank Permit ${index + 1}`}
                      url={url}
                      onPreviewClick={onPreviewClick}
                    />
                  ) : null;
                })}
            </div>
            <div>
              <p className="text-xs font-medium mb-2">
                Commercial Invoice Files
              </p>
              {file.imageCummercialInvoicefile &&
                file.imageCummercialInvoicefile.map((fileObj, index) => {
                  const url = createDataUrl(fileObj.file, fileObj.fileType);
                  return url ? (
                    <FilePreview
                      key={`invoice-${index}`}
                      label={`Commercial Invoice ${index + 1}`}
                      url={url}
                      onPreviewClick={onPreviewClick}
                    />
                  ) : null;
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- OtherFileSection Component ----------------
function OtherFileSection({
  file,
  type,
  onPreviewClick,
}: {
  file: OtherFile;
  type: FileType;
  onPreviewClick: (url: string, label: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  // Get consistent property names
  const tinNumber = file.tinNumber || file.tinNumebr || "N/A";
  const firstName = file.firstName || file.firstname || "N/A";
  const companyName = file.companyName || file.companyname || "Unknown Company";

  return (
    <div className="mb-4 border border-gray-200 rounded-lg bg-white shadow-xs">
      <div
        className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 className="font-semibold text-gray-800">
            {firstName} {file.lastname}
          </h3>
          <p className="text-xs text-gray-600">TIN: {tinNumber}</p>
          <p className="text-xs text-gray-600">Company: {companyName}</p>
        </div>
        <div className="flex items-center">
          {file.declartionNumber && (
            <div className="mr-4">
              {file.declartionNumber.map((decl, i) => (
                <span
                  key={i}
                  className="bg-gray-100 px-2 py-1 rounded text-xs mr-1"
                >
                  {decl.declarionNumberPerCampany}
                </span>
              ))}
            </div>
          )}
          <ChevronDown
            size={18}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {expanded && (
        <div className="p-3 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium mb-2">Main Receipts</p>
              {file.mainReceiptfile &&
                file.mainReceiptfile.map((fileObj, index) => {
                  const url = createDataUrl(fileObj.file, fileObj.fileType);
                  return url ? (
                    <FilePreview
                      key={`main-${index}`}
                      label={`Main Receipt ${index + 1}`}
                      url={url}
                      onPreviewClick={onPreviewClick}
                    />
                  ) : null;
                })}
            </div>
            <div>
              <p className="text-xs font-medium mb-2">Withholding Receipts</p>
              {file.withHoldihReceiptfile &&
                file.withHoldihReceiptfile.map((fileObj, index) => {
                  const url = createDataUrl(fileObj.file, fileObj.fileType);
                  return url ? (
                    <FilePreview
                      key={`withholding-${index}`}
                      label={`Withholding Receipt ${index + 1}`}
                      url={url}
                      onPreviewClick={onPreviewClick}
                    />
                  ) : null;
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- Main Component ----------------
export default function AllFilesFetcher() {
  const [warehouseFiles, setWarehouseFiles] = useState<OtherFile[]>([]);
  const [customFiles, setCustomFiles] = useState<CustomFile[]>([]);
  const [transportFiles, setTransportFiles] = useState<OtherFile[]>([]);
  const [clearanceFiles, setClearanceFiles] = useState<OtherFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    label: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get token and userId on client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
      setUserId(localStorage.getItem("userId"));
    }
  }, []);

  const handleOpenPreview = (url: string, label: string) => {
    setPreviewFile({ url, label });
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  const fetchAllFiles = async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Authorization token not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Make all API requests
      const requests = [
        axios.get(
          `${BASE_API_URL}/api/v1/accountant/WarehouseDisplay/${userId}`,
          {
            headers,
          }
        ),
        axios.get(
          `${BASE_API_URL}/api/v1/accountant/CustomDocument/${userId}`,
          { headers }
        ),
        axios.get(
          `${BASE_API_URL}/api/v1/accountant/TransportDisplay/${userId}`,
          {
            headers,
          }
        ),
        axios.get(
          `${BASE_API_URL}/api/v1/accountant/ClearanceDisplay/${userId}`,
          {
            headers,
          }
        ),
      ];

      const [warehouseRes, customRes, transportRes, clearanceRes] =
        await Promise.all(requests);

      // Log responses to debug
      console.log("Warehouse response:", warehouseRes.data);
      console.log("Custom response:", customRes.data);
      console.log("Transport response:", transportRes.data);
      console.log("Clearance response:", clearanceRes.data);

      // Handle different response structures
      const normalizeResponse = (response: any): any[] => {
        if (Array.isArray(response.data)) {
          return response.data;
        } else if (response.data && typeof response.data === "object") {
          return [response.data];
        }
        return [];
      };

      setWarehouseFiles(normalizeResponse(warehouseRes));
      setCustomFiles(normalizeResponse(customRes));
      setTransportFiles(normalizeResponse(transportRes));
      setClearanceFiles(normalizeResponse(clearanceRes));
    } catch (err: any) {
      console.error("API Error:", err);
      setError(err.response?.data?.message || "Failed to fetch files");
    } finally {
      setLoading(false);
    }
  };

  // Fetch files when token is available
  useEffect(() => {
    if (token) {
      fetchAllFiles();
    }
  }, [token, userId]);

  // Group files by company
  const groupedFiles = useMemo(() => {
    const allFiles = [
      ...warehouseFiles.map((f) => ({ ...f, type: "warehouse" as const })),
      ...customFiles.map((f) => ({ ...f, type: "custom" as const })),
      ...transportFiles.map((f) => ({ ...f, type: "transport" as const })),
      ...clearanceFiles.map((f) => ({ ...f, type: "clearance" as const })),
    ];

    return allFiles.reduce(
      (
        acc: Record<
          string,
          {
            warehouse: OtherFile[];
            custom: CustomFile[];
            transport: OtherFile[];
            clearance: OtherFile[];
          }
        >,
        file
      ) => {
        const companyName =
          file.companyName || file.companyname || "Unknown Company";

        if (!acc[companyName]) {
          acc[companyName] = {
            warehouse: [],
            custom: [],
            transport: [],
            clearance: [],
          };
        }

        switch (file.type) {
          case "warehouse":
            acc[companyName].warehouse.push(file);
            break;
          case "custom":
            acc[companyName].custom.push(file);
            break;
          case "transport":
            acc[companyName].transport.push(file);
            break;
          case "clearance":
            acc[companyName].clearance.push(file);
            break;
        }

        return acc;
      },
      {}
    );
  }, [warehouseFiles, customFiles, transportFiles, clearanceFiles]);

  // Rest of the component remains the same...
  // [Keep the loading, error, and preview file rendering logic from your original code]

  if (loading) {
    return (
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
        Loading documents...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-600 border border-red-300 bg-red-50 rounded-md mx-auto max-w-md mt-10">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  if (previewFile) {
    const isImage = previewFile.url.startsWith("data:image");
    const isPdf = previewFile.url.startsWith("data:application/pdf");

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
            <p className="text-red-600 text-center py-10">
              Unsupported format: {previewFile.label}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
          Receipt Management Dashboard
        </h1>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search by declaration number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="space-y-4">
          {Object.entries(groupedFiles).map(([companyName, files]) => (
            <CompanySection
              key={companyName}
              companyName={companyName}
              files={files}
              onPreviewClick={handleOpenPreview}
              searchTerm={searchTerm}
            />
          ))}

          {Object.keys(groupedFiles).length === 0 && (
            <div className="p-6 text-center text-gray-500">
              {searchTerm
                ? `No files found matching declaration number "${searchTerm}"`
                : "No files found"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
