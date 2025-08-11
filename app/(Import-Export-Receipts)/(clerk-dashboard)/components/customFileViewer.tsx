"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaChevronDown } from "react-icons/fa";

interface DocumentFile {
  label: string;
  base64Data: string;
}

interface UserDocument {
  userId: string;
  firstname: string;
  lastname: string;
  tinNumebr: string;
  companyname: string;
  documents: DocumentFile[];
}

const BASE_URL = "https://customreceiptmanagement.onrender.com";

const createDataUrl = (
  base64String: string | null | undefined,
  label: string
): string => {
  if (!base64String) return "";

  if (base64String.startsWith("data:")) {
    return base64String;
  }

  let mimeType = "";
  if (
    label.toLowerCase().includes("image") ||
    label.toLowerCase().includes("custom file")
  ) {
    mimeType = "image/jpeg";
  } else if (
    label.toLowerCase().includes("permit") ||
    label.toLowerCase().includes("invoice") ||
    label.toLowerCase().includes("pdf")
  ) {
    mimeType = "application/pdf";
  } else {
    console.warn(
      `Unknown document type for label: "${label}". Defaulting to "application/octet-stream".`
    );
    mimeType = "application/octet-stream";
  }

  return `data:${mimeType};base64,${base64String}`;
};

function FilePreview({ label, url }: { label: string; url: string }) {
  if (!url) {
    return (
      <div className="bg-gray-100 p-4 rounded shadow flex flex-col">
        <h3 className="text-md font-semibold mb-2">{label}</h3>
        <p className="text-gray-500">No file available.</p>
      </div>
    );
  }

  const isImage = url.startsWith("data:image");
  const isPdf = url.startsWith("data:application/pdf");

  const handleDownload = () => {
    try {
      const parts = url.split(",");
      const meta = parts[0];
      const base64Content = parts[1]?.replace(/\s/g, "") || "";
      const mimeTypeMatch = meta.match(/^data:(.*?);/);
      const mimeType = mimeTypeMatch
        ? mimeTypeMatch[1]
        : "application/octet-stream";

      const binaryString = atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${label.replace(/[^a-zA-Z0-9]/g, "_")}.${
        mimeType.split("/")[1] || "file"
      }`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed.");
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded shadow flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold">{label}</h3>
        <button
          onClick={handleDownload}
          className="text-blue-600 hover:underline text-sm bg-blue-50 py-1 px-3 rounded"
        >
          Download
        </button>
      </div>

      {/* Preview Container */}
      <div className="max-h-64 max-w-full overflow-auto border rounded bg-white">
        {isImage ? (
          <img
            src={url}
            alt={label}
            className="max-h-60 w-full object-contain p-2"
          />
        ) : isPdf ? (
          <iframe
            src={url}
            className="w-full h-60"
            title={`Preview of ${label}`}
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <p className="text-red-500 text-sm text-center p-4">
            Cannot preview this file type.
          </p>
        )}
      </div>
    </div>
  );
}

export default function CustomFileViewer() {
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

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

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${BASE_URL}/api/v1/clerk/customfileAll`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const rawData = response.data;
        const grouped: Record<string, UserDocument> = {};

        rawData.forEach((item: any) => {
          const userId = item.userId;
          if (!grouped[userId]) {
            grouped[userId] = {
              userId,
              firstname: item.firstname,
              lastname: item.lastname,
              tinNumebr: item.tinNumebr,
              companyname: item.companyname,
              documents: [],
            };
          }

          if (item.imagebaseCustomfile) {
            grouped[userId].documents.push({
              label: "Custom File",
              base64Data: createDataUrl(
                item.imagebaseCustomfile,
                "Custom File"
              ),
            });
          }
          if (item.imagebaseBankPermitfile) {
            grouped[userId].documents.push({
              label: "Bank Permit File",
              base64Data: createDataUrl(
                item.imagebaseBankPermitfile,
                "Bank Permit File"
              ),
            });
          }
          if (item.imageCummercialInvoicefile) {
            grouped[userId].documents.push({
              label: "Commercial Invoice File",
              base64Data: createDataUrl(
                item.imageCummercialInvoicefile,
                "Commercial Invoice File"
              ),
            });
          }
        });

        setUserDocuments(Object.values(grouped));
      } catch (err) {
        console.error("Error fetching files:", err);
        if (axios.isAxiosError(err) && err.response) {
          setError(
            `Failed to fetch documents: ${err.response.status} - ${
              err.response.data.message || err.response.statusText
            }`
          );
        } else {
          setError("An unexpected error occurred while fetching documents.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-6 text-xl text-blue-600">
        Loading documents...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-600 border border-red-300 bg-red-50 rounded-md mx-auto max-w-md">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        User Document Viewer
      </h2>
      {userDocuments.length === 0 ? (
        <p className="text-center text-gray-600 text-lg py-10">
          No documents available for any user.
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
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {user.companyname}
                  </h3>
                  <span className="text-sm text-gray-500 font-medium">
                    (TIN: {user.tinNumebr})
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  User: {user.firstname} {user.lastname}
                </p>
              </div>
              <FaChevronDown
                className={`text-gray-400 transition-transform duration-300 ${
                  expandedUsers.has(user.userId) ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedUsers.has(user.userId) && (
              <div className="pt-4 border-t mt-4">
                {user.documents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 mt-6">
                    {user.documents.map((doc, docIndex) => (
                      <FilePreview
                        key={docIndex}
                        label={doc.label}
                        url={doc.base64Data}
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
