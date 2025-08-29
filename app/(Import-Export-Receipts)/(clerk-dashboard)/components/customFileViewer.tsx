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

interface UserData {
  userId: string;
  tinNumber?: string;
  firstName?: string;
  lastname?: string;
  mainReceiptfile?: FileData[];
  withHoldihReceiptfile?: FileData[];
  companyName?: string;
  declartionNumber?: DeclarationNumber[];
}

interface CompanyData {
  companyName: string;
  tinNumber?: string;
  mainReceiptfile?: FileData[];
  withHoldihReceiptfile?: FileData[];
  declartionNumber?: DeclarationNumber[];
}

// ---------------- Helper Functions ----------------
const createDataUrl = (
  base64String: string | null | undefined,
  fileType: string
): string => {
  if (!base64String) return "";

  // If already a data URL, return as-is
  if (base64String.startsWith("data:")) {
    return base64String;
  }

  // Determine MIME type based on fileType
  let mimeType = "application/octet-stream"; // default
  if (fileType.toLowerCase().includes("pdf")) {
    mimeType = "application/pdf";
  } else if (fileType.match(/jpeg|jpg|png|gif|webp/i)) {
    mimeType = `image/${fileType.toLowerCase()}`;
  }

  // Clean the base64 string (remove existing prefixes or whitespace)
  const cleanedBase64 = base64String
    .replace(/^data:image\/\w+;base64,/, "")
    .replace(/\s/g, "");

  // Validate base64
  try {
    // This will throw if invalid base64
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
  company,
  onPreviewClick,
  searchTerm,
}: {
  company: CompanyData;
  onPreviewClick: (url: string, label: string) => void;
  searchTerm: string;
}) {
  const [expanded, setExpanded] = useState(false);

  // Check if this company has files that match the search term
  const hasMatchingFiles = useMemo(() => {
    if (!searchTerm) return true;

    // Check if any declaration number matches
    const hasMatchingDeclaration = company.declartionNumber?.some((decl) =>
      decl.declarionNumberPerCampany
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    return hasMatchingDeclaration;
  }, [company.declartionNumber, searchTerm]);

  // Don't render if there's a search term and no matches
  if (!hasMatchingFiles) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center text-left"
      >
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">
            {company.companyName || "Unnamed Company"}
          </h3>
          <p className="text-sm text-gray-500 font-medium">
            TIN: {company.tinNumber || "N/A"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {company.declartionNumber && company.declartionNumber.length > 0 && (
            <div className="text-sm text-gray-600">
              {company.declartionNumber.length} declaration(s)
            </div>
          )}
          <ChevronDown
            className={`text-gray-400 transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {expanded && (
        <div className="mt-6">
          {/* Declaration Numbers */}
          {company.declartionNumber && company.declartionNumber.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">
                Declaration Numbers
              </h4>
              <div className="flex flex-wrap gap-2">
                {company.declartionNumber.map((declaration, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {declaration.declarionNumberPerCampany || "N/A"}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Main Receipt Files */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Main Receipt Files</h4>
            {company.mainReceiptfile?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {company.mainReceiptfile.map((file, index) => {
                  const url = createDataUrl(file.file, file.fileType);
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
            ) : (
              <p className="text-gray-600 italic text-center py-4">
                No main receipt files available
              </p>
            )}
          </div>

          {/* Withholding Receipt Files */}
          <div>
            <h4 className="text-lg font-semibold mb-3">
              Withholding Receipt Files
            </h4>
            {company.withHoldihReceiptfile?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {company.withHoldihReceiptfile.map((file, index) => {
                  const url = createDataUrl(file.file, file.fileType);
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
            ) : (
              <p className="text-gray-600 italic text-center py-4">
                No withholding receipt files available
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- Main Component ----------------
export default function WarehouseFileViewer() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    label: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenPreview = (url: string, label: string) => {
    setPreviewFile({ url, label });
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  // Group data by company
  const companiesData = useMemo(() => {
    if (!userData) return [];

    // If the user data has company info, use it directly
    if (userData.companyName) {
      return [
        {
          companyName: userData.companyName,
          tinNumber: userData.tinNumber,
          mainReceiptfile: userData.mainReceiptfile,
          withHoldihReceiptfile: userData.withHoldihReceiptfile,
          declartionNumber: userData.declartionNumber,
        },
      ];
    }

    // In case of multiple companies in the future, you can add logic here
    return [];
  }, [userData]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token) throw new Error("No authentication token found");
        if (!userId) throw new Error("No user ID provided");

        const res = await axios.get<UserData>(
          `${BASE_API_URL}/api/v1/clerk/WarehouseDisplay/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setUserData(res.data);
      } catch (err: any) {
        console.error("Error fetching warehouse files:", err);
        if (axios.isAxiosError(err) && err.response) {
          setError(
            `Failed to fetch: ${err.response.status} - ${
              err.response.data.message || err.response.statusText
            }`
          );
        } else {
          setError(
            err instanceof Error ? err.message : "An unexpected error occurred"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (!userData) {
    return (
      <p className="text-center text-gray-600 text-lg py-10">
        No warehouse documents available.
      </p>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        User Documents
      </h2>

      {/* Search Bar */}
      <div className="mb-6 max-w-md mx-auto">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by declaration number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          User Information
        </h3>
        <p className="text-gray-600">
          {userData.firstName || "N/A"} {userData.lastname || "N/A"}
        </p>
      </div>

      {/* Companies List */}
      {companiesData.length > 0 ? (
        companiesData.map((company, index) => (
          <CompanySection
            key={index}
            company={company}
            onPreviewClick={handleOpenPreview}
            searchTerm={searchTerm}
          />
        ))
      ) : (
        <p className="text-center text-gray-600 text-lg py-10">
          No company data available.
        </p>
      )}
    </div>
  );
}
