"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DJANGO_BASE_URL } from '../api/api';
import { ReceiptData, FormReportResponse } from '../local-data-forms/types';
import { useAuth } from '../../Context/AuthContext';

const TOTSummaryPage: React.FC = () => {
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showAllMonths, setShowAllMonths] = useState<boolean>(false);

  const { token } = useAuth();

  useEffect(() => {
    fetchReceipts();
    // eslint-disable-next-line
  }, [token]);

  const fetchReceipts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<FormReportResponse>(
        `${DJANGO_BASE_URL}/receipts`,
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50">
      {/* Decorative blurred shapes */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-purple-300/30 blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        <div className="p-6 md:p-8 bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl ring-1 ring-black/5 text-black">
          <h1 className="text-3xl font-extrabold mb-6 text-center text-black">TOT Report Summary</h1>

          <div className="flex gap-4 mb-6 justify-center items-end flex-wrap">
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
          </div>

          {/* Taxpayer Details Section */}
          <div className="mb-6 border border-gray-200/70 bg-white/70 rounded-lg p-4">
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
                  {filteredReceipts.flatMap(r => (r.items || []).map((item: any) => ({ ...item, receiptNumber: r.receipt_number }))).filter((item: any) => {
                    const lineTax = (item?.tax_type ?? '').toString().toUpperCase();
                    const nestedTax = (item?.item?.tax_type ?? '').toString().toUpperCase();
                    return lineTax === 'TOT' || nestedTax === 'TOT';
                  }).map((item: any, index: number) => (
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
                    <td className="border px-2 py-1">
                      {filteredReceipts.flatMap(r => r.items || []).filter((item: any) => {
                        const lineTax = (item?.tax_type ?? '').toString().toUpperCase();
                        const nestedTax = (item?.item?.tax_type ?? '').toString().toUpperCase();
                        return lineTax === 'TOT' || nestedTax === 'TOT';
                      }).length}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Total TOT Amount</td>
                    <td className="border px-2 py-1">
                      {filteredReceipts.flatMap(r => r.items || []).filter((item: any) => {
                        const lineTax = (item?.tax_type ?? '').toString().toUpperCase();
                        const nestedTax = (item?.item?.tax_type ?? '').toString().toUpperCase();
                        return lineTax === 'TOT' || nestedTax === 'TOT';
                      }).reduce((sum, item) => sum + Number(item.total_after_tax || 0), 0).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Total TOT Tax</td>
                    <td className="border px-2 py-1">
                      {filteredReceipts.flatMap(r => r.items || []).filter((item: any) => {
                        const lineTax = (item?.tax_type ?? '').toString().toUpperCase();
                        const nestedTax = (item?.item?.tax_type ?? '').toString().toUpperCase();
                        return lineTax === 'TOT' || nestedTax === 'TOT';
                      }).reduce((sum, item) => sum + Number(item.tax_amount || 0), 0).toFixed(2)}
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
      </div>
    </div>
  );
};

export default TOTSummaryPage;