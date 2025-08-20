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
  ZoomIn,
  ZoomOut,
  RotateCw,
  Building,
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
  tinNumebr: string;
  firstname: string;
  lastname: string;
  companyname: string;
  imagebaseCustomfile: FileData[];
  imagebaseBankPermitfile: FileData[];
  imageCummercialInvoicefile: FileData[];
  declartionNumber?: DeclarationNumber[];
}

interface CompanyData {
  companyName: string;
  tinNumebr: string;
  imagebaseCustomfile: FileData[];
  imagebaseBankPermitfile: FileData[];
  imageCummercialInvoicefile: FileData[];
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

// ---------------- Enhanced Preview Modal Component ----------------
function EnhancedPreviewModal({
  file,
  onClose,
}: {
  file: { url: string; label: string };
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const isImage = file.url.startsWith("data:image");
  const isPdf = file.url.startsWith("data:application/pdf");

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    try {
      const a = document.createElement("a");
      a.href = file.url;
      a.download = `${file.label.replace(/[^a-zA-Z0-9]/g, "_")}.${
        isPdf ? "pdf" : file.url.split(";")[0].split("/")[1] || "file"
      }`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-") handleZoomOut();
      if (e.key === "r") handleRotate();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header with controls */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-70 text-white">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-semibold truncate max-w-md">
            {file.label}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {isImage && (
            <>
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                disabled={zoom <= 0.5}
              >
                <ZoomOut size={20} />
              </button>
              <span className="text-sm">{Math.round(zoom * 100)}%</span>
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                disabled={zoom >= 3}
              >
                <ZoomIn size={20} />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                <RotateCw size={20} />
              </button>
            </>
          )}
          <button
            onClick={handleDownload}
            className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-2"
          >
            <Download size={18} /> Download
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {isImage ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={file.url}
              alt={file.label}
              fill
              className="object-contain"
              unoptimized={true}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: "transform 0.2s ease",
              }}
            />
          </div>
        ) : isPdf ? (
          <iframe
            src={file.url}
            className="w-full h-full border-none"
            title={`${file.label} Preview`}
          />
        ) : (
          <div className="text-center text-white">
            <p className="text-2xl mb-4">Unsupported file format</p>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-2 mx-auto"
            >
              <Download size={18} /> Download Anyway
            </button>
          </div>
        )}
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

    // Check if company name matches
    const hasMatchingCompanyName = company.companyName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Check if TIN number matches
    const hasMatchingTin = company.tinNumebr
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    return hasMatchingDeclaration || hasMatchingCompanyName || hasMatchingTin;
  }, [company, searchTerm]);

  // Don't render if there's a search term and no matches
  if (!hasMatchingFiles) return null;

  // Count total files for this company
  const totalFiles =
    company.imagebaseCustomfile.length +
    company.imagebaseBankPermitfile.length +
    company.imageCummercialInvoicefile.length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center text-left"
      >
        <div className="flex-1 flex items-center gap-3">
          <Building className="text-gray-400" size={24} />
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {company.companyName || "Unnamed Company"}
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              TIN: {company.tinNumebr || "N/A"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {company.declartionNumber && company.declartionNumber.length > 0 && (
            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
              {company.declartionNumber.length} declaration(s)
            </div>
          )}
          <div className="text-sm text-gray-600 bg-green-50 px-3 py-1 rounded-full">
            {totalFiles} file(s)
          </div>
          <ChevronDown
            className={`text-gray-400 transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
            size={24}
          />
        </div>
      </button>

      {expanded && (
        <div className="mt-6 space-y-6">
          {/* Declaration Numbers */}
          {company.declartionNumber && company.declartionNumber.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-3 text-gray-700">
                Declaration Numbers
              </h4>
              <div className="flex flex-wrap gap-2">
                {company.declartionNumber.map((declaration, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {declaration.declarionNumberPerCampany || "N/A"}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Custom Files */}
          {company.imagebaseCustomfile.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-3 text-gray-700">
                Custom Files
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {company.imagebaseCustomfile.map((file, index) => {
                  const url = createDataUrl(file.file, file.fileType);
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
            </div>
          )}

          {/* Bank Permit Files */}
          {company.imagebaseBankPermitfile.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-3 text-gray-700">
                Bank Permit Files
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {company.imagebaseBankPermitfile.map((file, index) => {
                  const url = createDataUrl(file.file, file.fileType);
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
            </div>
          )}

          {/* Commercial Invoice Files */}
          {company.imageCummercialInvoicefile.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-3 text-gray-700">
                Commercial Invoice Files
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {company.imageCummercialInvoicefile.map((file, index) => {
                  const url = createDataUrl(file.file, file.fileType);
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
          )}

          {/* Show message if no files in this company */}
          {totalFiles === 0 && (
            <p className="text-gray-500 italic text-center py-4">
              No files available for this company.
            </p>
          )}
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
  const [allExpanded, setAllExpanded] = useState(true);

  const handleOpenPreview = (url: string, label: string) => {
    setPreviewFile({ url, label });
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  // Group data by company
  const companiesData = useMemo(() => {
    if (!userData) return [];

    // Create company data from user data
    const company: CompanyData = {
      companyName: userData.companyname,
      tinNumebr: userData.tinNumebr,
      imagebaseCustomfile: userData.imagebaseCustomfile,
      imagebaseBankPermitfile: userData.imagebaseBankPermitfile,
      imageCummercialInvoicefile: userData.imageCummercialInvoicefile,
      declartionNumber: userData.declartionNumber,
    };

    return [company];
  }, [userData]);

  // Toggle all companies expanded/collapsed
  const toggleAllExpanded = () => {
    setAllExpanded(!allExpanded);
  };

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
          `${BASE_API_URL}/api/v1/clerk/CustomDocument/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setUserData(res.data);
        console.log("this is", res);
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

      {/* Search Bar and Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by company, TIN, or declaration number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={toggleAllExpanded}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium flex items-center gap-2"
        >
          {allExpanded ? (
            <>
              <ChevronDown size={18} className="rotate-180" />
              Collapse All
            </>
          ) : (
            <>
              <ChevronDown size={18} />
              Expand All
            </>
          )}
        </button>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          User Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 font-semibold">Name:</p>
            <p className="text-gray-800">
              {userData.firstname || "N/A"} {userData.lastname || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-600 font-semibold">Company:</p>
            <p className="text-gray-800">{userData.companyname || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600 font-semibold">TIN Number:</p>
            <p className="text-gray-800">{userData.tinNumebr || "N/A"}</p>
          </div>
        </div>
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

      {/* Enhanced Preview Modal */}
      {previewFile && (
        <EnhancedPreviewModal file={previewFile} onClose={handleClosePreview} />
      )}
    </div>
  );
}
