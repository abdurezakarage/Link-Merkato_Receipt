"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getToken } from '../../../components/auth';
import { admin_local_receipt_api, admin_export_receipt_api, admin_import_receipt_api } from '../../../app/api/api';
import Image from 'next/image';
// import { downloadFile, previewFile, isPreviewable } from '../../../components/AdminMockData/fileUtils'; // Commented out: unused imports for type check

interface BackendData {
  id: string;
  officeType: 'tax' | 'custom';
  receiptCategory: 'local' | 'import' | 'export' | 'custom';
  hasWithholdingTax: 'yes' | 'no';
  paymentMethod: string;
  bankName?: string;
  firstName?: string;
  calendarType: string;
  receiptDate: string;
  receipt_Number?: string;
  documents: {
    MainBase64?: string;
    AttachmentBase64?: string;
    importDeclaration?: FileList;
    exportDeclaration?: FileList;
    importLicense?: FileList;
    commercialInvoice?: FileList;
    packingList?: FileList;
    airwayBill?: FileList;
    certificateOfOrigin?: FileList;
    bankPermit?: FileList;
    insuranceCost?: FileList;
    insurancePolicy?: FileList;
    others?: FileList;
    key: string;
  };
  status: 'approved' | 'rejected';
  uploadedAt: string;
  tin_number: string;
  companyName: string;
}

interface CompanyData {
  tin_number: string;
  companyName: string;
  localData: BackendData[];
  importData: BackendData[];
  exportData: BackendData[];
  totalUploads: number;
  approvedCount: number;
  rejectedCount: number;
  [key: string]: unknown; // Allow dynamic property access for status counts
}

// interface HiveType { /* Define hive type here if needed for type check */ } // Commented out: placeholder for hive type

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTIN, setSelectedTIN] = useState<string>('');
  const [data, setData] = useState<BackendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState<CompanyData[]>([]);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  //const [showTable, setShowTable] = useState(false);
  const [tableCategory, setTableCategory] = useState('all');
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    fileUrl: string;
    fileName: string;
    fileType: 'image' | 'pdf' | 'unknown';
  }>({
    isOpen: false,
    fileUrl: '',
    fileName: '',
    fileType: 'unknown'
  });
  const router = useRouter();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const companiesPerPage = 4;

  // Calculate paginated companies
  const paginatedCompanies = companyData.slice((currentPage - 1) * companiesPerPage, currentPage * companiesPerPage);
  const totalPages = Math.ceil(companyData.length / companiesPerPage);

  // Add state for view toggle
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Reset currentPage to 1 when viewMode, searchTerm, or selectedTIN changes
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, searchTerm, selectedTIN]);

  // Table pagination state
  const [tablePage, setTablePage] = useState(1);
  const tableRowsPerPage = 10;

  // Prepare flat table data
  const flatTableData = companyData.flatMap(company => [
    ...company.localData.map(item => ({ ...item, companyName: company.companyName, tin_number: company.tin_number })),
    ...company.importData.map(item => ({ ...item, companyName: company.companyName, tin_number: company.tin_number })),
    ...company.exportData.map(item => ({ ...item, companyName: company.companyName, tin_number: company.tin_number })),
  ]).filter(item => tableCategory === 'all' ? true : item.receiptCategory === tableCategory);
  const tableTotalPages = Math.ceil(flatTableData.length / tableRowsPerPage);
  const paginatedTableData = flatTableData.slice((tablePage - 1) * tableRowsPerPage, tablePage * tableRowsPerPage);

  // Reset tablePage to 1 when tableCategory or companyData changes
  useEffect(() => {
    setTablePage(1);
  }, [tableCategory, companyData]);

  // Helper function to detect file type from base64 string
  const detectFileType = (base64String: string): 'image' | 'pdf' | 'unknown' => {
    if (base64String.startsWith('data:image/')) {
      return 'image';
    } else if (base64String.startsWith('data:application/pdf')) {
      return 'pdf';
    } else if (base64String.startsWith('Maindata:image/') || base64String.startsWith('AttachementData:image/')) {
      return 'image';
    } else if (base64String.startsWith('Maindata:application/pdf') || base64String.startsWith('AttachementData:application/pdf')) {
      return 'pdf';
    }
    return 'unknown';
  };

  // Helper function to get clean data URL from base64 string
  const getCleanDataUrl = (base64String: string): string => {
    if (base64String.startsWith('Maindata:')) {
      return base64String.replace('Maindata:', 'data:');
    } else if (base64String.startsWith('AttachementData:')) {
      return base64String.replace('AttachementData:', 'data:');
    }
    return base64String;
  };

  // Preview function
  const handlePreview = (filePath: string, fileName: string) => {
    const fileType = detectFileType(filePath);
    const cleanUrl = getCleanDataUrl(filePath);
    
    setPreviewModal({
      isOpen: true,
      fileUrl: cleanUrl,
      fileName: fileName,
      fileType: fileType
    });
  };

  // Close preview modal
  const closePreview = () => {
    setPreviewModal({
      isOpen: false,
      fileUrl: '',
      fileName: '',
      fileType: 'unknown'
    });
  };

  // Check if user is logged in and fetch data from all 4 APIs
  useEffect(() => {
    const fetchAllData = async () => {
      const token = getToken();
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        setLoading(true);
        
        // Fetch data from all APIs independently to handle failures gracefully
        const fetchApiData = async (apiUrl: string, apiName: string) => {
          try {
            const response = await axios.get(apiUrl, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            // console.log(`${apiName} API response:`, response.data);
            return response.data;
          } catch (error) {
            console.error(`Error fetching ${apiName} data:`, error);
            // Return empty array for failed API calls
            return [];
          }
        };
 
        const [localData, importData, exportData] = await Promise.all([
          fetchApiData(admin_local_receipt_api, 'Local'),
          fetchApiData(admin_import_receipt_api, 'Import'),
          fetchApiData(admin_export_receipt_api, 'Export')
        ]);

        // Combine all data
        const allData: BackendData[] = [];
        
        // Helper to map API response to BackendData
        const mapApiData = (item: Record<string, unknown>, officeType: 'tax' | 'custom', receiptCategory: 'local' | 'import' | 'export' | 'custom'): BackendData => ({
          id: typeof item.id === 'string' ? item.id : typeof item._id === 'string' ? item._id : Math.random().toString(36).substr(2, 9),
          officeType,
          receiptCategory,
          hasWithholdingTax: item.hasWithholdingTax === 'yes' || item.hasWithholdingTax === 'no' ? item.hasWithholdingTax : 'no',
          paymentMethod: typeof item.paymentMethod === 'string' ? item.paymentMethod : '',
          bankName: typeof item.bankName === 'string' ? item.bankName : '',
          firstName: typeof item.firstName === 'string' ? item.firstName : '',
          calendarType: typeof item.calendarType === 'string' ? item.calendarType : '',
          receiptDate: typeof item.receiptDate === 'string' ? item.receiptDate : '',
          receipt_Number:
            typeof item.receipt_Number === 'string' ? item.receipt_Number
            : typeof item.receipt_number === 'string' ? item.receipt_number
            : typeof item.receiptNumber === 'string' ? item.receiptNumber
            : typeof item.receipt_Number === 'number' ? String(item.receipt_Number)
            : typeof item.receipt_number === 'number' ? String(item.receipt_number)
            : typeof item.receiptNumber === 'number' ? String(item.receiptNumber)
            : '',
          documents: {
            MainBase64: typeof item.imageMainBase64 === 'string' ? item.imageMainBase64 : undefined,
            AttachmentBase64: typeof item.imageAttachmentBase64 === 'string' ? item.imageAttachmentBase64 : undefined,
            key: typeof item.id === 'string' ? item.id : (typeof item._id === 'string' ? item._id : Math.random().toString(36).substr(2, 9)),
            // Add more mappings if needed
          },
          status: item.status === 'approved' || item.status === 'rejected' ? item.status : 'approved',
          uploadedAt: typeof item.uploadedAt === 'string' ? item.uploadedAt : (typeof item.receiptDate === 'string' ? item.receiptDate : ''),
          tin_number: typeof item.tin_number === 'string' ? item.tin_number
            : typeof item.tinNumber === 'string' ? item.tinNumber
            : typeof item.tin === 'string' ? item.tin
            : '',
          companyName: typeof item.companyName === 'string' ? item.companyName
            : typeof item.company_name === 'string' ? item.company_name
            : typeof item.compnayName === 'string' ? item.compnayName
            : typeof item.compnay_name === 'string' ? item.compnay_name
            : typeof item.company_name === 'string' ? item.company_name
            : '', // handle typo and correct field
        });
        
        // Process local receipt data
        if (localData && Array.isArray(localData)) {
          (localData as Record<string, unknown>[]).forEach((item: Record<string, unknown>) => {
            allData.push(mapApiData(item, 'tax', 'local'));
          });
        }
        // Process import receipt data
        if (importData && Array.isArray(importData)) {
          // console.log('Processing import data, count:', importData.length);
          (importData as Record<string, unknown>[]).forEach((item: Record<string, unknown>) => {
            const mapped = mapApiData(item, 'tax', 'import');
            // console.log('Mapped import data:', mapped); // Debug log
            allData.push(mapped);
          });
        } else {
          // console.log('Import data is not an array or is empty:', importData);
          // Show a user-friendly message if import API is not available
          if (Array.isArray(importData) && importData.length === 0) {
            // console.log('Import API is not available or returning 403 Forbidden. This endpoint may not be implemented on the backend yet.');
          }
        }
        // Process export receipt data
        if (exportData && Array.isArray(exportData)) {
          (exportData as Record<string, unknown>[]).forEach((item: Record<string, unknown>) => {
            allData.push(mapApiData(item, 'tax', 'export'));
          });
        }
        // console.log('Final combined data:', allData);
        // console.log('Import records in combined data:', allData.filter(item => item.receiptCategory === 'import').length);

        setData(allData);
        // console.log('Combined data from all APIs:', allData);
        setLoading(false);
      } catch (err) {
        // console.error('Error in fetchAllData:', err);
        // Handle any unexpected errors (like network issues)
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.push('/auth/login');
          return;
        }
        // For any other errors, just set empty data and continue
        setData([]);
        setLoading(false);
      }
    };

    fetchAllData();
  }, [router]);

  // Group data by company/TIN
  useEffect(() => {
    const groupedData: { [key: string]: CompanyData } = {};

    // Process all data from backend
    data.forEach(item => {
      if (!groupedData[item.tin_number]) {
        groupedData[item.tin_number] = {
          tin_number: item.tin_number,
          companyName: item.companyName,
          localData: [],
          importData: [],
          exportData: [],
          totalUploads: 0,
          approvedCount: 0,
          rejectedCount: 0
        };
      }
      // Categorize data by receiptCategory
      if (item.receiptCategory === 'local') {
        groupedData[item.tin_number].localData.push(item);
      } else if (item.receiptCategory === 'import') {
        groupedData[item.tin_number].importData.push(item);
      } else if (item.receiptCategory === 'export') {
        groupedData[item.tin_number].exportData.push(item);
      }
      groupedData[item.tin_number].totalUploads++;
      if (item.status === 'approved') groupedData[item.tin_number].approvedCount++;
      if (item.status === 'rejected') groupedData[item.tin_number].rejectedCount++;
    });

    // Convert to array and filter
    let companies = Object.values(groupedData);

    if (searchTerm) {
      companies = companies.filter(company => {
        // Check if search term matches the first letter of company name
        const companyNameStartsWithSearch = company.companyName?.toLowerCase().startsWith(searchTerm.toLowerCase());
        // Check if search term matches TIN number (keep existing TIN search functionality)
        const tinMatchesSearch = company.tin_number.includes(searchTerm);
        return companyNameStartsWithSearch || tinMatchesSearch;
      });
    }

    if (selectedTIN) {
      companies = companies.filter(company => company.tin_number === selectedTIN);
    }

    setCompanyData(companies);
  }, [data, searchTerm, selectedTIN]);

  // Get unique TIN numbers for the dropdown
  const uniqueTINs = Array.from(new Set(data.map(item => item.tin_number))).sort();

  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());

  // Helper to download base64 files
  function downloadBase64File(base64String: string, fileName: string) {
    // Extract the mime type and the actual base64 data
    const matches = base64String.match(/^([A-Za-z0-9+/=]+:)?data:(.*);base64,(.*)$/) || base64String.match(/^(.*?);base64,(.*)$/);
    let mimeType = "application/octet-stream";
    let data = base64String;
    if (matches) {
      if (matches.length === 4) {
        mimeType = matches[2];
        data = matches[3];
      } else if (matches.length === 3) {
        mimeType = matches[1] || mimeType;
        data = matches[2];
      }
    }
    // Set file extension based on mimeType
    let ext = 'bin';
    if (mimeType.includes('pdf')) ext = 'pdf';
    else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('gif')) ext = 'gif';
    // If fileName doesn't already have the extension, add it
    if (!fileName.endsWith('.' + ext)) fileName += '.' + ext;
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${data}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      setDownloadingFiles(prev => new Set(prev).add(filePath));
      // If filePath is a base64 string, download as image or pdf
      if (
        typeof filePath === 'string' &&
        (filePath.startsWith('Maindata:image') ||
         filePath.startsWith('AttachementData:image') ||
         filePath.startsWith('data:image') ||
         filePath.startsWith('data:application/pdf') ||
         filePath.startsWith('Maindata:application/pdf;base64,') ||
         filePath.startsWith('AttachementData:application/pdf;base64,'))
      ) {
        // Detect PDF
        if (
          filePath.startsWith('data:application/pdf') ||
          filePath.startsWith('Maindata:application/pdf;base64,') ||
          filePath.startsWith('AttachementData:application/pdf;base64,')
        ) {
          const dataUrl = filePath;
          if (filePath.startsWith('Maindata:')) {
            downloadBase64File(filePath.replace('Maindata:', 'data:'), fileName + '.pdf');
          } else if (filePath.startsWith('AttachementData:')) {
            downloadBase64File(filePath.replace('AttachementData:', 'data:'), fileName + '.pdf');
          } else {
            downloadBase64File(dataUrl, fileName + '.pdf');
          }
        } else {
          downloadBase64File(filePath, fileName + '.jpg');
        }
        setDownloadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(filePath);
          return newSet;
        });
        return;
      }
      // If filePath is a base64 PDF with custom prefix (legacy fallback)
      if (
        typeof filePath === 'string' &&
        (filePath.startsWith('Maindata:data:application/pdf') || filePath.startsWith('AttachementData:data:application/pdf'))
      ) {
        const dataUrl = filePath.replace('Maindata:', '').replace('AttachementData:', '');
        downloadBase64File(dataUrl, fileName + '.pdf');
        setDownloadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(filePath);
          return newSet;
        });
        return;
      }
      // If filePath is a direct PDF URL
      if (typeof filePath === 'string' && filePath.endsWith('.pdf')) {
        // Download via anchor
        const link = document.createElement('a');
        link.href = filePath;
        link.download = fileName + '.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(filePath);
          return newSet;
        });
        return;
      }
      // await downloadFile(filePath, {
      //   fileName: fileName,
      //   showProgress: true
      // });
      // Show success message
      // console.log(`Successfully downloaded: ${fileName}`);
    } catch (error) {
      // console.error('Download failed:', error);
      alert(`Failed to download ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(filePath);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  };

  const toggleExpanded = (tin_number: string) => {
    setExpandedCompany(expandedCompany === tin_number ? null : tin_number);
  };

  const getReceiptCategoryLabel = (category: string) => {
    switch (category) {
      case 'local':
        return 'Local Receipt';
      case 'import':
        return 'Import Receipt';
      case 'export':
        return 'Export Receipt';
      case 'custom':
        return 'Custom Documents';
      default:
        return category;
    }
  };

  const renderCompanyRow = (company: CompanyData) => {
    const isExpanded = expandedCompany === company.tin_number;
    return (
      <Card key={company.tin_number} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          {/* Company Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {company.companyName}
                  </h3>
                  <p className="text-gray-600">TIN: {company.tin_number}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggleExpanded(company.tin_number)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="hidden md:grid md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-600">Total Uploads</p>
              <p className="text-2xl font-bold text-blue-900">{company.totalUploads}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-600">Local Records</p>
              <p className="text-2xl font-bold text-green-900">{company.localData.length}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm text-purple-600">Import Records</p>
              <p className="text-2xl font-bold text-purple-900">{company.importData.length}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm text-orange-600">Export Records</p>
              <p className="text-2xl font-bold text-orange-900">{company.exportData.length}</p>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="border-t pt-6 space-y-6">
              {/* Local Data Section */}
              {company.localData.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="text-blue-600 mr-2">🏠</span>
                    Local Receipts ({company.localData.length} records)
                  </h4>
                  <div className="space-y-4">
                    {company.localData.map((item: BackendData) => (
                      <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-gray-900 capitalize mb-2">
                              Local Receipt
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-700 mb-2">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span className="font-semibold mr-1">Receipt date:</span> {formatDate(item.receiptDate)}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>
                                <span className="font-semibold mr-1">Calendar type:</span> {item.calendarType}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2z" /></svg>
                                <span className="font-semibold mr-1">Payment method:</span> {item.paymentMethod}
                              </div>
                              {item.paymentMethod === 'BANK' && item.bankName && (
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10V6a1 1 0 011-1h16a1 1 0 011 1v4M4 10v10a1 1 0 001 1h14a1 1 0 001-1V10M4 10h16" /></svg>
                                  <span className="font-semibold mr-1">Bank:</span> {item.bankName}
                                </div>
                              )}
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2-2 4 4m0 0l-4-4-2 2" /></svg>
                                <span className="font-semibold mr-1">Withholding tax:</span> {item.hasWithholdingTax}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 118 0v2" /></svg>
                                <span className="font-semibold mr-1">Receipt Number:</span> {item.receipt_Number || '-'}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span className="font-semibold mr-1">Uploaded by:</span> {item.firstName || '-'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {item.documents.MainBase64 && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handlePreview(item.documents.MainBase64 as string, 'Receipt')}
                                className="flex items-center space-x-2 p-2 bg-blue-50 rounded border hover:bg-blue-100 transition-colors text-sm"
                              >
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>Preview</span>
                              </button>
                              <button
                                onClick={() => handleDownload(item.documents.MainBase64 as string, 'Receipt')}
                                disabled={downloadingFiles.has(item.documents.MainBase64 as string)}
                                className="flex items-center space-x-2 p-2 bg-white rounded border hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {downloadingFiles.has(item.documents.MainBase64 as string) ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                ) : (
                                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                )}
                                <span>Download</span>
                              </button>
                            </div>
                          )}
                          {item.documents.AttachmentBase64 && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handlePreview(item.documents.AttachmentBase64 as string, 'Attachment')}
                                className="flex items-center space-x-2 p-2 bg-green-50 rounded border hover:bg-green-100 transition-colors text-sm"
                              >
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>Preview</span>
                              </button>
                              <button
                                onClick={() => handleDownload(item.documents.AttachmentBase64 as string, 'Attachment')}
                                disabled={downloadingFiles.has(item.documents.AttachmentBase64 as string)}
                                className="flex items-center space-x-2 p-2 bg-white rounded border hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {downloadingFiles.has(item.documents.AttachmentBase64 as string) ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                ) : (
                                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                )}
                                <span>Download</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Import Data Section */}
              {company.importData.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="text-purple-600 mr-2">🚢</span>
                    Import Receipts ({company.importData.length} records)
                  </h4>
                  <div className="space-y-4">
                    {company.importData.map((item: BackendData) => (
                      <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-gray-900 capitalize mb-2">
                              Import Receipt
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-700 mb-2">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span className="font-semibold mr-1">Uploaded date:</span> {formatDate(item.receiptDate)}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>
                                <span className="font-semibold mr-1">Calendar type:</span> {item.calendarType}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2z" /></svg>
                                <span className="font-semibold mr-1">Payment method:</span> {item.paymentMethod}
                              </div>
                              {item.paymentMethod === 'BANK' && item.bankName && (
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10V6a1 1 0 011-1h16a1 1 0 011 1v4M4 10v10a1 1 0 001 1h14a1 1 0 001-1V10M4 10h16" /></svg>
                                  <span className="font-semibold mr-1">Bank:</span> {item.bankName}
                                </div>
                              )}
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2-2 4 4m0 0l-4-4-2 2" /></svg>
                                <span className="font-semibold mr-1">Withholding tax:</span> {item.hasWithholdingTax}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 118 0v2" /></svg>
                                <span className="font-semibold mr-1">Receipt Number:</span> {item.receipt_Number || '-'}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span className="font-semibold mr-1">Uploaded by:</span> {item.firstName || '-'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {item.documents.MainBase64 && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handlePreview(item.documents.MainBase64 as string, 'Receipt')}
                                className="flex items-center space-x-2 p-2 bg-blue-50 rounded border hover:bg-blue-100 transition-colors text-sm"
                              >
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>Preview</span>
                              </button>
                              <button
                                onClick={() => handleDownload(item.documents.MainBase64 as string, 'Receipt')}
                                disabled={downloadingFiles.has(item.documents.MainBase64 as string)}
                                className="flex items-center space-x-2 p-2 bg-white rounded border hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {downloadingFiles.has(item.documents.MainBase64 as string) ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                ) : (
                                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                )}
                                <span>Download</span>
                              </button>
                            </div>
                          )}
                          {item.documents.AttachmentBase64 && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handlePreview(item.documents.AttachmentBase64 as string, 'Attachment')}
                                className="flex items-center space-x-2 p-2 bg-green-50 rounded border hover:bg-green-100 transition-colors text-sm"
                              >
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>Preview</span>
                              </button>
                              <button
                                onClick={() => handleDownload(item.documents.AttachmentBase64 as string, 'Attachment')}
                                disabled={downloadingFiles.has(item.documents.AttachmentBase64 as string)}
                                className="flex items-center space-x-2 p-2 bg-white rounded border hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {downloadingFiles.has(item.documents.AttachmentBase64 as string) ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                ) : (
                                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                )}
                                <span>Download</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Export Data Section */}
              {company.exportData.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="text-orange-600 mr-2">📦</span>
                    Export Receipts ({company.exportData.length} records)
                  </h4>
                  <div className="space-y-4">
                    {company.exportData.map((item: BackendData) => (
                      <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-gray-900 capitalize mb-2">
                              Export Receipt
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-700 mb-2">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span className="font-semibold mr-1">Uploaded date:</span> {formatDate(item.receiptDate)}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>
                                <span className="font-semibold mr-1">Calendar type:</span> {item.calendarType}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2z" /></svg>
                                <span className="font-semibold mr-1">Payment method:</span> {item.paymentMethod}
                              </div>
                              {item.paymentMethod === 'BANK' && item.bankName && (
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10V6a1 1 0 011-1h16a1 1 0 011 1v4M4 10v10a1 1 0 001 1h14a1 1 0 001-1V10M4 10h16" /></svg>
                                  <span className="font-semibold mr-1">Bank:</span> {item.bankName}
                                </div>
                              )}
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2-2 4 4m0 0l-4-4-2 2" /></svg>
                                <span className="font-semibold mr-1">Withholding tax:</span> {item.hasWithholdingTax}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 118 0v2" /></svg>
                                <span className="font-semibold mr-1">Receipt Number:</span> {item.receipt_Number || '-'}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span className="font-semibold mr-1">Uploaded by:</span> {item.firstName || '-'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {item.documents.MainBase64 && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handlePreview(item.documents.MainBase64 as string, 'Receipt')}
                                className="flex items-center space-x-2 p-2 bg-blue-50 rounded border hover:bg-blue-100 transition-colors text-sm"
                              >
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>Preview</span>
                              </button>
                              <button
                                onClick={() => handleDownload(item.documents.MainBase64 as string, 'Receipt')}
                                disabled={downloadingFiles.has(item.documents.MainBase64 as string)}
                                className="flex items-center space-x-2 p-2 bg-white rounded border hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {downloadingFiles.has(item.documents.MainBase64 as string) ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                ) : (
                                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                )}
                                <span>Download</span>
                              </button>
                            </div>
                          )}
                          {item.documents.AttachmentBase64 && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handlePreview(item.documents.AttachmentBase64 as string, 'Attachment')}
                                className="flex items-center space-x-2 p-2 bg-green-50 rounded border hover:bg-green-100 transition-colors text-sm"
                              >
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>Preview</span>
                              </button>
                              <button
                                onClick={() => handleDownload(item.documents.AttachmentBase64 as string, 'Attachment')}
                                disabled={downloadingFiles.has(item.documents.AttachmentBase64 as string)}
                                className="flex items-center space-x-2 p-2 bg-white rounded border hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {downloadingFiles.has(item.documents.AttachmentBase64 as string) ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                ) : (
                                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                )}
                                <span>Download</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
            <p className="text-gray-600 text-xl">Manage company data </p>
            <div className="mt-4 flex justify-center">
              <div className="w-16 h-1 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Company Name or TIN
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Company name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by TIN Number
              </label>
              <select
                value={selectedTIN}
                onChange={(e) => setSelectedTIN(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">All</option>
                {uniqueTINs.map((tin) => (
                  <option key={tin} value={tin}>{tin}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* View Toggle Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
            className={`px-6 py-2 rounded-lg font-semibold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${viewMode === 'card' ? 'bg-white text-blue-700 border border-blue-600 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {viewMode === 'card' ? 'Switch to Table View' : 'Switch to Card View'}
          </button>
        </div>

        {/* Company Data Display (Card View) */}
        {viewMode === 'card' && (
          <>
            <div className="space-y-6">
              {companyData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🏢</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No company data found</h3>
                </div>
              ) : (
                paginatedCompanies.map(renderCompanyRow)
              )}
            </div>
            {/* Pagination Controls */}
            {companyData.length > companiesPerPage && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg font-semibold border bg-white text-blue-700 border-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="mx-2 text-gray-700">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg font-semibold border bg-white text-blue-700 border-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Table View of All Records */}
        {viewMode === 'table' && (
          <div className="mt-0">
            <div className="bg-white rounded-2xl shadow-2xl p-6 overflow-x-auto border border-gray-200">
              <div className="mb-4 flex flex-row flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold text-gray-900 mb-0">All Records</h3>
              </div>
              <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden text-xs">
                <thead className="bg-gradient-to-r from-blue-100 to-indigo-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-1 text-left font-bold text-blue-900 uppercase tracking-wider max-w-[100px] truncate">Company</th>
                    <th className="px-2 py-1 text-left font-bold text-blue-900 uppercase tracking-wider max-w-[80px] truncate">TIN</th>
                    <th className="px-2 py-1 text-left font-bold text-blue-900 uppercase tracking-wider max-w-[90px] truncate">Category</th>
                    <th className="px-2 py-1 text-left font-bold text-blue-900 uppercase tracking-wider max-w-[70px] truncate">Payment</th>
                    <th className="px-2 py-1 text-left font-bold text-blue-900 uppercase tracking-wider max-w-[80px] truncate">Bank</th>
                    <th className="px-2 py-1 text-left font-bold text-blue-900 uppercase tracking-wider max-w-[80px] truncate">Withholding</th>
                    <th className="px-2 py-1 text-left font-bold text-blue-900 uppercase tracking-wider max-w-[80px] truncate">Calendar Type</th>
                    <th className="px-2 py-1 text-left font-bold text-blue-900 uppercase tracking-wider max-w-[80px] truncate">Date</th>
                    <th className="px-2 py-1 text-left font-bold text-blue-900 uppercase tracking-wider max-w-[60px] truncate">User</th>
                    <th className="px-2 py-1 text-left font-bold text-blue-900 uppercase tracking-wider max-w-[140px] truncate">Receipt</th>
                    <th className="px-2 py-1 text-left font-bold text-blue-900 uppercase tracking-wider max-w-[140px] truncate">Attachment</th>
                    <th className="px-2 py-1 text-left font-bold text-blue-900 uppercase tracking-wider max-w-[100px] truncate">Receipt No.</th>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                    <td>
                      <select
                        id="table-category"
                        value={tableCategory}
                        onChange={e => setTableCategory(e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs text-gray-900"
                      >
                        <option value="all">All</option>
                        <option value="local">Local</option>
                        <option value="import">Import</option>
                        <option value="export">Export</option>
                        <option value="custom">Custom</option>
                      </select>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedTableData.map((item: BackendData, idx: number) => (
                    <tr
                      key={item.id + '-' + idx}
                      className={idx % 2 === 0 ? 'bg-blue-50 hover:bg-blue-100 transition-colors' : 'bg-white hover:bg-blue-50 transition-colors'}
                    >
                      <td className="px-2 py-1 text-sm text-gray-900 font-medium max-w-[100px] truncate" title={item.companyName}>{item.companyName}</td>
                      <td className="px-2 py-1 text-sm text-gray-900 max-w-[80px] truncate" title={item.tin_number}>{item.tin_number}</td>
                      <td className="px-2 py-1 text-sm text-indigo-700 font-semibold max-w-[90px] truncate" title={getReceiptCategoryLabel(item.receiptCategory)}>{getReceiptCategoryLabel(item.receiptCategory)}</td>
                      <td className="px-2 py-1 text-sm text-gray-900 max-w-[70px] truncate" title={item.paymentMethod}>{item.paymentMethod}</td>
                      <td className="px-2 py-1 text-sm text-gray-900 max-w-[80px] truncate" title={item.paymentMethod === 'BANK' ? item.bankName : ''}>{item.paymentMethod === 'BANK' ? item.bankName : ''}</td>
                      <td className="px-2 py-1 text-sm text-gray-900 max-w-[80px] truncate" title={item.hasWithholdingTax}>{item.hasWithholdingTax}</td>
                      <td className="px-2 py-1 text-sm text-gray-900 max-w-[80px] truncate" title={item.calendarType}>{item.calendarType}</td>
                      <td className="px-2 py-1 text-sm text-gray-900 max-w-[80px] truncate" title={formatDate(item.uploadedAt)}>{formatDate(item.uploadedAt)}</td>
                      <td className="px-2 py-1 text-sm text-gray-900 max-w-[60px] truncate" title={item.firstName || '-'}>{item.firstName || '-'}</td>
                      <td className="px-2 py-1 text-sm text-gray-900 max-w-[140px]">
                        {item.documents?.MainBase64 && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handlePreview(item.documents.MainBase64 as string, 'Receipt')}
                              className="px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors shadow-sm text-xs"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => handleDownload(item.documents.MainBase64 as string, 'Receipt')}
                              className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm text-xs"
                            >
                              Download
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-1 text-sm text-gray-900 max-w-[140px]">
                        {item.documents?.AttachmentBase64 && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handlePreview(item.documents.AttachmentBase64 as string, 'Attachment')}
                              className="px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors shadow-sm text-xs"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => handleDownload(item.documents.AttachmentBase64 as string, 'Attachment')}
                              className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
                            >
                              Download
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-1 text-sm text-gray-900 max-w-[100px] truncate" title={item.receipt_Number || '-'}>{item.receipt_Number || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            {/* Table Pagination Controls */}
            {tableTotalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <button
                  onClick={() => setTablePage((prev) => Math.max(prev - 1, 1))}
                  disabled={tablePage === 1}
                  className="px-4 py-2 rounded-lg font-semibold border bg-white text-blue-700 border-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="mx-2 text-gray-700">Page {tablePage} of {tableTotalPages}</span>
                <button
                  onClick={() => setTablePage((prev) => Math.min(prev + 1, tableTotalPages))}
                  disabled={tablePage === tableTotalPages}
                  className="px-4 py-2 rounded-lg font-semibold border bg-white text-blue-700 border-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Summary Statistics</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {companyData.length}
              </div>
              <div className="text-gray-600">Total Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {companyData.reduce((sum, company) => sum + company.localData.length, 0)}
              </div>
              <div className="text-gray-600">Total Local Records</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {companyData.reduce((sum, company) => sum + company.importData.length, 0)}
              </div>
              <div className="text-gray-600">Total Import Records</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {companyData.reduce((sum, company) => sum + company.exportData.length, 0)}
              </div>
              <div className="text-gray-600">Total Export Records</div>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {previewModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Preview: {previewModal.fileName}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(previewModal.fileUrl, previewModal.fileName)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={closePreview}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
                {previewModal.fileType === 'image' && (
                  <div className="flex justify-center">
                    <Image
                      src={previewModal.fileUrl}
                      alt={previewModal.fileName}
                      width={500}
                      height={500}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                      style={{ maxHeight: '70vh' }}
                      onError={(e) => {
                        // console.error('Error loading image:', e);
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden text-center text-gray-500">
                      <p>Failed to load image preview</p>
                      <button
                        onClick={() => handleDownload(previewModal.fileUrl, previewModal.fileName)}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Download Instead
                      </button>
                    </div>
                  </div>
                )}

                {previewModal.fileType === 'pdf' && (
                  <div className="flex justify-center">
                    <iframe
                      src={previewModal.fileUrl}
                      title={previewModal.fileName}
                      className="w-full h-[70vh] border-0 rounded-lg shadow-lg"
                      onError={(e) => {
                        // console.error('Error loading PDF:', e);
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden text-center text-gray-500">
                      <p>Failed to load PDF preview</p>
                      <button
                        onClick={() => handleDownload(previewModal.fileUrl, previewModal.fileName)}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Download Instead
                      </button>
                    </div>
                  </div>
                )}

                {previewModal.fileType === 'unknown' && (
                  <div className="text-center text-gray-500">
                    <p>Unable to preview this file type</p>
                    <button
                      onClick={() => handleDownload(previewModal.fileUrl, previewModal.fileName)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Download File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

