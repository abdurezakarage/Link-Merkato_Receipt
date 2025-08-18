"use client";
const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

import { useState, useEffect } from "react";
import axios from "axios";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  File,
  Search,
} from "lucide-react";

interface DeclarationNumber {
  declarionNumberPerCampany: string;
}

interface BaseFile {
  userId: string;
  tinNumber: string;
  firstName: string;
  lastname: string;
  companyName?: string;
  companyname?: string;
  declartionNumber?: DeclarationNumber[];
  imageBaseMainReceipt?: string;
  imageBaseWithholidingReceipt?: string;
  imagebaseCustomfile?: string;
  imagebaseBankPermitfile?: string;
  imageCummercialInvoicefile?: string;
  maintype?: string;
  withHoldihType?: string;
  bankfiletype?: string;
  cutomfileType?: string;
  commerciailInvoicefiltype?: string;
}

interface WarehouseFile extends BaseFile {
  maintype: string;
  withHoldihType: string;
  companyName: string;
  imageBaseMainReceipt: string;
  imageBaseWithholidingReceipt: string;
}

interface CustomFile extends BaseFile {
  companyname: string;
  imagebaseCustomfile: string;
  imagebaseBankPermitfile: string;
  imageCummercialInvoicefile: string;
  bankfiletype: string;
  cutomfileType: string;
  commerciailInvoicefiltype: string;
}

interface TransportFile extends BaseFile {
  maintype: string;
  withHoldihType: string;
  companyName: string;
  imageBaseMainReceipt: string;
  imageBaseWithholidingReceipt: string;
}

interface ClearanceFile extends BaseFile {
  maintype: string;
  withHoldihType: string;
  companyName: string;
  imageBaseMainReceipt: string;
  imageBaseWithholidingReceipt: string;
}

type FileType = "warehouse" | "custom" | "transport" | "clearance";

interface GroupedFiles {
  warehouse: (WarehouseFile & { type: "warehouse" })[];
  custom: (CustomFile & { type: "custom" })[];
  transport: (TransportFile & { type: "transport" })[];
  clearance: (ClearanceFile & { type: "clearance" })[];
}

export default function AllFilesFetcher() {
  const [warehouseFiles, setWarehouseFiles] = useState<WarehouseFile[]>([]);
  const [customFiles, setCustomFiles] = useState<CustomFile[]>([]);
  const [transportFiles, setTransportFiles] = useState<TransportFile[]>([]);
  const [clearanceFiles, setClearanceFiles] = useState<ClearanceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCompanies, setExpandedCompanies] = useState<
    Record<string, boolean>
  >({});
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>(
    {}
  );
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const fetchAllFiles = async () => {
    setLoading(true);
    setError(null);
    const token = getToken();

    if (!token) {
      setError("Authorization token not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [warehouseRes, customRes, transportRes, clearanceRes] =
        await Promise.all([
          axios.get<WarehouseFile[]>(
            `${BASE_API_URL}/api/v1/accountant/wareHousefile`,
            { headers }
          ),
          axios.get<CustomFile[]>(
            `${BASE_API_URL}/api/v1/accountant/customfill`,
            {
              headers,
            }
          ),
          axios.get<TransportFile[]>(
            `${BASE_API_URL}/api/v1/accountant/TransportFile`,
            { headers }
          ),
          axios.get<ClearanceFile[]>(
            `${BASE_API_URL}/api/v1/accountant/ClearanceFile`,
            { headers }
          ),
        ]);

      setWarehouseFiles(warehouseRes.data);
      setCustomFiles(customRes.data);
      setTransportFiles(transportRes.data);
      setClearanceFiles(clearanceRes.data);

      // Initialize expanded states
      const allCompanies = [
        ...warehouseRes.data.map((f) => f.companyName),
        ...customRes.data.map((f) => f.companyname),
        ...transportRes.data.map((f) => f.companyName),
        ...clearanceRes.data.map((f) => f.companyName),
      ].filter(Boolean);

      const uniqueCompanies = [...new Set(allCompanies)];
      setExpandedCompanies(
        uniqueCompanies.reduce(
          (acc, company) => ({ ...acc, [company as string]: false }),
          {}
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch files");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFiles();
  }, []);

  const toggleCompany = (companyName: string) => {
    setExpandedCompanies((prev) => ({
      ...prev,
      [companyName]: !prev[companyName],
    }));
  };

  const toggleFile = (fileId: string) => {
    setExpandedFiles((prev) => ({
      ...prev,
      [fileId]: !prev[fileId],
    }));
  };

  const openPreview = (base64String: string, altText: string) => {
    if (!base64String) return;
    setPreviewImage({
      src: `data:image/jpeg;base64,${base64String}`,
      alt: altText,
    });
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  const renderImagePreview = (base64String: string, altText: string) => {
    if (!base64String)
      return (
        <div className="flex items-center text-gray-500 text-sm">
          <File className="w-4 h-4 mr-1" />
          No image
        </div>
      );

    return (
      <div className="mt-2">
        <div className="flex space-x-2">
          <button
            onClick={() => openPreview(base64String, altText)}
            className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <a
            href={`data:image/jpeg;base64,${base64String}`}
            download={`${altText}-${Date.now()}.jpg`}
            className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  };

  const renderFileDetails = (file: BaseFile, type: FileType) => {
    const fileId = `${type}-${file.userId}-${file.tinNumber}`;
    const isExpanded = expandedFiles[fileId] || false;

    return (
      <div
        key={fileId}
        className="mb-4 border border-gray-200 rounded-lg bg-white shadow-xs"
      >
        <div
          className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
          onClick={() => toggleFile(fileId)}
        >
          <div>
            <h3 className="font-semibold text-gray-800">
              {file.firstName || (file as any).firstname} {file.lastname}
            </h3>
            <p className="text-xs text-gray-600">
              TIN: {file.tinNumber || (file as any).tinNumebr}
            </p>
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
              className={`transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {isExpanded && (
          <div className="p-3 border-t">
            {type === "warehouse" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium">
                    Main Receipt ({(file as WarehouseFile).maintype})
                  </p>
                  {renderImagePreview(
                    (file as WarehouseFile).imageBaseMainReceipt,
                    "Main-Receipt"
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium">
                    Withholding Receipt (
                    {(file as WarehouseFile).withHoldihType})
                  </p>
                  {renderImagePreview(
                    (file as WarehouseFile).imageBaseWithholidingReceipt,
                    "Withholding-Receipt"
                  )}
                </div>
              </div>
            )}

            {type === "custom" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs font-medium">
                    Custom File ({(file as CustomFile).cutomfileType})
                  </p>
                  {renderImagePreview(
                    (file as CustomFile).imagebaseCustomfile,
                    "Custom-File"
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium">
                    Bank Permit ({(file as CustomFile).bankfiletype})
                  </p>
                  {renderImagePreview(
                    (file as CustomFile).imagebaseBankPermitfile,
                    "Bank-Permit"
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium">
                    Commercial Invoice (
                    {(file as CustomFile).commerciailInvoicefiltype})
                  </p>
                  {renderImagePreview(
                    (file as CustomFile).imageCummercialInvoicefile,
                    "Commercial-Invoice"
                  )}
                </div>
              </div>
            )}

            {(type === "transport" || type === "clearance") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium">
                    Main Receipt (
                    {(file as TransportFile | ClearanceFile).maintype})
                  </p>
                  {renderImagePreview(
                    (file as TransportFile | ClearanceFile)
                      .imageBaseMainReceipt,
                    "Main-Receipt"
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium">
                    Withholding Receipt (
                    {(file as TransportFile | ClearanceFile).withHoldihType})
                  </p>
                  {renderImagePreview(
                    (file as TransportFile | ClearanceFile)
                      .imageBaseWithholidingReceipt,
                    "Withholding-Receipt"
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const groupFilesByCompany = () => {
    const allFiles = [
      ...warehouseFiles.map((f) => ({ ...f, type: "warehouse" as const })),
      ...customFiles.map((f) => ({
        ...f,
        type: "custom" as const,
        companyName: f.companyname,
      })),
      ...transportFiles.map((f) => ({ ...f, type: "transport" as const })),
      ...clearanceFiles.map((f) => ({ ...f, type: "clearance" as const })),
    ];

    return allFiles.reduce((acc: Record<string, GroupedFiles>, file) => {
      const companyName = file.companyName || "Unknown Company";

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
    }, {});
  };

  const filterFilesByDeclaration = (
    groupedFiles: ReturnType<typeof groupFilesByCompany>
  ) => {
    if (!searchTerm.trim()) return groupedFiles;

    const filtered: Record<string, GroupedFiles> = {};

    for (const [companyName, files] of Object.entries(groupedFiles)) {
      const filteredFiles: GroupedFiles = {
        warehouse: files.warehouse.filter((file) =>
          file.declartionNumber?.some((decl) =>
            decl.declarionNumberPerCampany
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
        ),
        custom: files.custom.filter((file) =>
          file.declartionNumber?.some((decl) =>
            decl.declarionNumberPerCampany
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
        ),
        transport: files.transport.filter((file) =>
          file.declartionNumber?.some((decl) =>
            decl.declarionNumberPerCampany
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
        ),
        clearance: files.clearance.filter((file) =>
          file.declartionNumber?.some((decl) =>
            decl.declarionNumberPerCampany
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
        ),
      };

      // Only add company if it has any matching files
      if (
        filteredFiles.warehouse.length > 0 ||
        filteredFiles.custom.length > 0 ||
        filteredFiles.transport.length > 0 ||
        filteredFiles.clearance.length > 0
      ) {
        filtered[companyName] = filteredFiles;
      }
    }

    return filtered;
  };
  const groupedFiles = groupFilesByCompany();
  const filteredGroupedFiles = filterFilesByDeclaration(groupedFiles);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-lg mx-4 my-6">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-75">
          <div className="relative bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <button
              onClick={closePreview}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={previewImage.src}
              alt={previewImage.alt}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <div className="p-4 text-center text-sm text-gray-600">
              {previewImage.alt}
            </div>
          </div>
        </div>
      )}

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

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {Object.entries(filteredGroupedFiles).map(([companyName, files]) => {
            const totalFiles =
              files.warehouse.length +
              files.custom.length +
              files.transport.length +
              files.clearance.length;

            if (totalFiles === 0) return null;

            return (
              <div
                key={companyName}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div
                  className="flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                  onClick={() => toggleCompany(companyName)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-md">
                      <span className="font-medium">{companyName}</span>
                    </div>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${
                      expandedCompanies[companyName] ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {expandedCompanies[companyName] && (
                  <div className="p-4 space-y-6">
                    {files.warehouse.length > 0 && (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-blue-600 text-white px-4 py-2">
                          <h2 className="font-bold flex items-center">
                            Warehouse Files ({files.warehouse.length})
                          </h2>
                        </div>
                        <div className="p-4 bg-gray-50">
                          {files.warehouse.map((file, index) => (
                            <div key={`warehouse-${index}`}>
                              {renderFileDetails(file, "warehouse")}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {files.custom.length > 0 && (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-green-600 text-white px-4 py-2">
                          <h2 className="font-bold flex items-center">
                            Custom Files ({files.custom.length})
                          </h2>
                        </div>
                        <div className="p-4 bg-gray-50">
                          {files.custom.map((file, index) => (
                            <div key={`custom-${index}`}>
                              {renderFileDetails(file, "custom")}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {files.transport.length > 0 && (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-yellow-600 text-white px-4 py-2">
                          <h2 className="font-bold flex items-center">
                            Transport Files ({files.transport.length})
                          </h2>
                        </div>
                        <div className="p-4 bg-gray-50">
                          {files.transport.map((file, index) => (
                            <div key={`transport-${index}`}>
                              {renderFileDetails(file, "transport")}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {files.clearance.length > 0 && (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-purple-600 text-white px-4 py-2">
                          <h2 className="font-bold flex items-center">
                            Clearance Files ({files.clearance.length})
                          </h2>
                        </div>
                        <div className="p-4 bg-gray-50">
                          {files.clearance.map((file, index) => (
                            <div key={`clearance-${index}`}>
                              {renderFileDetails(file, "clearance")}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {Object.keys(filteredGroupedFiles).length === 0 && (
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
