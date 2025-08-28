"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DJANGO_BASE_URL } from '../api/api';
import { CompanyData, ReceiptData, FormReportResponse } from '../local-data-forms/types';
import { useAuth } from '../../Context/AuthContext';


interface WithholdingData {
  type: string;
  source: string;
  receipt_number: string;
  date: string;
  supplier: string;
  tin: string;
  description: string;
  subtotal: string;
  withholding_amount: string;
  recorded_by: string;
  buyer_tin: string;
}

interface WithholdingReport {
  report_type: string;
  description: string;
  total_records: number;
  total_withholding_amount: string;
  data: WithholdingData[];
}

export default function WithholdingReportPage() {
    const [receipts, setReceipts] = useState<WithholdingData[]>([]);
    const [reportData, setReportData] = useState<WithholdingReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredReceipts, setFilteredReceipts] = useState<WithholdingData[]>([]);

  const { token, user, isLoading: authLoading } = useAuth();

    // Parse JWT token to get company information
    const parseJwt = (token: string): any => {
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch (e) {
        return null;
      }
    };

  const decodedToken = parseJwt(token);
  const company = decodedToken?.company_name;
  const tin = decodedToken?.tin_number;
  const company_address = decodedToken?.Region;
const Phone_number = decodedToken?.PhoneNumber;
const woreda = decodedToken?.Wereda;


    //get withholding receipts
    const getWithholdingReceipts = async () => {
      try {
          setLoading(true);
        const response = await axios.get(`${DJANGO_BASE_URL}/reports/revenue-withholding`);
          // Store the full report data
          setReportData(response.data);
          // Extract the data array from the response
          const receiptsData = response.data?.data || [];
          setReceipts(receiptsData);
          // Apply current date filters to the data
          applyDateFiltering(receiptsData);
      } catch (error) {
        setError('Failed to fetch withholding receipts');
          setReceipts([]); // Set empty array on error
          setFilteredReceipts([]);
          setReportData(null);
        } finally {
          setLoading(false);
        }
      };

      // Apply date filtering to receipts
      const applyDateFiltering = (receiptsData = receipts) => {
        if (!startDate && !endDate) {
          setFilteredReceipts(receiptsData);
          return;
        }

        const filtered = receiptsData.filter(receipt => {
          const receiptDate = new Date(receipt.date);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;

          if (start && end) {
            return receiptDate >= start && receiptDate <= end;
          } else if (start) {
            return receiptDate >= start;
          } else if (end) {
            return receiptDate <= end;
          }
          return true;
        });

        setFilteredReceipts(filtered);
      };

      // Handle date filter application
      const applyDateFilter = () => {
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
          setError('Start date cannot be after end date');
          return;
        }
        setError(null);
        applyDateFiltering();
      };

      // Clear date filters
      const clearDateFilter = () => {
        setStartDate('');
        setEndDate('');
        setError(null);
        setFilteredReceipts(receipts);
      };

      // Custom print function for the form only
      const handlePrint = () => {
        const printContent = document.getElementById('withholding-form');
        if (printContent) {
          const originalContent = document.body.innerHTML;
          const printableContent = printContent.innerHTML;
          
          document.body.innerHTML = `
            <div style="margin: 0; padding: 20px; font-family: Arial, sans-serif;">
              ${printableContent}
            </div>
          `;
          
          window.print();
          document.body.innerHTML = originalContent;
          window.location.reload(); // Reload to restore React event handlers
        }
      };
      useEffect(() => {
        if (token) {
          getWithholdingReceipts();
        }
      }, [token]);

      // Auto-filter when date values change
      useEffect(() => {
        if (receipts.length > 0) {
          applyDateFiltering();
        }
      }, [startDate, endDate, receipts]);

      // Don't render until we have the token
      if (authLoading || !token) {
        return <div>Loading...</div>;
      }

  return (
        <div className="min-h-screen bg-gray-50 p-4 print:bg-white print:p-0 text-black">
          <div className="max-w-7xl mx-auto bg-white shadow-lg print:shadow-none print:max-w-none print:mx-0">
            {/* Header Section */}
            <div id="withholding-form" className="border-2 border-black p-4 print:border-1">
              <div className="flex justify-between items-center mb-4">
                <div className="text-center flex-1">
                  <h1 className="text-xl font-bold">MINISTRY OF REVENUE</h1>
                  <div className="mt-2">
                    <h2 className="text-lg font-semibold">Withholding Tax On Payment Declaration</h2>
                    <p className="text-sm">(Income Tax Proclamation No. 286/2002 & Income Tax Regulation No. 78/2002)</p>
                  </div>
                </div>
              </div>

              {/* Section 1: Taxpayer Information */}
              {/* Compact Date Filter */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 print:hidden">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Filter by Date:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                    placeholder="Start Date"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                    placeholder="End Date"
                  />
                  <button
                    onClick={applyDateFilter}
                    disabled={loading}
                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded transition-colors"
                  >
                    Filter
                  </button>
                  {(startDate || endDate) && (
                    <button
                      onClick={clearDateFilter}
                      className="px-2 py-1 text-sm bg-gray-400 hover:bg-gray-500 text-white rounded transition-colors"
                    >
                      Clear
                    </button>
                  )}
                  {(startDate || endDate) && (
                    <span className="text-xs text-gray-600 ml-2">
                      ({filteredReceipts.length} of {receipts.length} records)
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-black mb-4">
                <div className="bg-gray-200 px-2 py-1 border-b border-black">
                  <h3 className="font-bold">Section 1- Taxpayer Information</h3>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="border-r border-black p-2">
                    <p><strong>1. Name of Person or Organization Withholding Tax:</strong></p>
                    <p className="mt-1">
                    {company}
                    </p>
                  </div>
                  <div className="border-r border-black p-2">
                    <p><strong>2. Address:</strong></p>
                    <p className="mt-1">{company_address}</p>
                  </div>
                  <div className="border-r border-black p-2">
                    <p><strong>3. Taxpayer Identification Number:</strong></p>
                    <p className="mt-1">{tin}</p>
                  </div>
                  <div className="border-r border-black p-2">
                    <p><strong>4. Phone Number:</strong></p>
                    <p className="mt-1">{Phone_number}</p>
                  </div>
                  <div className="border-r border-black p-2">
                    <p><strong>5. Woreda:</strong></p>
                    <p className="mt-1">{woreda}</p>
                  </div>
                  <div className="p-2">
                    <p><strong>8. Withholding Period:</strong></p>
                    <p className="mt-1">
                      {startDate && endDate ? 
                        `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` :
                        `Month: ${new Date().toLocaleString('default', { month: 'long' })} Year: ${new Date().getFullYear()}`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Declaration Details */}
              <div className="border border-black mb-4">
                <div className="bg-gray-200 px-2 py-1 border-b border-black">
                  <h3 className="font-bold">Section 2- Declaration Details</h3>
                </div>
                
                {/* Table Header */}
                <div className="grid grid-cols-12 text-xs font-bold border-b border-black">
                  <div className="border-r border-black p-1 text-center"> Num</div>
                  <div className="border-r border-black p-1 text-center"> Withholdee TIN</div>
                  <div className="border-r border-black p-1 text-center">Name of Organization or Person</div>
                  <div className="border-r border-black p-1 text-center"> Withholdee's Address</div>
                  <div className="border-r border-black p-1 text-center"> Withholding Type</div>
                  <div className="border-r border-black p-1 text-center"> Taxable Amount</div>
                  <div className="border-r border-black p-1 text-center"> Tax Withheld</div>
                  <div className="border-r border-black p-1 text-center">Receipt Number</div>
                  <div className="p-1 text-center">Date</div>
                </div>

                {/* Table Rows */}
                {filteredReceipts.map((receipt, index) => (
                  <div key={index} className="grid grid-cols-12 text-xs border-b border-gray-300">
                    <div className="border-r border-black p-1 text-center">{String(index + 1).padStart(3, '0')}</div>
                    <div className="border-r border-black p-1">{receipt.tin}</div>
                    <div className="border-r border-black p-1">{receipt.supplier}</div>
                    <div className="border-r border-black p-1">Addis Ababa</div>
                    <div className="border-r border-black p-1 text-center">{receipt.type === '3%' ? 'Expense' : 'Service'}</div>
                    <div className="border-r border-black p-1 text-right">{parseFloat(receipt.subtotal).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                    <div className="border-r border-black p-1 text-right">{parseFloat(receipt.withholding_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                    <div className="border-r border-black p-1">{receipt.receipt_number}</div>
                    <div className="p-1">{new Date(receipt.date).toLocaleDateString()}</div>
                  </div>
                ))}

                {/* Total Row */}
                <div className="grid grid-cols-12 text-xs font-bold bg-gray-100 border-t-2 border-black">
                  <div className="col-span-5 border-r border-black p-1 text-center">
                    Enter Totals From All Continuation Sheets Here&gt;&gt;&gt;<br/>
                    Total Columns f & g (Lines 20 and 30)
                  </div>
                  <div className="border-r border-black p-1 text-right">
                    {filteredReceipts.reduce((sum, receipt) => sum + parseFloat(receipt.subtotal), 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                  </div>
                  <div className="border-r border-black p-1 text-right">
                    {filteredReceipts.reduce((sum, receipt) => sum + parseFloat(receipt.withholding_amount), 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                  </div>
                  <div className="col-span-2 p-1"></div>
                </div>
              </div>

              {/* Section 3: Calculation of Tax Due */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="border border-black">
                  <div className="bg-gray-200 px-2 py-1 border-b border-black">
                    <h3 className="font-bold text-sm">Section 3 - Calculation of Tax Due</h3>
                  </div>
                  <div className="p-2 space-y-2 text-sm">
                    <div className="flex justify-between border-b pb-1">
                      <span>18. Total Number of Withholdees*</span>
                      <span>{filteredReceipts.length}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>20. Total Taxable Amount for This Tax Period</span>
                      <span>{filteredReceipts.reduce((sum, receipt) => sum + parseFloat(receipt.subtotal), 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>30. Total Tax Withheld for this Tax Period</span>
                      <span>{filteredReceipts.reduce((sum, receipt) => sum + parseFloat(receipt.withholding_amount), 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-black">
                  <div className="bg-gray-200 px-2 py-1 border-b border-black">
                    <h3 className="font-bold text-sm">Section 4 - Taxpayer Certification</h3>
                  </div>
                  <div className="p-2 text-xs">
                    <p>I declare that the above declaration and all information provided here-with is correct and complete to the best of my knowledge and belief. I understand that any misrepresentation is punishable under the appropriate tax laws and penal code.</p>
                    <div className="mt-4 space-y-2">
                      <div>Taxpayer or Authorized Agent</div>
                      <div>Name: _________________________</div>
                      <div>Signature: ____________________</div>
                      <div>Date: _________________________</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Information */}
              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4 print:hidden">
                <h3 className="font-bold text-lg mb-2">Report Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Report Type:</strong> {reportData?.report_type}</p>
                    <p><strong>Description:</strong> {reportData?.description}</p>
                  </div>
    <div>
                    <p><strong>Total Records:</strong> {filteredReceipts.length}</p>
                    <p><strong>Total Withholding Amount:</strong> ETB {filteredReceipts.reduce((sum, receipt) => sum + parseFloat(receipt.withholding_amount), 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                  </div>
                </div>
              </div>

              {/* Print Button */}
              <div className="text-center print:hidden">
                <button 
                  onClick={handlePrint}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-colors"
                >
                  Print Report
                </button>
              </div>

              {loading && (
                <div className="text-center py-4">
                  <p>Loading withholding data...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p>{error}</p>
                </div>
              )}
            </div>
          </div>
    </div>
      );

}
