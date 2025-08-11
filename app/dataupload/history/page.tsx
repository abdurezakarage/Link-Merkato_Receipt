"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getToken } from '../../../components/auth';
import { jwtDecode } from 'jwt-decode';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { local_data_fetch_api, export_data_fetch_api, import_data_fetch_api, custom_data_fetch_api } from '../../api/api';
import Image from 'next/image';
interface UserData {
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
    mainBase64?: string;
    mainFileType?: string;
    attachmentBase64?: string;
    attachmentFileType?: string;
    key: string;
  };
  uploadedAt: string;
  tin_number: string;
  companyName: string;
}

interface DecodedToken {
  user_id: string;
  roles: string;
  username?: string;
  email?: string;
}

export default function UserHistoryPage() {
  const [data, setData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  // Remove searchTerm state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
  const itemsPerPage = 10;

  // Sort data by most recent uploadedAt date before filtering
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.uploadedAt).getTime();
    const dateB = new Date(b.uploadedAt).getTime();
    return dateB - dateA;
  });

  // Calculate paginated data
  const filteredData = sortedData.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.receiptCategory === selectedCategory;
    return matchesCategory;
  });

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Remove detectFileType and getCleanDataUrl as they are unused
  // Remove apiName and error where they are defined but never used

  // Remove fetchFileContent and update handlePreview to use base64 from data
  const handlePreview = (base64: string, fileType: string, fileName: string) => {
    let detectedType: 'image' | 'pdf' | 'unknown' = 'unknown';
    if (fileType.startsWith('image/')) detectedType = 'image';
    else if (fileType === 'application/pdf') detectedType = 'pdf';
    setPreviewModal({
      isOpen: true,
      fileUrl: `data:${fileType};base64,${base64}`,
      fileName: fileName,
      fileType: detectedType
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



  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
      const year = String(date.getFullYear()); // full year
      return `${day}-${month}-${year}`;
    } catch {
      return dateString;
    }
  };

  // Get receipt category label
  const getReceiptCategoryLabel = (category: string) => {
    switch (category) {
      case 'local': return 'Local Receipt';
      case 'import': return 'Import Document';
      case 'export': return 'Export Document';
      case 'custom': return 'Custom Document';
      default: return category;
    }
  };



  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const token = getToken();
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        setLoading(true);
        
        const decodedToken = jwtDecode(token) as DecodedToken;
        const userId = decodedToken.user_id;
        console.log(userId);

        // Fetch data from all APIs independently to handle failures gracefully
        const fetchApiData = async (apiUrl: string) => {
          try {
            const response = await axios.get(`${apiUrl}/${userId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
          } catch {
            return [];
          }
        };
        
        // Fetch from correct endpoints for each type
        const [localData, importData, exportData, customData] = await Promise.all([
          fetchApiData(local_data_fetch_api),
          fetchApiData(import_data_fetch_api),
          fetchApiData(export_data_fetch_api),
          fetchApiData(custom_data_fetch_api)
        ]);

        // Combine all data
        const allData: UserData[] = [];
        
        // Helper to map API response to UserData
        const mapApiData = (item: Record<string, unknown>, officeType: 'tax' | 'custom', receiptCategory: 'local' | 'import' | 'export' | 'custom'): UserData => {
          let mainBase64, mainFileType, attachmentBase64, attachmentFileType;
          if (receiptCategory === 'local') {
            mainBase64 = typeof item.mainLocalReceiptData === 'string' ? item.mainLocalReceiptData : undefined;
            mainFileType = typeof item.mainLocalReceipttype === 'string' ? item.mainLocalReceipttype : undefined;
            attachmentBase64 = typeof item.attachmentLocalReceiptData === 'string' ? item.attachmentLocalReceiptData : undefined;
            attachmentFileType = typeof item.attachmentLocalReceipttype === 'string' ? item.attachmentLocalReceipttype : undefined;
          } else if (receiptCategory === 'import') {
            mainBase64 = typeof item.mainImportOriginalDeclarationData === 'string' ? item.mainImportOriginalDeclarationData : undefined;
            mainFileType = typeof item.mainImportOriginalDeclarationType === 'string' ? item.mainImportOriginalDeclarationType : undefined;
            attachmentBase64 = typeof item.attachmentImportOriginalDeclarationData === 'string' ? item.attachmentImportOriginalDeclarationData : undefined;
            attachmentFileType = typeof item.attachmentImportOriginalDeclarationType === 'string' ? item.attachmentImportOriginalDeclarationType : undefined;
          } else if (receiptCategory === 'export') {
            mainBase64 = typeof item.mainExportOriginalDeclaration === 'string' ? item.mainExportOriginalDeclaration : undefined;
            mainFileType = typeof item.mainExportOriginalDeclarationType === 'string' ? item.mainExportOriginalDeclarationType : undefined;
            attachmentBase64 = typeof item.attachmentExportOriginalDeclaration === 'string' ? item.attachmentExportOriginalDeclaration : undefined;
            attachmentFileType = typeof item.attachmentExportOriginalDeclarationType === 'string' ? item.attachmentExportOriginalDeclarationType : undefined;
          } else {
            mainBase64 = undefined;
            mainFileType = undefined;
            attachmentBase64 = undefined;
            attachmentFileType = undefined;
          }
          return {
            id: typeof item.id === 'string' ? item.id : Math.random().toString(36).substr(2, 9),
            officeType,
            receiptCategory,
            hasWithholdingTax: item.hasWithholdingTax === 'yes' || item.hasWithholdingTax === 'no' ? item.hasWithholdingTax : 'no',
            paymentMethod: typeof item.paymentMethod === 'string' ? item.paymentMethod : '',
            bankName: typeof item.bankName === 'string' ? item.bankName : '',
            firstName: typeof item.firstName === 'string' ? item.firstName : '',
            calendarType: typeof item.calendarType === 'string' ? item.calendarType : '',
            receiptDate: typeof item.fileDate === 'string' ? item.fileDate : '',
            receipt_Number: typeof item.receipt_Number === 'string' ? item.receipt_Number : '',
            documents: {
              mainBase64,
              mainFileType,
              attachmentBase64,
              attachmentFileType,
              key: typeof item.id === 'string' ? item.id : Math.random().toString(36).substr(2, 9),
            },
            uploadedAt: typeof item.fileDate === 'string' ? item.fileDate : '',
            tin_number: typeof item.tin_number === 'string' ? item.tin_number : '',
            companyName: typeof item.companyName === 'string' ? item.companyName : '',
          };
        };
        
        // Process all data types
        [localData, importData, exportData, customData].forEach((apiData, index) => {
          const categories = ['local', 'import', 'export', 'custom'] as const;
          const officeTypes = ['tax', 'tax', 'tax', 'custom'] as const;
          
          if (apiData && Array.isArray(apiData)) {
            (apiData as Record<string, unknown>[]).forEach((item: Record<string, unknown>) => {
              allData.push(mapApiData(item, officeTypes[index], categories[index]));
            });
          }
        });

        setData(allData);
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchUserData:', err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.push('/auth/login');
          return;
        }
        // setError('Failed to fetch your upload history. Please try again later.'); // This line was removed
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload History</h1>
          <p className="text-gray-600">View all your uploaded documents</p>
        </div>

        {/* Filters */}
         <div className="bg-white rounded-lg shadow mb-6 p-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Remove search input from filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                             <select
                 value={selectedCategory}
                 onChange={(e) => setSelectedCategory(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
               >
                <option value="all">All Categories</option>
                <option value="local">Local Receipt</option>
                <option value="import">Import Document</option>
                <option value="export">Export Document</option>
                <option value="custom">Custom Document</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Total: {filteredData.length} documents
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredData.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                {data.length === 0 ? (
                  <div>
                    <p className="text-lg font-medium mb-2">No uploads found</p>
                    <p>You haven&apos;t uploaded any documents yet.</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">No matching results</p>
                    <p>Try adjusting your search criteria.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-4xl ml-0 rounded-lg shadow overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* Remove Document Info column */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Main
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attachment
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      {/* Remove Document Info cell */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-black">
                          {getReceiptCategoryLabel(item.receiptCategory)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.uploadedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {item.documents.mainBase64 ? (
                          <button
                            onClick={() => handlePreview(item.documents.mainBase64!, item.documents.mainFileType || 'unknown', 'Main Document')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {item.documents.attachmentBase64 ? (
                          <button
                            onClick={() => handlePreview(item.documents.attachmentBase64!, item.documents.attachmentFileType || 'unknown', 'Attachment')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Att.
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, filteredData.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredData.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Preview Modal */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">{previewModal.fileName}</h3>
                <button
                  onClick={closePreview}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="max-h-96 overflow-auto">
                {previewModal.fileType === 'image' ? (
                  <Image
                    src={previewModal.fileUrl}
                    alt={previewModal.fileName}
                    width={600}
                    height={384}
                    className="max-w-full h-auto"
                    style={{ maxHeight: '384px' }}
                  />
                ) : previewModal.fileType === 'pdf' ? (
                  <iframe
                    src={previewModal.fileUrl}
                    className="w-full h-96"
                    title={previewModal.fileName}
                  />
                                 ) : (
                   <div className="text-center py-8">
                     <p className="text-gray-500">Preview not available for this file type</p>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
