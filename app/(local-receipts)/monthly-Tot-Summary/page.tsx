"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DJANGO_BASE_URL } from '../api/api';
import { CompanyData, ReceiptData, FormReportResponse } from '../local-data-forms/types';
import { useAuth } from '../../Context/AuthContext';

const TOTSummaryPage: React.FC = () => {
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showAllMonths, setShowAllMonths] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 25;
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  const { token, user, isLoading: authLoading } = useAuth();

  // Parse JWT token to get company information
  const parseJwt = (token: string): any => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  // Get company data from token
  const getCompanyFromToken = () => {
    if (!token) return null;
    
    const payload = parseJwt(token);
    if (!payload) return null;

    return {
      tin_number: payload.tin_number || '',
      company_name: payload.company_name || '',
      email: payload.email || '',
      address: payload.address || ''
    };
  };

  // Get company information from token
  const companyFromToken = getCompanyFromToken();

  // Get paginated TOT items
  const getPaginatedTOTItems = () => {
    const allTOTItems = filteredReceipts.flatMap(r => (r.items || []).map((item: any) => ({ 
      ...item, 
      receiptNumber: r.receipt_number,
      receipt_date: r.receipt_date || r.created_at
    }))).filter((item: any) => {
      const lineTax = (item?.tax_type ?? '').toString().toUpperCase();
      const nestedTax = (item?.item?.tax_type ?? '').toString().toUpperCase();
      return lineTax === 'TOT' || nestedTax === 'TOT';
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      items: allTOTItems.slice(startIndex, endIndex),
      totalItems: allTOTItems.length,
      totalPages: Math.ceil(allTOTItems.length / itemsPerPage)
    };
  };

    // Get all TOT items for summary calculations
  const getAllTOTItems = () => {
    return filteredReceipts.flatMap(r => (r.items || []).map((item: any) => ({ 
      ...item, 
      receiptNumber: r.receipt_number,
      receipt_date: r.receipt_date || r.created_at
    }))).filter((item: any) => {
      const lineTax = (item?.tax_type ?? '').toString().toUpperCase();
      const nestedTax = (item?.item?.tax_type ?? '').toString().toUpperCase();
      return lineTax === 'TOT' || nestedTax === 'TOT';
    });
  };

  // Generate and download PDF
  const downloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      console.log('Starting PDF generation...');
      
      const { totalItems, totalPages } = getPaginatedTOTItems();
      console.log('Total items:', totalItems, 'Total pages:', totalPages);
      
      if (totalItems === 0) {
        alert('No TOT data available to download');
        return;
      }

      // Dynamically import jsPDF
      console.log('Loading PDF library...');
      const { default: jsPDF } = await import('jspdf');
      
      console.log('Creating PDF document...');
      const doc = new jsPDF();
      
      // Basic PDF content
      doc.setFontSize(18);
      doc.text('TOT Report Summary', 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);
      doc.text(`Period: ${showAllMonths ? `${selectedYear}` : `${new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}`}`, 20, 50);
      
      if (companyFromToken) {
        doc.text(`Company: ${companyFromToken.company_name || 'N/A'}`, 20, 70);
        doc.text(`TIN: ${companyFromToken.tin_number || 'N/A'}`, 20, 80);
        doc.text(`Address: ${companyFromToken.address || 'N/A'}`, 20, 90);
      }
      
      doc.text(`Total TOT Items: ${totalItems}`, 20, 110);
      
      // Generate filename
      const date = new Date();
      const filename = `TOT_Report_${selectedYear}_${selectedMonth}_${date.getFullYear()}_${(date.getMonth() + 1).toString().padStart(2, '0')}_${date.getDate().toString().padStart(2, '0')}.pdf`;
      
      console.log('Saving PDF with filename:', filename);
      doc.save(filename);
      
      console.log('PDF generated and saved successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error.message}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Download full table data as CSV
  const downloadTableData = () => {
    try {
      const allTOTItems = getAllTOTItems();
      
      if (allTOTItems.length === 0) {
        alert('No TOT data available to download');
        return;
      }

      // Helper function to format date
      const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
          const date = new Date(dateString);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        } catch {
          return dateString;
        }
      };

      // Prepare CSV data
      const csvHeaders = [
        'Receipt Number',
        'Receipt Date',
        'Item Description',
        'Quantity',
        'Unit Price',
        'Subtotal',
        'Tax Amount',
        'Total After Tax',
        'Tax Type',
        'Company Name',
        'TIN Number'
      ];

      const csvData = allTOTItems.map((item: any) => [
        item.receiptNumber || 'N/A',
        formatDate(item.receipt_date),
        item.item?.item_description || 'Unknown Item',
        item.quantity || 0,
        item.unit_price || 0,
        Number(item.subtotal || 0).toFixed(2),
        Number(item.tax_amount || 0).toFixed(2),
        Number(item.total_after_tax || 0).toFixed(2),
        item.tax_type || 'TOT',
        companyFromToken?.company_name || 'N/A',
        companyFromToken?.tin_number || 'N/A'
      ]);

      // Add summary row
      const totalSubtotal = allTOTItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
      const totalTaxAmount = allTOTItems.reduce((sum, item) => sum + Number(item.tax_amount || 0), 0);
      const totalAfterTax = allTOTItems.reduce((sum, item) => sum + Number(item.total_after_tax || 0), 0);
      
      const summaryRow = [
        'TOTAL',
        '',
        '',
        '',
        '',
        totalSubtotal.toFixed(2),
        totalTaxAmount.toFixed(2),
        totalAfterTax.toFixed(2),
        '',
        '',
        ''
      ];

      // Add metadata section
      const metadataRows = [
        ['TOT Report - Table Data Export'],
        [''],
        ['Report Period:', showAllMonths ? `${selectedYear}` : `${new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}`],
        ['Generated On:', new Date().toLocaleDateString()],
        [''],
        ['Company Information:'],
        ['Company Name:', companyFromToken?.company_name || 'N/A'],
        ['TIN Number:', companyFromToken?.tin_number || 'N/A'],
        ['Address:', companyFromToken?.address || 'N/A'],
        [''],
        ['Total TOT Items:', allTOTItems.length.toString()],
        [''],
        [''] // Empty row before data
      ];

      // Combine metadata, headers, data, and summary
      const csvContent = [...metadataRows, csvHeaders, ...csvData, summaryRow]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        
        // Generate filename
        const date = new Date();
        const filename = `TOT_Table_Data_${selectedYear}_${selectedMonth}_${date.getFullYear()}_${(date.getMonth() + 1).toString().padStart(2, '0')}_${date.getDate().toString().padStart(2, '0')}.csv`;
        link.setAttribute('download', filename);
        
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('CSV file downloaded successfully!');
      } else {
        // Fallback for browsers that don't support download
        alert('Your browser does not support automatic download. Please copy the data manually.');
        console.log('CSV Content:', csvContent);
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert(`Error downloading CSV: ${error.message}`);
    }
  };

  // TOT Report Page Component
  const TOTReportPage: React.FC<{ pageNumber: number; items: any[] }> = ({ pageNumber, items }) => (
    <div className="p-6 md:p-8 bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl ring-1 ring-black/5 text-black mb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-black">TOT Report Summary</h1>
        <div className="flex gap-2">
          <button
            onClick={downloadPDF}
            disabled={getPaginatedTOTItems().totalItems === 0 || isGeneratingPDF}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isGeneratingPDF ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </>
            )}
          </button>
          <button
            onClick={downloadTableData}
            disabled={getAllTOTItems().length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Download CSV
          </button>
        </div>
      </div>

      {/* Taxpayer Details Section */}
      <div className="mb-6 border border-gray-200/70 bg-white/70 rounded-lg p-4">
        <h2 className="font-semibold mb-2">Taxpayer Details</h2>
        {authLoading ? (
          <div className="text-gray-500">Loading user information...</div>
        ) : !user ? (
          <div className="text-red-500">User not authenticated</div>
        ) : !companyFromToken ? (
          <div className="text-red-500">Company information not available in token</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div><span className="font-medium">Name:</span> {companyFromToken.company_name || 'N/A'}</div>
            <div><span className="font-medium">TIN:</span> {companyFromToken.tin_number || 'N/A'}</div>
            <div><span className="font-medium">Address:</span> {companyFromToken.address || 'N/A'}</div>
            <div><span className="font-medium">Page:</span> {pageNumber}</div>
          </div>
        )}
      </div>

      {/* TOT Summary Table */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">A. TOT Summary Table</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200/70 bg-white/70">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100/70">
                <th className="border px-2 py-1">Receipt Number</th>
                <th className="border px-2 py-1">Item</th>
                <th className="border px-2 py-1">Total</th>
                <th className="border px-2 py-1">TOT Tax</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="border px-2 py-1">{item.receiptNumber || 'N/A'}</td>
                  <td className="border px-2 py-1">{item.item?.item_description || 'Unknown Item'}</td>
                  <td className="border px-2 py-1">{Number(item.subtotal || 0).toFixed(2)}</td>
                  <td className="border px-2 py-1">{Number(item.tax_amount || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calculations/summary section */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">B. Calculations / Summary</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200/70 bg-white/70">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100/70">
                <th className="border px-2 py-1">Description</th>
                <th className="border px-2 py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-1">Total TOT Items</td>
                <td className="border px-2 py-1">{getAllTOTItems().length}</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Total TOT Amount</td>
                <td className="border px-2 py-1">
                  {getAllTOTItems().reduce((sum, item) => sum + Number(item.total_after_tax || 0), 0).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Total TOT Tax</td>
                <td className="border px-2 py-1">
                  {getAllTOTItems().reduce((sum, item) => sum + Number(item.tax_amount || 0), 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Signature/Date Section */}
      <div className="flex justify-between mt-8">
        <div>
          <div className="font-medium">Prepared by:</div>
          <div className="mt-8 border-t w-40"></div>
        </div>
        <div>
          <div className="font-medium">Checked by:</div>
          <div className="mt-8 border-t w-40"></div>
        </div>
        <div>
          <div className="font-medium">Date:</div>
          <div className="mt-8 border-t w-32"></div>
        </div>
      </div>
    </div>
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, selectedYear, showAllMonths]);

  useEffect(() => {
    if (token && user) {
      console.log('User data:', user);
      console.log('Company data:', user.company);
      fetchReceipts();
    }
    // eslint-disable-next-line
  }, [token, user]);

  const fetchReceipts = async () => {
    setLoading(true);
    setError(null);
          try {
        const response = await axios.get<FormReportResponse>(
          `${DJANGO_BASE_URL}/receipts?tax_type=TOT`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
      if (response.data.results) {
        setReceipts(response.data.results);
        filterTOTReceipts(response.data.results, selectedMonth, selectedYear);


        
      } else {
        setError('Failed to fetch receipt data');
      }
    } catch (err) {
      setError('Error fetching receipt data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterTOTReceipts = (receiptsData: ReceiptData[], month: number, year: number) => {
    const filtered = receiptsData.filter((receipt) => {
      const dateString = receipt.receipt_date || (receipt as any).created_at || '';
      const receiptDate = new Date(dateString);
      const receiptYear = receiptDate.getFullYear();
      const receiptMonth = receiptDate.getMonth() + 1;
      // Only include Revenue receipts with any item's tax_type 'TOT'
      const isRevenue = (receipt.receipt_category || '').toLowerCase() === 'revenue';
      const hasTOTItem = Array.isArray(receipt.items) && receipt.items.some((lineItem: any) => {
        const lineTax = (lineItem?.tax_type ?? '').toString().toUpperCase();
        const nestedTax = (lineItem?.item?.tax_type ?? '').toString().toUpperCase();
        return lineTax === 'TOT' || nestedTax === 'TOT';
      });
      const matchesDate = showAllMonths ? receiptYear === year : (receiptYear === year && receiptMonth === month);
      return matchesDate && isRevenue && hasTOTItem;
    });
    setFilteredReceipts(filtered);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value, 10);
    setSelectedMonth(month);
    filterTOTReceipts(receipts, month, selectedYear);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value, 10);
    setSelectedYear(year);
    filterTOTReceipts(receipts, selectedMonth, year);
  };

  const handleShowAllMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setShowAllMonths(checked);
    filterTOTReceipts(receipts, selectedMonth, selectedYear);
  };

  // Placeholder for summary calculations
  // You can expand this logic to match the form's requirements

  // Show loading state while authentication is loading
  if (authLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-2xl mb-4">⚠️</div>
            <p className="text-lg text-gray-600">Please log in to view this page</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50">
      {/* Decorative blurred shapes */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-purple-300/30 blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        {/* Filters Section */}
        <div className="p-6 md:p-8 bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl ring-1 ring-black/5 text-black mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-black">TOT Report Filters</h2>
          
          <div className="flex gap-4 justify-center items-end flex-wrap">
            <div>
              <label className="block text-sm font-medium">Month</label>
              <select value={selectedMonth} onChange={handleMonthChange} className="border rounded px-2 py-1">
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Year</label>
              <select value={selectedYear} onChange={handleYearChange} className="border rounded px-2 py-1">
                {[...Array(6)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
            <label className="flex items-center space-x-2 text-sm">
              <input type="checkbox" checked={showAllMonths} onChange={handleShowAllMonthsChange} className="rounded border-gray-300" />
              <span>Show all months</span>
            </label>
            <button
              onClick={downloadPDF}
              disabled={getPaginatedTOTItems().totalItems === 0 || isGeneratingPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
            <button
              onClick={downloadTableData}
              disabled={getAllTOTItems().length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Download CSV
            </button>
          </div>

          {/* Pagination Controls */}
          {(() => {
            const { totalItems, totalPages } = getPaginatedTOTItems();
            if (totalItems > itemsPerPage) {
              return (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Total: {totalItems} items across {totalPages} pages
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 text-sm border rounded ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Render TOT Report Pages */}
        {(() => {
          const { items, totalPages } = getPaginatedTOTItems();
          if (totalPages === 0) {
            return (
              <div className="p-6 md:p-8 bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl ring-1 ring-black/5 text-black text-center">
                <h2 className="text-xl font-semibold mb-4">No TOT Data Found</h2>
                <p className="text-gray-600">No TOT receipts found for the selected period.</p>
              </div>
            );
          }
          
          return (
            <TOTReportPage 
              pageNumber={currentPage} 
              items={items} 
            />
          );
        })()}
      </div>
    </div>
  );
};

export default TOTSummaryPage;