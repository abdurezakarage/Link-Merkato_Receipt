
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../Context/AuthContext';
import ProtectedRoute from '../../Context/ProtectedRoute';
import { DJANGO_BASE_URL } from '../api/api';
import { SPRING_BASE_URL } from '@/app/(local-receipts)/api/api';

export interface DocumentRecord {
  id: number;
  document_type: 'main' | 'withholding' | 'attachment';
  receipt_number: string;
  company_tin: string;
  uploaded_at: string;
  file_url: string;
  status: string;
  has_attachment: boolean;
  main_document_id: number;
  withholding_document_id: number | null;
}

export interface DocumentsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DocumentRecord[];
  summary: {
    total_documents: number;
    main_receipts: number;
    withholding_receipts: number;
    statuses: {
      uploaded: number;
      processed: number;
      rejected: number;
    };
  };
}

export interface GroupedDocument {
  receipt_number: string;
  main_document?: DocumentRecord;
  withholding_document?: DocumentRecord;
  attachment_document?: DocumentRecord;
  has_withholding: boolean;
  uploaded_at: string;
}

export const fetchLocalDocuments = async (token: string, tinNumber: string): Promise<GroupedDocument[]> => {
  try {
    const response = await axios.get<DocumentsApiResponse>(`${DJANGO_BASE_URL}/get-documents`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    // Debug logging for API response
    console.log('API Response Debug:', {
      totalDocuments: response.data.results.length,
      sampleDocuments: response.data.results.slice(0, 3).map(doc => ({
        id: doc.id,
        document_type: doc.document_type,
        receipt_number: doc.receipt_number,
        file_url: doc.file_url,
        file_url_type: typeof doc.file_url,
        file_url_length: doc.file_url?.length || 0
      }))
    });
    
    // Group documents by receipt_number
    return groupDocumentsByReceipt(response.data.results);
  } catch (error) {
    console.error('Error fetching local documents:', error);
    throw error;
  }
};

// Helper function to group documents by receipt number
const groupDocumentsByReceipt = (documents: DocumentRecord[]): GroupedDocument[] => {
  const grouped = documents.reduce((acc, doc) => {
    const key = doc.receipt_number;
    
    if (!acc[key]) {
      acc[key] = {
        receipt_number: doc.receipt_number,
        has_withholding: false,
        uploaded_at: doc.uploaded_at
      };
    }
    
    // Update uploaded_at to the most recent
    if (new Date(doc.uploaded_at) > new Date(acc[key].uploaded_at)) {
      acc[key].uploaded_at = doc.uploaded_at;
    }
    
    // Assign documents by type
    switch (doc.document_type) {
      case 'main':
        acc[key].main_document = doc;
        break;
      case 'withholding':
        acc[key].withholding_document = doc;
        acc[key].has_withholding = true;
        break;
      case 'attachment':
        acc[key].attachment_document = doc;
        break;
    }
    
    return acc;
  }, {} as Record<string, GroupedDocument>);
  
  // Convert to array and sort by uploaded_at (most recent first)
  return Object.values(grouped).sort((a, b) => 
    new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
  );
};

export const getDocumentUrl = (documentPath: string): string => {
  if (!documentPath) {
    console.log('getDocumentUrl: Empty documentPath provided');
    return '';
  }
  
  // If the path is already a full URL, return it
  if (documentPath.startsWith('https')) {
    console.log('getDocumentUrl: Full URL detected, returning as-is:', documentPath);
    return documentPath;
  }
  
  // Media files are served directly from the domain root, not through the /api path
  // Remove the /api part from DJANGO_BASE_URL for media files
  const MEDIA_BASE_URL = DJANGO_BASE_URL.replace(/\/api$/, '') + '/';
  
  // Remove leading slashes and construct the full URL
  const sanitizedPath = documentPath.replace(/^\/+/, '');
  const fullUrl = `${MEDIA_BASE_URL}${sanitizedPath}`;
  
  console.log('getDocumentUrl: URL construction:', { 
    documentPath, 
    sanitizedPath, 
    DJANGO_BASE_URL,
    MEDIA_BASE_URL, 
    fullUrl 
  });
  
  return fullUrl;
};

export default function LocalDocumentPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<GroupedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Token validation function
  const isTokenValid = useCallback(() => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (e) {
      return false;
    }
  }, [token]);

  // Parse JWT token to get company information
  const parseJwt = (token: string): any => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  // Fetch documents when component mounts
  useEffect(() => {
    const loadDocuments = async () => {
      if (!token || !isTokenValid()) {
        setError('Invalid or missing token');
        setLoading(false);
        return;
      }

      try {
        const payload = parseJwt(token);
        const tinNumber = payload?.company_data?.tin_number || payload?.tin_number;
        
        if (!tinNumber) {
          setError('TIN number not found in token');
          setLoading(false);
          return;
        }

        const fetchedDocuments = await fetchLocalDocuments(token, tinNumber);
        setDocuments(fetchedDocuments);
      } catch (err) {
        console.error('Error loading documents:', err);
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      loadDocuments();
    }
  }, [token, isLoading, isTokenValid]);

  // Handle document selection and navigation
  const handleDocumentSelect = (document: GroupedDocument) => {
    // Navigate to localReceipt page with document data
    const params = new URLSearchParams({
      documentId: document.main_document?.id.toString() || '',
      receiptNumber: document.receipt_number || '',
      mainReceiptUrl: document.main_document?.file_url || '',
      attachmentUrl: document.attachment_document?.file_url || '',
      withholdingReceiptUrl: document.withholding_document?.file_url || '',
      hasWithholding: document.has_withholding.toString(),
    });
    
    router.push(`/localReceipt?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'undefined' || dateString === '') {
      return 'Date not available';
    }
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7faff] to-[#f3f6fd]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Local Documents</h1>
            <p className="text-gray-600">Select a document to fill out the receipt form</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading documents...</p>
            </div>
          )}

          {/* Documents Grid */}
          {!loading && !error && (
            <>
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
                  <p className="text-gray-500">No local documents have been uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.map((document) => (
                    <div
                      key={document.receipt_number}
                      onClick={() => handleDocumentSelect(document)}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                      {/* Document Icon */}
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>

                      {/* Document Details */}
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                        Receipt #{document.receipt_number}
                      </h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0V5a1 1 0 011-1h4a1 1 0 011 1v2M5 7h14l-1 10H6L5 7z" />
                          </svg>
                          {formatDate(document.uploaded_at)}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {document.has_withholding ? 'Has Withholding' : 'No Withholding'}
                        </div>
                      </div>

                      {/* Available Documents */}
                      <div className="space-y-1 mb-4">
                        {document.main_document && (
                          <div className="flex items-center text-xs text-green-600">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Main Receipt ({document.main_document.status})
                          </div>
                        )}
                        {document.attachment_document && (
                          <div className="flex items-center text-xs text-green-600">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Attachment ({document.attachment_document.status})
                          </div>
                        )}
                        {document.withholding_document && (
                          <div className="flex items-center text-xs text-green-600">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Withholding Receipt ({document.withholding_document.status})
                          </div>
                        )}
                      </div>

                      {/* Action Prompt */}
                      <div className="text-xs text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                        Click to fill receipt form →
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}