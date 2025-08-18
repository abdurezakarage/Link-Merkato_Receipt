"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Eye,
  Download,
  ChevronDown,
  ArrowLeft,
  File,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface TransportFile {
  userId: string;
  tinNumber: string;
  firstName: string;
  lastname: string;
  maintype: string;
  withHoldihType: string;
  companyName: string;
  imageBaseMainReceipt: string;
  imageBaseWithholidingReceipt: string;
  declarationnumber: string;
}

interface UserDocument {
  userId: string;
  firstName: string;
  lastname: string;
  tinNumber: string;
  companyName: string;
  declarationnumber: string;
  documents: DocumentFile[];
}

interface DocumentFile {
  label: string;
  base64Data: string;
  declarationnumber: string;
}

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
    const a = document.createElement("a");
    a.href = url;
    a.download = `${label.replace(/[^a-zA-Z0-9]/g, "_")}.${
      isPdf ? "pdf" : "jpg"
    }`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow flex flex-col">
      <h3 className="text-md font-semibold mb-2">{label}</h3>
      <div
        className="w-full h-48 rounded-lg cursor-pointer overflow-hidden flex items-center justify-center bg-gray-200"
        onClick={() => (isImage || isPdf) && onPreviewClick(url, label)}
      >
        {isImage && (
          <img src={url} alt={label} className="w-full h-full object-contain" />
        )}
        {isPdf && (
          <p className="text-blue-600 flex items-center gap-2">
            <File size={20} /> Click to view PDF
          </p>
        )}
        {!isImage && !isPdf && (
          <p className="text-red-500 text-center">No preview available</p>
        )}
      </div>
      <div className="flex justify-between mt-4 gap-2">
        {(isImage || isPdf) && (
          <button
            onClick={() => onPreviewClick(url, label)}
            className="flex-1 text-sm bg-purple-100 text-purple-600 px-4 py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-purple-200 transition"
          >
            <Eye size={16} />
            View
          </button>
        )}
        <button
          onClick={handleDownload}
          className="flex-1 text-sm bg-blue-100 text-blue-600 px-4 py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-blue-200 transition"
        >
          <Download size={16} />
          Download
        </button>
      </div>
    </div>
  );
}

export default function TransportFileViewer() {
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    label: string;
  } | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();

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

  const handleOpenPreview = (url: string, label: string) => {
    setPreviewFile({ url, label });
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  const toggleExpand = (userId: string) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const fetchTransportFiles = async (declarationnumber?: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found");
        setLoading(false);
        return;
      }

      let url = `${BASE_API_URL}/api/v1/clerk/TransportFileAll`;
      if (declarationnumber) {
        url = `${BASE_API_URL}/api/v1/clerk/TransportFileByDeclaration/${declarationnumber}`;
      }

      const res = await axios.get<TransportFile[]>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.length === 0) {
        setError(
          declarationnumber
            ? `No documents found for declaration number: ${declarationnumber}`
            : "No transport files available"
        );
        setUserDocuments([]);
        return;
      }

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
            declarationnumber: item.declarationnumber,
            documents: [],
          };
        }

        if (item.imageBaseMainReceipt) {
          grouped[userId].documents.push({
            label: `${item.maintype} Receipt`,
            base64Data: createDataUrl(item.imageBaseMainReceipt, "receipt"),
            declarationnumber: item.declarationnumber,
          });
        }

        if (item.imageBaseWithholidingReceipt) {
          grouped[userId].documents.push({
            label: `${item.withHoldihType} Withholding Receipt`,
            base64Data: createDataUrl(
              item.imageBaseWithholidingReceipt,
              "receipt"
            ),
            declarationnumber: item.declarationnumber,
          });
        }
      });

      setUserDocuments(Object.values(grouped));
      setError(null);
    } catch (err) {
      setError("Failed to fetch transport files");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportFiles();
  }, []);

  const handleSearch = () => {
    setLoading(true);
    fetchTransportFiles(searchInput);
  };

  const handleResetSearch = () => {
    setSearchInput("");
    setLoading(true);
    fetchTransportFiles();
  };

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
          <h2 className="text-xl font-semibold">{previewFile.label}</h2>
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
              title={`${previewFile.label} PDF`}
            />
          ) : (
            <p className="text-red-600 text-center py-10">
              Unsupported preview
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Transport Files
      </h2>

      {/* Search Bar */}
      <div className="mb-8 max-w-2xl mx-auto">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by declaration number"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
          {searchInput && (
            <button
              onClick={handleResetSearch}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-blue-600">Loading transport files...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : userDocuments.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No transport files found
        </div>
      ) : (
        userDocuments.map((user) => (
          <div
            key={`${user.userId}-${user.declarationnumber}`}
            className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-100"
          >
            <button
              onClick={() => toggleExpand(user.userId)}
              className="w-full flex justify-between items-center text-left py-4 px-4 hover:bg-gray-50 rounded-lg transition"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {user.companyName} ({user.tinNumber})
                </h3>
                <p className="text-gray-600 text-sm">
                  {user.firstName} {user.lastname}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Declaration: {user.declarationnumber}
                </p>
              </div>
              <ChevronDown
                className={`transition-transform ${
                  expandedUsers.has(user.userId) ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedUsers.has(user.userId) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                {user.documents.map((doc) => (
                  <FilePreview
                    key={`${user.userId}-${doc.label}-${doc.declarationnumber}`}
                    label={`${doc.label} (${doc.declarationnumber})`}
                    url={doc.base64Data}
                    onPreviewClick={handleOpenPreview}
                  />
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
