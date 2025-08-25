'use client';

import React, { useState } from 'react';
import { natureCodeMappings } from '../constants';
import { formatCurrency } from '../utils';
import { VATSummaryData } from '../types';

interface DetailedBreakdownProps {
  vatSummary: { [key: string]: VATSummaryData };
  showDetailedBreakdown: boolean;
  globalPage?: number;
  receiptsPerPage?: number;
}

const DetailedBreakdown: React.FC<DetailedBreakdownProps> = ({
  vatSummary,
  showDetailedBreakdown,
  globalPage,
  receiptsPerPage
}) => {
  const PAGE_SIZE = receiptsPerPage || 10;
  const [pageByNature, setPageByNature] = useState<{ [key: string]: number }>({});

  const getPage = (natureCode: string): number => {
    const current = pageByNature[natureCode] || 1;
    return current < 1 ? 1 : current;
  };

  const setPage = (natureCode: string, page: number) => {
    setPageByNature(prev => ({ ...prev, [natureCode]: page }));
  };
  if (!showDetailedBreakdown) {
    return null;
  }

  // Global page sync while keeping nature-grouped sections
  if (globalPage) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Receipt Breakdown by Nature Code</h3>
        </div>
        <div className="p-6">
          {Object.entries(vatSummary).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(vatSummary).map(([natureCode, data]) => {
                const mapping = natureCodeMappings[natureCode];
                const totalItems = data.receipts
                  .flatMap(receipt => receipt.items.filter(item => item.item.nature === natureCode)).length;
                const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
                const currentPage = Math.min(globalPage, totalPages);
                const startIndex = (currentPage - 1) * PAGE_SIZE;
                const endIndex = startIndex + PAGE_SIZE;
                return (
                  <div key={natureCode} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          Nature Code {natureCode}: {mapping?.label || 'Unknown'}
                        </h4>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(data.total)}</p>
                        <p className="text-sm text-gray-600">VAT Amount</p>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(data.vat)}</p>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Description</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tax Type</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">VAT</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {data.receipts.map(receipt => 
                            receipt.items
                              .filter(item => item.item.nature === natureCode)
                              .map(item => {
                                const taxType = item.tax_type || item.item.tax_type;
                                const isTOT = taxType === 'TOT';
                                const isVATType = taxType === 'VAT' || !taxType; // Consider empty/null as VAT
                                const isExempted = taxType === 'EXEMPTED' || taxType === 'EXEMPT';
                                const displayAmount = isTOT ? Number(item.subtotal) + Number(item.tax_amount) : Number(item.subtotal);
                                
                                // Only show VAT amount for VAT tax type items
                                const displayVATAmount = isVATType ? Number(item.tax_amount) : 0;
                                
                                return (
                                  <tr key={`${receipt.id}-${item.id}`} className={
                                    isTOT ? 'bg-yellow-50' : 
                                    isExempted ? 'bg-gray-50' : 
                                    isVATType ? 'bg-green-50' : ''
                                  }>
                                    <td className="px-4 py-2 text-sm text-gray-900">{receipt.receipt_number}</td>
                                    <td className="px-4 py-2 text-sm text-gray-900">{receipt.receipt_date}</td>
                                    <td className="px-4 py-2 text-sm text-gray-900">{receipt.receipt_category}</td>
                                    <td className="px-4 py-2 text-sm text-gray-900">{item.item.item_description}</td>
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        isTOT ? 'bg-yellow-100 text-yellow-800' : 
                                        isExempted ? 'bg-gray-100 text-gray-800' :
                                        isVATType ? 'bg-green-100 text-green-800' :
                                        'bg-blue-100 text-blue-800'
                                      }`}>
                                        {taxType || 'VAT'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(displayAmount)}</td>
                                    <td className="px-4 py-2 text-sm text-blue-600">
                                      {isVATType ? formatCurrency(displayVATAmount) : (
                                        <span className="text-gray-400 italic">
                                          {isExempted ? 'Exempt' : 'N/A'}
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                          )
                          .flat()
                          .slice(startIndex, endIndex)
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No data found for the selected period.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default grouped-by-nature mode
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Detailed Receipt Breakdown by Nature Code</h3>
      </div>
      <div className="p-6">
        {Object.entries(vatSummary).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(vatSummary).map(([natureCode, data]) => {
              const mapping = natureCodeMappings[natureCode];
              const totalItems = data.receipts
                .flatMap(receipt => receipt.items.filter(item => item.item.nature === natureCode)).length;
              const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
              const currentPage = Math.min(getPage(natureCode), totalPages);
              const startIndex = (currentPage - 1) * PAGE_SIZE;
              const endIndex = startIndex + PAGE_SIZE;
              return (
                <div key={natureCode} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Nature Code {natureCode}: {mapping?.label || 'Unknown'}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(data.total)}</p>
                      <p className="text-sm text-gray-600">VAT Amount</p>
                      <p className="text-lg font-bold text-blue-600">{formatCurrency(data.vat)}</p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Description</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tax Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">VAT</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.receipts.map(receipt => 
                          receipt.items
                            .filter(item => item.item.nature === natureCode)
                            .map(item => {
                              const taxType = item.tax_type || item.item.tax_type;
                              const isTOT = taxType === 'TOT';
                              const isVATType = taxType === 'VAT' || !taxType; // Consider empty/null as VAT
                              const isExempted = taxType === 'EXEMPTED' || taxType === 'EXEMPT';
                              const displayAmount = isTOT ? Number(item.subtotal) + Number(item.tax_amount) : Number(item.subtotal);
                              
                              // Only show VAT amount for VAT tax type items
                              const displayVATAmount = isVATType ? Number(item.tax_amount) : 0;
                              
                              return (
                                <tr key={`${receipt.id}-${item.id}`} className={
                                  isTOT ? 'bg-yellow-50' : 
                                  isExempted ? 'bg-gray-50' : 
                                  isVATType ? 'bg-green-50' : ''
                                }>
                                  <td className="px-4 py-2 text-sm text-gray-900">{receipt.receipt_number}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900">{receipt.receipt_date}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900">{receipt.receipt_category}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900">{item.item.item_description}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      isTOT ? 'bg-yellow-100 text-yellow-800' : 
                                      isExempted ? 'bg-gray-100 text-gray-800' :
                                      isVATType ? 'bg-green-100 text-green-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {taxType || 'VAT'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(displayAmount)}</td>
                                  <td className="px-4 py-2 text-sm text-blue-600">
                                    {isVATType ? formatCurrency(displayVATAmount) : (
                                      <span className="text-gray-400 italic">
                                        {isExempted ? 'Exempt' : 'N/A'}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                        )
                        .flat()
                        .slice(startIndex, endIndex)
                        }
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => setPage(natureCode, Math.max(1, currentPage - 1))}
                        disabled={currentPage <= 1}
                        className="px-3 py-1 rounded-md text-sm bg-gray-100 text-gray-700 disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setPage(natureCode, Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage >= totalPages}
                        className="px-3 py-1 rounded-md text-sm bg-gray-100 text-gray-700 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No data found for the selected period.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailedBreakdown;
