"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DJANGO_BASE_URL } from '../api/api';
import { ReceiptData, FormReportResponse } from '../local-data-forms/types';

const TOTSummaryPage: React.FC = () => {
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    fetchReceipts();
    // eslint-disable-next-line
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<FormReportResponse>(`${DJANGO_BASE_URL}/receipts`);
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
      const receiptDate = new Date(receipt.receipt_date);
      const receiptYear = receiptDate.getFullYear();
      const receiptMonth = receiptDate.getMonth() + 1;
      // Only include receipts with receipt_name 'TOT' or any item's tax_type 'TOT'
      const isTOTReceipt = receipt.receipt_name === 'TOT' || (receipt.items && receipt.items.some(item => item.tax_type === 'TOT'));
      return receiptYear === year && receiptMonth === month && isTOTReceipt;
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

  // Placeholder for summary calculations
  // You can expand this logic to match the form's requirements

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded mt-8">
      <h1 className="text-2xl font-bold mb-4 text-center">TOT Report Summary</h1>
      <div className="flex gap-4 mb-6 justify-center">
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
      </div>
      {/* Taxpayer Details Section */}
      <div className="mb-6 border p-4 rounded">
        <h2 className="font-semibold mb-2">Taxpayer Details</h2>
        {/* Replace with actual taxpayer info if available */}
        <div className="grid grid-cols-2 gap-4">
          <div><span className="font-medium">Name:</span> ____________________</div>
          <div><span className="font-medium">TIN:</span> ____________________</div>
          <div><span className="font-medium">Address:</span> ____________________</div>
          <div><span className="font-medium">Page:</span> ____</div>
        </div>
      </div>
      {/* TOT Summary Table */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">A. TOT Summary Table (2% and 10%)</h2>
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">2% TOT</th>
              <th className="border px-2 py-1">10% TOT</th>
              <th className="border px-2 py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {/* Populate with filteredReceipts data as needed */}
            <tr>
              <td className="border px-2 py-1">-</td>
              <td className="border px-2 py-1">-</td>
              <td className="border px-2 py-1">-</td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Calculations/summary section */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">B. Calculations / Summary</h2>
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Description</th>
              <th className="border px-2 py-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1">2% TOT</td>
              <td className="border px-2 py-1">-</td>
            </tr>
            <tr>
              <td className="border px-2 py-1">10% TOT</td>
              <td className="border px-2 py-1">-</td>
            </tr>
            <tr>
              <td className="border px-2 py-1">Total</td>
              <td className="border px-2 py-1">-</td>
            </tr>
          </tbody>
        </table>
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
};

export default TOTSummaryPage;