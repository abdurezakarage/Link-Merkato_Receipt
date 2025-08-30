"use client";
import { useState } from "react";
import { Download, Eye, File, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { BASE_API_URL_local } from "../../import-api/ImportApi";

interface WarehouseDocument {
  file: string;
  filename: string;
  content_type: string;
}

interface WarehouseViewerProps {
  warehouseDocument?: WarehouseDocument;
  declarationNumber?: string;
}

export default function WarehouseViewer({ 
  warehouseDocument, 
  declarationNumber 
}: WarehouseViewerProps) {
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

  const createDataUrl = (filePath: string, contentType: string): string => {
    if (!filePath) return "";
    
    // If it's already a data URL, return as-is
    if (filePath.startsWith("data:")) {
      return filePath;
    }

    // For file paths, construct the full URL
    const baseUrl = BASE_API_URL_local.replace('/api', '');
    return `${baseUrl}${filePath}`;
  };

  const handleDownload = (url: string, filename: string) => {
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  if (previewFile) {
    const isImage = previewFile.url.startsWith("data:image") || 
                   previewFile.url.includes("image/");
    const isPdf = previewFile.url.startsWith("data:application/pdf") || 
                  previewFile.url.includes("application/pdf");

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

  if (!warehouseDocument) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <File size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg">
            {declarationNumber 
              ? `No warehouse document found for declaration number: ${declarationNumber}`
              : "Enter a declaration number to view warehouse documents"
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          Document Viewer
        </h1>
        <p className="text-lg text-center text-gray-600">
          View and download warehouse documents
        </p>
      </div>

      {declarationNumber && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Declaration Number: {declarationNumber}
          </h3>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
        <h4 className="text-lg font-semibold mb-4">Document Details</h4>
        
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
    </div>
  );
}
