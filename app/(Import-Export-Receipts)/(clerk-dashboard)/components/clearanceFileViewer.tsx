"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Eye, Download, ChevronDown, ArrowLeft, File } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface RawClearanceFile {
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

function createDataUrl(
  base64String: string | null | undefined,
  label: string
): string {
  if (!base64String) return "";
  if (base64String.startsWith("data:")) return base64String;

  let mimeType = "image/jpeg";
  if (label.toLowerCase().includes("pdf")) {
    mimeType = "application/pdf";
  }

  return `data:${mimeType};base64,${base64String}`;
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
    <div className="bg-gray-100 p-4 rounded shadow flex flex-col">
      <h3 className="text-md font-semibold mb-2">{label}</h3>
      <div
        className="w-full h-48 rounded cursor-pointer overflow-hidden flex items-center justify-center bg-gray-200"
        onClick={() => (isImage || isPdf) && onPreviewClick(url, label)}
      >
        {isImage && (
          <Image
            src={url}
            alt={label}
            width={500}
            height={300}
            className="w-full h-full object-contain"
          />
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
            className="flex-1 text-sm bg-purple-100 text-purple-600 px-4 py-2 rounded flex items-center justify-center gap-1"
          >
            <Eye size={16} />
            View
          </button>
        )}
        <button
          onClick={handleDownload}
          className="flex-1 text-sm bg-blue-100 text-blue-600 px-4 py-2 rounded flex items-center justify-center gap-1"
        >
          <Download size={16} />
          Download
        </button>
      </div>
    </div>
  );
}

export default function ClearanceFileViewer() {
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    label: string;
  } | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const router = useRouter();

  const handleOpenPreview = (url: string, label: string) => {
    setPreviewFile({ url, label });
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  const toggleExpand = (tinNumber: string) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tinNumber)) {
        newSet.delete(tinNumber);
      } else {
        newSet.add(tinNumber);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found");
          setLoading(false);
          return;
        }

        const res = await axios.get<RawClearanceFile[]>(
          `${BASE_API_URL}/api/v1/clerk/ClearanceFileAll`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const grouped: Record<string, UserDocument> = {};

        res.data.forEach((item) => {
          const key = item.tinNumber; // Using tinNumber as the key

          if (!grouped[key]) {
            grouped[key] = {
              userId: item.userId,
              firstName: item.firstName,
              lastname: item.lastname,
              tinNumber: item.tinNumber,
              companyName: item.companyName,
              documents: [],
            };
          }

          if (item.imageBaseMainReceipt) {
            grouped[key].documents.push({
              label: `${item.maintype} Receipt`,
              base64Data: createDataUrl(item.imageBaseMainReceipt, "receipt"),
            });
          }

          if (item.imageBaseWithholidingReceipt) {
            grouped[key].documents.push({
              label: `${item.withHoldihType} Withholding Receipt`,
              base64Data: createDataUrl(
                item.imageBaseWithholidingReceipt,
                "receipt"
              ),
            });
          }
        });

        setUserDocuments(Object.values(grouped));
      } catch (err) {
        setError("Failed to fetch clearance files");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="p-6 text-center text-blue-600">
        Loading clearance files...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  if (previewFile) {
    const isImage = previewFile.url.startsWith("data:image");
    const isPdf = previewFile.url.startsWith("data:application/pdf");

    return (
      <div className="p-4 bg-white rounded shadow-lg h-full flex flex-col">
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
            <Image
              src={previewFile.url}
              alt={previewFile.label}
              width={800}
              height={600}
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
        Clearance Files
      </h2>
      {userDocuments.length === 0 ? (
        <p className="text-center text-gray-600">No documents available.</p>
      ) : (
        userDocuments.map((user) => (
          <div
            key={user.tinNumber} // Using tinNumber as the key
            className="bg-white rounded shadow p-6 mb-6 border border-gray-100"
          >
            <button
              onClick={() => toggleExpand(user.tinNumber)} // Using tinNumber here
              className="w-full flex justify-between items-center text-left py-4 px-4 hover:bg-gray-50 rounded transition"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {user.companyName} ({user.tinNumber})
                </h3>
                <p className="text-gray-600 text-sm">
                  User: {user.firstName} {user.lastname}
                </p>
              </div>
              <ChevronDown
                className={`transition-transform ${
                  expandedUsers.has(user.tinNumber) ? "rotate-180" : "" // Using tinNumber here
                }`}
              />
            </button>
            {expandedUsers.has(user.tinNumber) && ( // Using tinNumber here
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                {user.documents.map((doc, i) => (
                  <FilePreview
                    key={i}
                    label={doc.label}
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
