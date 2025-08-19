'use client';

import React, { useState } from 'react';
import { getDocumentUrl } from './page';

interface DocumentViewerProps {
  mainReceiptUrl?: string;
  attachmentUrl?: string;
  withholdingReceiptUrl?: string;
  receiptNumber: string;
  receiptDate: string;
  hasWithholding: boolean;
}

export default function DocumentViewer({
  mainReceiptUrl,
  attachmentUrl,
  withholdingReceiptUrl,
  receiptNumber,
  receiptDate,
  hasWithholding
}: DocumentViewerProps) {
  const [activeDocument, setActiveDocument] = useState<'main' | 'attachment' | 'withholding'>('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get the available documents
  const availableDocuments = [
    ...(mainReceiptUrl ? [{ key: 'main' as const, label: 'Main Receipt', url: mainReceiptUrl }] : []),
    ...(attachmentUrl ? [{ key: 'attachment' as const, label: 'Attachment', url: attachmentUrl }] : []),
    ...(withholdingReceiptUrl ? [{ key: 'withholding' as const, label: 'Withholding Receipt', url: withholdingReceiptUrl }] : []),
  ];

  // Set default active document to the first available one
  React.useEffect(() => {
    if (availableDocuments.length > 0 && !availableDocuments.find(doc => doc.key === activeDocument)) {
      setActiveDocument(availableDocuments[0].key);
    }
  }, [availableDocuments, activeDocument]);

  const getCurrentDocumentUrl = () => {
    const activeDoc = availableDocuments.find(doc => doc.key === activeDocument);
    if (!activeDoc) return '';
    
    const originalUrl = activeDoc.url;
    
    // Debug logging
    console.log('DocumentViewer URL Debug:', {
      documentType: activeDoc.key,
      originalUrl,
      startsWithHttps: originalUrl.startsWith('https'),
      startsWithMedia: originalUrl.startsWith('/media/') || originalUrl.startsWith('media/'),
      startsWithApi: originalUrl.startsWith('/api/')
    });
    
    // If the URL is already a full URL, use it directly
    if (originalUrl.startsWith('http')) {
      return originalUrl;
    }
    
    return getDocumentUrl(originalUrl);
  };

  const isImageFile = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '');
  };

  const isPdfFile = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    return extension === 'pdf';
  };

  const handleDocumentLoad = () => {
    setLoading(false);
    setError('');
  };

  const handleDocumentError = () => {
    setLoading(false);
    setError('Failed to load document');
  };

  const currentUrl = getCurrentDocumentUrl();

  if (availableDocuments.length === 0) {
    return (
      <div className="h-full flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Receipt #{receiptNumber || 'N/A'}</h3>
              <p className="text-sm text-gray-600">
                {receiptDate && receiptDate !== 'undefined' && receiptDate !== '' 
                  ? new Date(receiptDate).toLocaleDateString() 
                  : 'Upload date not shown - enter date manually in form'}
              </p>
            </div>
            {hasWithholding && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Has Withholding
              </span>
            )}
          </div>
        </div>

        {/* No Documents Content */}
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Available</h3>
            <p className="text-gray-500 mb-2">No documents were uploaded for this receipt.</p>
            <p className="text-sm text-gray-400">
              You can still use the form on the right to enter receipt data manually.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to render a document viewer
  const renderDocument = (url: string, label: string) => {
    if (!url) return null;

    const documentUrl = getDocumentUrl(url);
    
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="flex-shrink-0 p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
        </div>
        
        <div className="flex-1 overflow-auto relative min-h-0">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-600 font-medium">{error}</p>
                <button
                  onClick={() => {
                    setError('');
                    setLoading(true);
                  }}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {documentUrl && (
            <div className="min-h-0 flex-1">
              {isImageFile(documentUrl) ? (
                <div className="p-4 h-full overflow-auto">
                  <img
                    src={documentUrl}
                    alt={label}
                    className="max-w-full max-h-full object-contain mx-auto shadow-lg rounded-lg"
                    onLoad={handleDocumentLoad}
                    onError={handleDocumentError}
                    style={{ display: loading ? 'none' : 'block' }}
                  />
                </div>
              ) : isPdfFile(documentUrl) ? (
                <div className="h-full min-h-0">
                  <iframe
                    src={documentUrl}
                    className="w-full h-full min-h-[70vh] border-0"
                    title={label}
                    onLoad={handleDocumentLoad}
                    onError={handleDocumentError}
                    style={{ display: loading ? 'none' : 'block' }}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600 font-medium mb-2">Preview not available</p>
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Download Document
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 p-4">
          <div className="flex items-center justify-end space-x-2">
            {documentUrl && (
              <>
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in New Tab
                </a>
                <a
                  href={documentUrl}
                  download
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Receipt #{receiptNumber || 'N/A'}</h3>
            <p className="text-sm text-gray-600">
              {receiptDate && receiptDate !== 'undefined' && receiptDate !== '' 
                ? new Date(receiptDate).toLocaleDateString() 
                : 'Upload date not shown - enter date manually in form'}
            </p>
          </div>
          {hasWithholding && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Has Withholding
            </span>
          )}
        </div>
      </div>

      {/* Document Content - Split view for withholding */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Main Receipt */}
        <div className={`flex-1 overflow-y-auto min-h-0 ${hasWithholding && withholdingReceiptUrl ? 'lg:border-r border-gray-200' : ''}`}>
          {mainReceiptUrl && renderDocument(mainReceiptUrl, 'Main Receipt')}
        </div>

        {/* Withholding Receipt */}
        {hasWithholding && withholdingReceiptUrl && (
          <div className="flex-1 overflow-y-auto min-h-0 border-t lg:border-t-0 border-gray-200">
            {renderDocument(withholdingReceiptUrl, 'Withholding Receipt')}
          </div>
        )}
      </div>
    </div>
  );
}
