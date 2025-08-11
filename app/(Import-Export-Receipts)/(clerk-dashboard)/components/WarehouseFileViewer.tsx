"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Download, X, Eye, ChevronDown, File, ArrowLeft } from "lucide-react";

// ---------------- Interfaces ----------------
interface RawWarehouseFile {
  userId: string;
  tinNumber: string;
  firstName: string;
  lastname: string;
  maintype: string;
  withHoldihType: string;
  companyName: string;
  imageBaseMainReceipt: string;
  imageBaseWithholidingReceipt: string;
}

interface UserDocument {
  userId: string;
  firstName: string;
  lastname: string;
  tinNumber: string;
  companyName: string;
  documents: DocumentFile[];
}

interface DocumentFile {
  label: string;
  base64Data: string;
}

const BASE_URL = "https://customreceiptmanagement.onrender.com";

// ---------------- Helper ----------------
const createDataUrl = (
  base64String: string | null | undefined,
  label: string
): string => {
  if (!base64String) return "";
  if (base64String.startsWith("data:")) return base64String;

  let mimeType = "image/jpeg";
  if (label.toLowerCase().includes("pdf")) {
    mimeType = "application/pdf";
  }

  return `data:${mimeType};base64,${base64String}`;
};

// ---------------- FilePreview ----------------
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
        isPdf ? "pdf" : "jpg"
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
          {isImage && (
            <img
              src={url}
              alt={label}
              className="w-full h-full object-contain"
            />
          )}
          {isPdf && (
            <p className="text-blue-600 text-center p-4 flex items-center gap-2">
              <File size={20} /> Click to view PDF
            </p>
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

// ---------------- Main Component ----------------
export default function WarehouseFileViewer() {
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [previewFile, setPreviewFile] = useState<{
    url: string;
    label: string;
  } | null>(null);

  const handleOpenPreview = (url: string, label: string) => {
    setPreviewFile({ url, label });
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const toggleExpand = (userId: string) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      newSet.has(userId) ? newSet.delete(userId) : newSet.add(userId);
      return newSet;
    });
  };

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found.");
          return;
        }

        const res = await axios.get<RawWarehouseFile[]>(
          `${BASE_URL}/api/v1/clerk/wareHousefileAll`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const grouped: Record<string, UserDocument> = {};

        res.data.forEach((item) => {
          const userId = item.userId;
          if (!grouped[userId]) {
            grouped[userId] = {
              userId,
              firstName: item.firstName,
              lastname: item.lastname,
              tinNumber: item.tinNumber,
              companyName: item.companyName,
              documents: [],
            };
          }

          if (item.imageBaseMainReceipt) {
            grouped[userId].documents.push({
              label: `${item.maintype} Receipt`,
              base64Data: createDataUrl(
                item.imageBaseMainReceipt,
                `${item.maintype} Receipt`
              ),
            });
          }

          if (item.imageBaseWithholidingReceipt) {
            grouped[userId].documents.push({
              label: `${item.withHoldihType} Withholding Receipt`,
              base64Data: createDataUrl(
                item.imageBaseWithholidingReceipt,
                `${item.withHoldihType} Withholding Receipt`
              ),
            });
          }
        });

        setUserDocuments(Object.values(grouped));
      } catch (err: any) {
        console.error("Error fetching warehouse files:", err);
        if (axios.isAxiosError(err) && err.response) {
          setError(
            `Failed to fetch: ${err.response.status} - ${
              err.response.data.message || err.response.statusText
            }`
          );
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  // -------------- Loading/Error State --------------
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

  // -------------- Preview View --------------
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
            <img
              src={previewFile.url}
              alt={previewFile.label}
              className="max-w-full max-h-full mx-auto object-contain"
            />
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

  // -------------- Main Render --------------
  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Warehouse File Viewer
      </h2>
      {userDocuments.length === 0 ? (
        <p className="text-center text-gray-600 text-lg py-10">
          No warehouse documents available.
        </p>
      ) : (
        userDocuments.map((user) => (
          <div
            key={user.userId}
            className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-100"
          >
            <button
              onClick={() => toggleExpand(user.userId)}
              className="w-full flex justify-between items-center text-left py-4 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {user.companyName}
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  (TIN: {user.tinNumber}) — {user.firstName} {user.lastname}
                </p>
              </div>
              <ChevronDown
                className={`text-gray-400 transition-transform duration-300 ${
                  expandedUsers.has(user.userId) ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedUsers.has(user.userId) && (
              <div className="pt-4 border-t mt-4">
                {user.documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                    {user.documents.map((doc, docIndex) => (
                      <FilePreview
                        key={docIndex}
                        label={doc.label}
                        url={doc.base64Data}
                        onPreviewClick={handleOpenPreview}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 italic text-center py-4">
                    No specific files uploaded for this user.
                  </p>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
