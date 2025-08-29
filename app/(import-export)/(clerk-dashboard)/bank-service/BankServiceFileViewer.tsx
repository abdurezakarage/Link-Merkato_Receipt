"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Eye, Download, ChevronDown, ArrowLeft, File } from "lucide-react";
import Image from "next/image";
import { BASE_API_URL } from "@/app/(Import-Export-Receipts)/import-api/ImportApi";

interface RawBankPermitFile {
  userId: string;
  tinNumebr: string;
  firstname: string;
  lastname: string;
  companyname: string;
  imagebaseBankPermitfile: string;
  fileType?: string; // Add file type information
}

interface UserDocument {
  userId: string;
  firstname: string;
  lastname: string;
  tinNumebr: string;
  companyname: string;
  bankPermitUrl: string;
  fileType: string; // Track file type for proper handling
}

function createDataUrl(
  base64String: string | null | undefined,
  fileType: string = "pdf" // Accept file type parameter
): string {
  if (!base64String) return "";
  if (base64String.startsWith("data:")) return base64String;

  // Determine MIME type based on fileType
  let mimeType = "application/octet-stream";
  if (fileType.toLowerCase().includes("pdf")) {
    mimeType = "application/pdf";
  } else if (fileType.match(/jpeg|jpg/i)) {
    mimeType = "image/jpeg";
  } else if (fileType.match(/png/i)) {
    mimeType = "image/png";
  } else if (fileType.match(/gif/i)) {
    mimeType = "image/gif";
  } else if (fileType.match(/webp/i)) {
    mimeType = "image/webp";
  }
  // Add more file types as needed

  // Clean the base64 string (remove existing prefixes or whitespace)
  const cleanedBase64 = base64String
    .replace(/^data:image\/\w+;base64,/, "")
    .replace(/\s/g, "");

  return `data:${mimeType};base64,${cleanedBase64}`;
}

function BankPermitCard({
  user,
  onPreviewClick,
}: {
  user: UserDocument;
  onPreviewClick: (url: string, companyName: string, fileType: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasBankPermit = !!user.bankPermitUrl;
  const isPdf = user.fileType.toLowerCase().includes("pdf");
  const isImage = user.fileType.match(/jpeg|jpg|png|gif|webp/i);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDownload = () => {
    if (user.bankPermitUrl) {
      const a = document.createElement("a");
      a.href = user.bankPermitUrl;

      // Determine file extension based on actual file type
      let extension = "file";
      if (isPdf) extension = "pdf";
      else if (user.fileType.match(/jpeg|jpg/i)) extension = "jpg";
      else if (user.fileType.match(/png/i)) extension = "png";
      else if (user.fileType.match(/gif/i)) extension = "gif";
      else if (user.fileType.match(/webp/i)) extension = "webp";

      a.download = `Bank_Permit_${user.tinNumebr}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <button
        onClick={toggleExpand}
        className="w-full flex justify-between items-center p-6 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <div className="text-left">
          <h3 className="text-lg font-bold text-gray-800">
            {user.companyname}
          </h3>
          <p className="text-gray-600 text-sm">
            {user.firstname} {user.lastname} (TIN: {user.tinNumebr})
          </p>
          <p className="text-gray-500 text-xs mt-1">
            File type: {user.fileType || "unknown"}
          </p>
        </div>
        <ChevronDown
          size={24}
          className={`text-gray-600 transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="p-6 pt-0 border-t border-gray-200">
          <div className="bg-gray-50 p-4 rounded-md mt-4">
            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <File className="text-blue-500" size={18} />
              Bank Permit Document
            </h4>

            {hasBankPermit ? (
              <>
                <div
                  className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() =>
                    onPreviewClick(
                      user.bankPermitUrl,
                      user.companyname,
                      user.fileType
                    )
                  }
                >
                  {isPdf ? (
                    <div className="text-center p-4">
                      <File size={48} className="mx-auto text-blue-500 mb-2" />
                      <p className="text-blue-600 font-medium">
                        Click to preview PDF
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {`${user.companyname}'s Bank Permit`}
                      </p>
                    </div>
                  ) : isImage ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={user.bankPermitUrl}
                        alt="Bank Permit"
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
                  ) : (
                    <div className="text-center p-4">
                      <File size={48} className="mx-auto text-gray-500 mb-2" />
                      <p className="text-gray-600 font-medium">
                        Unknown file format
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Type: {user.fileType}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() =>
                      onPreviewClick(
                        user.bankPermitUrl,
                        user.companyname,
                        user.fileType
                      )
                    }
                    className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 px-4 rounded-md flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Eye size={16} />
                    Preview
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 py-2 px-4 rounded-md flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </>
            ) : (
              <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">No Bank Permit available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BankPermitViewer() {
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    companyName: string;
    fileType: string;
  } | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in.");
          setLoading(false);
          return;
        }

        const res = await axios.get<RawBankPermitFile[]>(
          `${BASE_API_URL}/api/v1/clerk/customfileAll`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Create a map to group by tinNumber
        const groupedByTin = new Map<string, UserDocument>();

        res.data.forEach((item) => {
          // Use tinNumber as the key
          if (!groupedByTin.has(item.tinNumebr)) {
            // Try to detect file type if not provided
            let fileType = item.fileType || "pdf"; // Default to PDF if not specified

            // Simple detection based on base64 content (fallback)
            if (!item.fileType && item.imagebaseBankPermitfile) {
              if (
                item.imagebaseBankPermitfile.startsWith("/9j/") ||
                item.imagebaseBankPermitfile.startsWith("iVBORw")
              ) {
                fileType = "jpg"; // JPEG or PNG
              }
            }

            groupedByTin.set(item.tinNumebr, {
              userId: item.userId,
              firstname: item.firstname,
              lastname: item.lastname,
              tinNumebr: item.tinNumebr,
              companyname: item.companyname,
              bankPermitUrl: createDataUrl(
                item.imagebaseBankPermitfile,
                fileType
              ),
              fileType: fileType,
            });
          }
        });

        // Convert map values to array
        setUserDocuments(Array.from(groupedByTin.values()));
      } catch (err) {
        setError("Failed to fetch bank permits. Please try again later.");
        console.error("Error fetching bank permits:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleOpenPreview = (
    url: string,
    companyName: string,
    fileType: string
  ) => {
    setPreviewFile({ url, companyName, fileType });
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
        <p className="font-semibold mb-2">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  if (previewFile) {
    const isPdf = previewFile.fileType.toLowerCase().includes("pdf");
    const isImage = previewFile.fileType.match(/jpeg|jpg|png|gif|webp/i);

    return (
      <div className="p-4 bg-gray-100 min-h-screen flex justify-center items-start">
        <div className="w-full max-w-4xl">
          <button
            onClick={handleClosePreview}
            className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            Back to all permits
          </button>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {`${previewFile.companyName}'s Bank Permit`}
              </h2>
              <p className="text-sm text-gray-600">
                File type: {previewFile.fileType}
              </p>
            </div>
            <div className="h-[calc(100vh-200px)] flex items-center justify-center">
              {isPdf ? (
                <iframe
                  src={previewFile.url}
                  className="w-full h-full"
                  title="Bank Permit PDF Viewer"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              ) : isImage ? (
                <div className="relative w-full h-full">
                  <Image
                    src={previewFile.url}
                    alt="Bank Permit"
                    fill
                    className="object-contain"
                    unoptimized={true}
                  />
                </div>
              ) : (
                <div className="text-center p-8">
                  <File size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Unsupported file format</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Type: {previewFile.fileType}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen flex justify-center items-start">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Bank Permit Documents
        </h1>
        {userDocuments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-200">
            <p className="text-gray-600">No bank permit documents available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {userDocuments.map((user) => (
              <BankPermitCard
                key={user.tinNumebr}
                user={user}
                onPreviewClick={handleOpenPreview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
