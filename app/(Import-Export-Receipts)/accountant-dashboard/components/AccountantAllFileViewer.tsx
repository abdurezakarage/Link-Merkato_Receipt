"use client";
import { useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp } from "lucide-react";

// Define TypeScript interfaces for each file type
interface WarehouseFile {
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

interface CustomFile {
  userId: string;
  tinNumebr: string;
  firstname: string;
  lastname: string;
  companyname: string;
  imagebaseCustomfile: string;
  imagebaseBankPermitfile: string;
  imageCummercialInvoicefile: string;
  bankfiletype: string;
  cutomfileType: string;
  commerciailInvoicefiltype: string;
}

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
}

interface ClearanceFile {
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

type FileType = 'warehouse' | 'custom' | 'transport' | 'clearance';

interface GroupedFiles {
  warehouse: Array<WarehouseFile & { type: 'warehouse' }>;
  custom: Array<CustomFile & { type: 'custom' }>;
  transport: Array<TransportFile & { type: 'transport' }>;
  clearance: Array<ClearanceFile & { type: 'clearance' }>;
}

const BASE_URL = "https://customreceiptmanagement.onrender.com";

export default function AllFilesFetcher() {
  const [warehouseFiles, setWarehouseFiles] = useState<WarehouseFile[]>([]);
  const [customFiles, setCustomFiles] = useState<CustomFile[]>([]);
  const [transportFiles, setTransportFiles] = useState<TransportFile[]>([]);
  const [clearanceFiles, setClearanceFiles] = useState<ClearanceFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({});

  const getToken = () => {
    if (typeof window !== 'undefined') {
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

      const [warehouseResponse, customResponse, transportResponse, clearanceResponse] = await Promise.all([
        axios.get<WarehouseFile[]>(`${BASE_URL}/api/v1/accountant/wareHousefile`, { headers }),
        axios.get<CustomFile[]>(`${BASE_URL}/api/v1/accountant/customfill`, { headers }),
        axios.get<TransportFile[]>(`${BASE_URL}/api/v1/accountant/TransportFile`, { headers }),
        axios.get<ClearanceFile[]>(`${BASE_URL}/api/v1/accountant/ClearanceFile`, { headers })
      ]);

      setWarehouseFiles(warehouseResponse.data);
      setCustomFiles(customResponse.data);
      setTransportFiles(transportResponse.data);
      setClearanceFiles(clearanceResponse.data);

      // Initialize all companies as expanded
      const allCompanies = [
        ...warehouseResponse.data.map(f => f.companyName),
        ...customResponse.data.map(f => f.companyname),
        ...transportResponse.data.map(f => f.companyName),
        ...clearanceResponse.data.map(f => f.companyName)
      ];
      const uniqueCompanies = [...new Set(allCompanies.filter(Boolean))];
      const initialCompanyState = uniqueCompanies.reduce((acc, company) => {
        acc[company] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setExpandedCompanies(initialCompanyState);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
        "Failed to fetch files. Please check your connection and try again.";
      setError(errorMessage);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompany = (companyName: string) => {
    setExpandedCompanies(prev => ({
      ...prev,
      [companyName]: !prev[companyName]
    }));
  };

  const renderImagePreview = (base64String: string, altText: string) => {
    if (!base64String) return <span className="text-gray-500">No image available</span>;
    
    return (
      <div className="mt-2">
        <img 
          src={`data:image/jpeg;base64,${base64String}`} 
          alt={altText}
          className="max-w-full h-auto rounded border border-gray-200 max-h-40 object-contain"
        />
        <div className="mt-2">
          <a
            href={`data:image/jpeg;base64,${base64String}`}
            download={`${altText}-${Date.now()}.jpg`}
            className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Download
          </a>
        </div>
      </div>
    );
  };

  const renderFileDetails = (file: any, type: string) => {
    return (
      <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-white shadow-xs">
        <h3 className="font-semibold text-gray-800 mb-1">
          {file.firstName || file.firstname} {file.lastname}
        </h3>
        <p className="text-xs text-gray-600">TIN: {file.tinNumber || file.tinNumebr}</p>
        
        {type === 'warehouse' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div>
              <p className="text-xs font-medium">Main Receipt ({file.maintype})</p>
              {renderImagePreview(file.imageBaseMainReceipt, "Main-Receipt")}
            </div>
            <div>
              <p className="text-xs font-medium">Withholding Receipt ({file.withHoldihType})</p>
              {renderImagePreview(file.imageBaseWithholidingReceipt, "Withholding-Receipt")}
            </div>
          </div>
        )}
        
        {type === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            <div>
              <p className="text-xs font-medium">Custom File ({file.cutomfileType})</p>
              {renderImagePreview(file.imagebaseCustomfile, "Custom-File")}
            </div>
            <div>
              <p className="text-xs font-medium">Bank Permit ({file.bankfiletype})</p>
              {renderImagePreview(file.imagebaseBankPermitfile, "Bank-Permit")}
            </div>
            <div>
              <p className="text-xs font-medium">Commercial Invoice ({file.commerciailInvoicefiltype})</p>
              {renderImagePreview(file.imageCummercialInvoicefile, "Commercial-Invoice")}
            </div>
          </div>
        )}
        
        {(type === 'transport' || type === 'clearance') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div>
              <p className="text-xs font-medium">Main Receipt ({file.maintype})</p>
              {renderImagePreview(file.imageBaseMainReceipt, "Main-Receipt")}
            </div>
            <div>
              <p className="text-xs font-medium">Withholding Receipt ({file.withHoldihType})</p>
              {renderImagePreview(file.imageBaseWithholidingReceipt, "Withholding-Receipt")}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Group files by company name with proper TypeScript safety
  const groupFilesByCompany = () => {
    const allFiles = [
      ...warehouseFiles.map(f => ({ ...f, type: 'warehouse' as const })),
      ...customFiles.map(f => ({ ...f, type: 'custom' as const, companyName: f.companyname })),
      ...transportFiles.map(f => ({ ...f, type: 'transport' as const })),
      ...clearanceFiles.map(f => ({ ...f, type: 'clearance' as const }))
    ];

    return allFiles.reduce((acc: Record<string, GroupedFiles>, file) => {
      const companyName = file.companyName || 'Unknown Company';
      
      // Initialize company if not exists
      if (!acc[companyName]) {
        acc[companyName] = {
          warehouse: [],
          custom: [],
          transport: [],
          clearance: []
        };
      }

      // Type-safe push to the appropriate array
      switch (file.type) {
        case 'warehouse':
          acc[companyName].warehouse.push(file);
          break;
        case 'custom':
          acc[companyName].custom.push(file);
          break;
        case 'transport':
          acc[companyName].transport.push(file);
          break;
        case 'clearance':
          acc[companyName].clearance.push(file);
          break;
      }
      
      return acc;
    }, {});
  };

  const groupedFiles = groupFilesByCompany();

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 text-red-600 rounded-lg mx-4 my-6">
      {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
          Receipt Management Dashboard
        </h1>
        
        <div className="flex justify-center mb-8">
          <button
            onClick={fetchAllFiles}
            disabled={loading}
            className={`px-6 py-2 md:px-8 md:py-3 rounded-full text-white font-semibold transition-all 
              ${loading 
                ? "bg-gray-500 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
              }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Fetching Files...
              </span>
            ) : (
              "Fetch All Files"
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {Object.entries(groupedFiles).map(([companyName, files]) => (
            <div key={companyName} className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                onClick={() => toggleCompany(companyName)}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-md">
                    <span className="font-medium">{companyName}</span>
                  </div>
                  <div className="flex space-x-4">
                    <span className="text-sm text-gray-600">
                      Warehouse: {files.warehouse.length}
                    </span>
                    <span className="text-sm text-gray-600">
                      Custom: {files.custom.length}
                    </span>
                    <span className="text-sm text-gray-600">
                      Transport: {files.transport.length}
                    </span>
                    <span className="text-sm text-gray-600">
                      Clearance: {files.clearance.length}
                    </span>
                  </div>
                </div>
                <div className="text-gray-500">
                  {expandedCompanies[companyName] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedCompanies[companyName] && (
                <div className="p-4 space-y-6">
                  {/* Warehouse Files */}
                  {files.warehouse.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-blue-600 text-white px-4 py-2">
                        <h2 className="font-bold flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                          </svg>
                          Warehouse Files ({files.warehouse.length})
                        </h2>
                      </div>
                      <div className="p-4 bg-gray-50 max-h-[400px] overflow-y-auto">
                        {files.warehouse.map((file, index) => (
                          <div key={`warehouse-${index}`}>
                            {renderFileDetails(file, 'warehouse')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Files */}
                  {files.custom.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-green-600 text-white px-4 py-2">
                        <h2 className="font-bold flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                          </svg>
                          Custom Files ({files.custom.length})
                        </h2>
                      </div>
                      <div className="p-4 bg-gray-50 max-h-[400px] overflow-y-auto">
                        {files.custom.map((file, index) => (
                          <div key={`custom-${index}`}>
                            {renderFileDetails(file, 'custom')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transport Files */}
                  {files.transport.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-yellow-600 text-white px-4 py-2">
                        <h2 className="font-bold flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
                          </svg>
                          Transport Files ({files.transport.length})
                        </h2>
                      </div>
                      <div className="p-4 bg-gray-50 max-h-[400px] overflow-y-auto">
                        {files.transport.map((file, index) => (
                          <div key={`transport-${index}`}>
                            {renderFileDetails(file, 'transport')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clearance Files */}
                  {files.clearance.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-purple-600 text-white px-4 py-2">
                        <h2 className="font-bold flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                          </svg>
                          Clearance Files ({files.clearance.length})
                        </h2>
                      </div>
                      <div className="p-4 bg-gray-50 max-h-[400px] overflow-y-auto">
                        {files.clearance.map((file, index) => (
                          <div key={`clearance-${index}`}>
                            {renderFileDetails(file, 'clearance')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}