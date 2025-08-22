'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DJANGO_BASE_URL } from '../api/api';
import { FormReportResponse, ReceiptData } from '../local-data-forms/types';
import { useAuth } from '../../Context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter } from 'next/navigation';

interface MonthOption {
  value: string;
  label: string;
  monthNumber: number;
}

interface SummaryStats {
  totalReceipts: number;
  totalRevenue: number;
  totalExpense: number;
  totalTax: number;
  totalWithholding: number;
  averageReceiptValue: number;
}

interface CategorySummary {
  category: string;
  receiptCount: number;
  totalAmount: number;
  totalTax: number;
  totalWithholding: number;
}

interface MonthlySummary {
  month: string;
  receiptCount: number;
  totalAmount: number;
  totalTax: number;
  totalWithholding: number;
}

interface MonthlyCategoryBreakdown {
  month: string;
  category: string;
  receiptCount: number;
  totalAmount: number;
  totalTax: number;
  totalWithholding: number;
}

type DownloadFormat = 'csv' | 'pdf';

const ReportPage: React.FC = () => {
  const router = useRouter();
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [expandedReceipt, setExpandedReceipt] = useState<number | null>(null);
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalReceipts: 0,
    totalRevenue: 0,
    totalExpense: 0,
    totalTax: 0,
    totalWithholding: 0,
    averageReceiptValue: 0,
  });
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>('csv');
  const [downloading, setDownloading] = useState(false);
  
  // document base for public documents
  const document_BASE_URL = 'https://api.local.linkmerkato.com.et/';

  const resolveDocumentUrl = (documentPathOrUrl: string): string => {
    if (!documentPathOrUrl) return '';
    const isAbsolute = /^https?:\/\//i.test(documentPathOrUrl);
    if (isAbsolute) return documentPathOrUrl;
    const sanitized = documentPathOrUrl.replace(/^\/+/, '');
    return `${document_BASE_URL}${sanitized}`;
  };

  const { token } = useAuth();

  const monthOptions: MonthOption[] = [
    { value: 'january', label: 'January', monthNumber: 1 },
    { value: 'february', label: 'February', monthNumber: 2 },
    { value: 'march', label: 'March', monthNumber: 3 },
    { value: 'april', label: 'April', monthNumber: 4 },
    { value: 'may', label: 'May', monthNumber: 5 },
    { value: 'june', label: 'June', monthNumber: 6 },
    { value: 'july', label: 'July', monthNumber: 7 },
    { value: 'august', label: 'August', monthNumber: 8 },
    { value: 'september', label: 'September', monthNumber: 9 },
    { value: 'october', label: 'October', monthNumber: 10 },
    { value: 'november', label: 'November', monthNumber: 11 },
    { value: 'december', label: 'December', monthNumber: 12 },
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i);

  const receiptCategories = [
    { value: 'Revenue', label: 'Revenue', color: 'green' },
    { value: 'Expense', label: 'Expense', color: 'red' },
    { value: 'Crv', label: 'CRV', color: 'blue' },
    { value: 'Other', label: 'Other', color: 'purple' },
  ];

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
        filterReceiptsByMonth(response.data.results, selectedMonths, selectedYear, selectedCategories);
      } else {
        setError('Failed to fetch receipt data');
      }
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError('Error fetching receipt data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterReceiptsByMonth = (receiptsData: ReceiptData[], months: number[], year: number, categories: string[]) => {
    let filtered = receiptsData;

    if (months.length > 0) {
      filtered = filtered.filter(receipt => {
        const receiptDate = new Date(receipt.receipt_date);
        const receiptYear = receiptDate.getFullYear();
        const receiptMonth = receiptDate.getMonth() + 1;
        return receiptYear === year && months.includes(receiptMonth);
      });
    } else {
      filtered = filtered.filter(receipt => {
        const receiptDate = new Date(receipt.receipt_date);
        return receiptDate.getFullYear() === year;
      });
    }

    if (categories.length > 0) {
      filtered = filtered.filter(receipt => 
        categories.includes(receipt.receipt_category || '')
      );
    }

    setFilteredReceipts(filtered);
    calculateSummaryStats(filtered);
  };

  const calculateSummaryStats = (receiptsData: ReceiptData[]) => {
    const stats = receiptsData.reduce((acc, receipt) => {
      const total = parseFloat(receipt.total) || 0;
      const tax = parseFloat(receipt.tax) || 0;
      const withholding = parseFloat(receipt.withholding_amount) || 0;

      acc.totalReceipts += 1;
      acc.totalTax += tax;
      acc.totalWithholding += withholding;

      if (receipt.receipt_category === 'Revenue') {
        acc.totalRevenue += total;
      } else if (receipt.receipt_category === 'Expense') {
        acc.totalExpense += total;
      }

      return acc;
    }, {
      totalReceipts: 0,
      totalRevenue: 0,
      totalExpense: 0,
      totalTax: 0,
      totalWithholding: 0,
      averageReceiptValue: 0,
    });

    stats.averageReceiptValue = stats.totalReceipts > 0 
      ? (stats.totalRevenue + stats.totalExpense) / stats.totalReceipts 
      : 0;

    setSummaryStats(stats);
  };

  const handleMonthChange = (monthNumber: number) => {
    const newSelectedMonths = selectedMonths.includes(monthNumber)
      ? selectedMonths.filter(m => m !== monthNumber)
      : [...selectedMonths, monthNumber];
    
    setSelectedMonths(newSelectedMonths);
    filterReceiptsByMonth(receipts, newSelectedMonths, selectedYear, selectedCategories);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    filterReceiptsByMonth(receipts, selectedMonths, year, selectedCategories);
  };

  const clearFilters = () => {
    setSelectedMonths([]);
    setSelectedYear(new Date().getFullYear());
    setSelectedCategories([]);
    filterReceiptsByMonth(receipts, [], new Date().getFullYear(), []);
  };

  const handleCategoryChange = (category: string) => {
    const newSelectedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newSelectedCategories);
    filterReceiptsByMonth(receipts, selectedMonths, selectedYear, newSelectedCategories);
  };

  const toggleReceiptDetails = (receiptId: number) => {
    setExpandedReceipt(expandedReceipt === receiptId ? null : receiptId);
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewDocument = (documentUrl: string, filename: string) => {
    const resolvedUrl = resolveDocumentUrl(documentUrl);
    if (resolvedUrl) {
      window.open(resolvedUrl, '_blank');
    }
  };

  const handleDownloadDocument = async (documentUrl: string, filename: string) => {
    try {
      const resolvedUrl = resolveDocumentUrl(documentUrl);
      if (!resolvedUrl) return;

      const response = await fetch(resolvedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document. Please try again.');
    }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('image')) {
      return (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else if (contentType.includes('pdf')) {
      return (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
  };

  const generateCategorySummary = (): CategorySummary[] => {
    const categoryMap = new Map<string, CategorySummary>();
    
    filteredReceipts.forEach(receipt => {
      const category = receipt.receipt_category || 'Other';
      const total = parseFloat(receipt.total) || 0;
      const tax = parseFloat(receipt.tax) || 0;
      const withholding = parseFloat(receipt.withholding_amount) || 0;
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          receiptCount: 0,
          totalAmount: 0,
          totalTax: 0,
          totalWithholding: 0,
        });
      }
      
      const summary = categoryMap.get(category)!;
      summary.receiptCount += 1;
      summary.totalAmount += total;
      summary.totalTax += tax;
      summary.totalWithholding += withholding;
    });
    
    return Array.from(categoryMap.values());
  };

  const generateMonthlySummary = (): MonthlySummary[] => {
    const monthlyMap = new Map<string, MonthlySummary>();
    
    filteredReceipts.forEach(receipt => {
      const date = new Date(receipt.receipt_date);
      const month = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const total = parseFloat(receipt.total) || 0;
      const tax = parseFloat(receipt.tax) || 0;
      const withholding = parseFloat(receipt.withholding_amount) || 0;
      
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, {
          month,
          receiptCount: 0,
          totalAmount: 0,
          totalTax: 0,
          totalWithholding: 0,
        });
      }
      
      const summary = monthlyMap.get(month)!;
      summary.receiptCount += 1;
      summary.totalAmount += total;
      summary.totalTax += tax;
      summary.totalWithholding += withholding;
    });
    
    return Array.from(monthlyMap.values());
  };

  const generateMonthlyCategoryBreakdown = (): MonthlyCategoryBreakdown[] => {
    const breakdownMap = new Map<string, MonthlyCategoryBreakdown>();
    
    filteredReceipts.forEach(receipt => {
      const date = new Date(receipt.receipt_date);
      const month = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const category = receipt.receipt_category || 'Other';
      const key = `${month}-${category}`;
      const total = parseFloat(receipt.total) || 0;
      const tax = parseFloat(receipt.tax) || 0;
      const withholding = parseFloat(receipt.withholding_amount) || 0;
      
      if (!breakdownMap.has(key)) {
        breakdownMap.set(key, {
          month,
          category,
          receiptCount: 0,
          totalAmount: 0,
          totalTax: 0,
          totalWithholding: 0,
        });
      }
      
      const breakdown = breakdownMap.get(key)!;
      breakdown.receiptCount += 1;
      breakdown.totalAmount += total;
      breakdown.totalTax += tax;
      breakdown.totalWithholding += withholding;
    });
    
    return Array.from(breakdownMap.values());
  };

  const downloadReport = async () => {
    setDownloading(true);
    try {
      if (downloadFormat === 'csv') {
        const csv = generateCSV();
        downloadFile(csv, `receipt_report_${selectedYear}.csv`, 'text/csv');
      } else {
        await generatePDF();
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      setError('Error downloading report');
    } finally {
      setDownloading(false);
    }
  };

  const generateCSV = (): string => {
    const reportDate = new Date().toLocaleDateString('en-US');
    const selectedMonthsText = selectedMonths.length > 0 
      ? selectedMonths.map(m => monthOptions.find(opt => opt.monthNumber === m)?.label).join(', ')
      : 'All Months';
    const selectedCategoriesText = selectedCategories.length > 0 
      ? selectedCategories.join(', ')
      : 'All Categories';

    let csv = `Receipt Management System Report\n`;
    csv += `Generation Date: ${reportDate}\n`;
    csv += `Report Year: Receipt Report - ${selectedYear}\n`;
    csv += `Months Filter: ${selectedMonthsText}\n`;
    csv += `Categories Filter: ${selectedCategoriesText}\n\n`;

    // Category Summary
    csv += `CATEGORY SUMMARY\n`;
    csv += `Category,Receipt Count,Total Amount,Total Tax,Total Withholding\n`;
    const categorySummary = generateCategorySummary();
    categorySummary.forEach(summary => {
      csv += `${summary.category},${summary.receiptCount},${summary.totalAmount.toFixed(2)},${summary.totalTax.toFixed(2)},${summary.totalWithholding.toFixed(2)}\n`;
    });
    csv += `\n`;

    // Monthly Summary
    csv += `MONTHLY SUMMARY\n`;
    csv += `Month,Receipt Count,Total Amount,Total Tax,Total Withholding\n`;
    const monthlySummary = generateMonthlySummary();
    monthlySummary.forEach(summary => {
      csv += `${summary.month},${summary.receiptCount},${summary.totalAmount.toFixed(2)},${summary.totalTax.toFixed(2)},${summary.totalWithholding.toFixed(2)}\n`;
    });
    csv += `\n`;

    // Monthly Category Breakdown
    csv += `MONTHLY CATEGORY BREAKDOWN\n`;
    csv += `Month,Category,Receipt Count,Total Amount,Total Tax,Total Withholding\n`;
    const monthlyCategoryBreakdown = generateMonthlyCategoryBreakdown();
    monthlyCategoryBreakdown.forEach(breakdown => {
      csv += `${breakdown.month},${breakdown.category},${breakdown.receiptCount},${breakdown.totalAmount.toFixed(2)},${breakdown.totalTax.toFixed(2)},${breakdown.totalWithholding.toFixed(2)}\n`;
    });
    csv += `\n`;

    // Detailed Receipts
    csv += `DETAILED RECEIPTS\n`;
    csv += `Receipt Number,Date,Category,Issued By,Issued To,Payment Method,Total,Tax,Withholding Amount,Items Count,Receipt Document,Withholding Document\n`;
    filteredReceipts.forEach(receipt => {
      const itemsCount = receipt.items?.length || 0;
      const mainReceiptDoc = receipt.documents?.main_receipt?.filename || '';
      const withholdingDoc = receipt.documents?.withholding_receipt?.filename || '';
      
      csv += `"${receipt.receipt_number}","${formatDate(receipt.receipt_date)}","${receipt.receipt_category || ''}","${receipt.issued_by_details.name}","${receipt.issued_to_details.name}","${receipt.payment_method_type}","${receipt.total}","${receipt.tax}","${receipt.withholding_amount}","${itemsCount}","${mainReceiptDoc}","${withholdingDoc}"\n`;
    });

    return csv;
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Report Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Receipt Management System Report', 105, yPosition, { align: 'center' });
    
    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const reportDate = new Date().toLocaleDateString('en-US');
    const selectedMonthsText = selectedMonths.length > 0 
      ? selectedMonths.map(m => monthOptions.find(opt => opt.monthNumber === m)?.label).join(', ')
      : 'All Months';
    const selectedCategoriesText = selectedCategories.length > 0 
      ? selectedCategories.join(', ')
      : 'All Categories';
    
    doc.text(`Generation Date: ${reportDate}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Report Year: Receipt Report - ${selectedYear}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Months Filter: ${selectedMonthsText}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Categories Filter: ${selectedCategoriesText}`, 20, yPosition);
    
    yPosition += 15;
    
    // Category Summary Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CATEGORY SUMMARY', 20, yPosition);
    yPosition += 10;
    
    const categorySummary = generateCategorySummary();
    const categorySummaryData = categorySummary.map(summary => [
      summary.category,
      summary.receiptCount.toString(),
      formatCurrency(summary.totalAmount).replace('ETB', ''),
      formatCurrency(summary.totalTax).replace('ETB', ''),
      formatCurrency(summary.totalWithholding).replace('ETB', '')
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Category', 'Receipt Count', 'Total Amount', 'Total Tax', 'Total Withholding']],
      body: categorySummaryData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10 },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    // Monthly Summary Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MONTHLY SUMMARY', 20, yPosition);
    yPosition += 10;
    
    const monthlySummary = generateMonthlySummary();
    const monthlySummaryData = monthlySummary.map(summary => [
      summary.month,
      summary.receiptCount.toString(),
      formatCurrency(summary.totalAmount).replace('ETB', ''),
      formatCurrency(summary.totalTax).replace('ETB', ''),
      formatCurrency(summary.totalWithholding).replace('ETB', '')
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Month', 'Receipt Count', 'Total Amount', 'Total Tax', 'Total Withholding']],
      body: monthlySummaryData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10 },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    // Monthly Category Breakdown Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MONTHLY CATEGORY BREAKDOWN', 20, yPosition);
    yPosition += 10;
    
    const monthlyCategoryBreakdown = generateMonthlyCategoryBreakdown();
    const monthlyCategoryData = monthlyCategoryBreakdown.map(breakdown => [
      breakdown.month,
      breakdown.category,
      breakdown.receiptCount.toString(),
      formatCurrency(breakdown.totalAmount).replace('ETB', ''),
      formatCurrency(breakdown.totalTax).replace('ETB', ''),
      formatCurrency(breakdown.totalWithholding).replace('ETB', '')
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Month', 'Category', 'Receipt Count', 'Total Amount', 'Total Tax', 'Total Withholding']],
      body: monthlyCategoryData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page for detailed receipts
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Detailed Receipts Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAILED RECEIPTS', 20, yPosition);
    yPosition += 10;
    
    const detailedReceiptsData = filteredReceipts.map(receipt => {
      const itemsCount = receipt.items?.length || 0;
      const mainReceiptDoc = receipt.documents?.main_receipt?.filename || '';
      const withholdingDoc = receipt.documents?.withholding_receipt?.filename || '';
      
      return [
        receipt.receipt_number,
        formatDate(receipt.receipt_date),
        receipt.receipt_category || '',
        receipt.issued_by_details.name,
        receipt.issued_to_details.name,
        receipt.payment_method_type,
        formatCurrency(receipt.total).replace('ETB', ''),
        formatCurrency(receipt.tax).replace('ETB', ''),
        formatCurrency(receipt.withholding_amount).replace('ETB', ''),
        itemsCount.toString(),
        mainReceiptDoc,
        withholdingDoc
      ];
    });
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Receipt #', 'Date', 'Category', 'Issued By', 'Issued To', 'Payment', 'Total', 'Tax', 'Withholding', 'Items', 'Receipt Doc', 'Withholding Doc']],
      body: detailedReceiptsData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8 },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 20 }, // Receipt #
        1: { cellWidth: 20 }, // Date
        2: { cellWidth: 20 }, // Category
        3: { cellWidth: 25 }, // Issued By
        4: { cellWidth: 25 }, // Issued To
        5: { cellWidth: 15 }, // Payment
        6: { cellWidth: 20 }, // Total
        7: { cellWidth: 15 }, // Tax
        8: { cellWidth: 20 }, // Withholding
        9: { cellWidth: 10 }, // Items
        10: { cellWidth: 25 }, // Receipt Doc
        11: { cellWidth: 25 }  // Withholding Doc
      }
    });
    
    // Save the PDF
    const filename = `receipt_report_${selectedYear}.pdf`;
    doc.save(filename);
  };

  useEffect(() => {
    if (token) {
      fetchReceipts();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Receipt Report</h1>
          <p className="mt-2 text-gray-600">Comprehensive analysis of your receipt data</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">Months</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {monthOptions.map(month => (
                  <label key={month.monthNumber} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedMonths.includes(month.monthNumber)}
                      onChange={() => handleMonthChange(month.monthNumber)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-black">{month.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">Categories</label>
              <div className="space-y-2">
                {receiptCategories.map(category => (
                  <label key={category.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.value)}
                      onChange={() => handleCategoryChange(category.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-black">{category.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col justify-end space-y-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
              
              {/* Download Controls */}
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <select
                    value={downloadFormat}
                    onChange={(e) => setDownloadFormat(e.target.value as DownloadFormat)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="csv">CSV Format</option>
                    <option value="pdf">PDF Format</option>
                  </select>
                </div>
                <button
                  onClick={downloadReport}
                  disabled={downloading || filteredReceipts.length === 0}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading ? 'Generating Report...' : 'Download Report'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Receipts</p>
                <p className="text-2xl font-semibold text-gray-900">{summaryStats.totalReceipts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-green-600">{formatCurrency(summaryStats.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Expense</p>
                <p className="text-2xl font-semibold text-red-600">{formatCurrency(summaryStats.totalExpense)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tax</p>
                <p className="text-2xl font-semibold text-yellow-600">{formatCurrency(summaryStats.totalTax)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Withholding</p>
                <p className="text-2xl font-semibold text-purple-600">{formatCurrency(summaryStats.totalWithholding)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
              <svg
                     className="w-8 h-8 text-green-600"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth={2}
                       d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                     />
                   </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">VAT Report</p>
               <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
               onClick={() => router.push('/monthly-Vat-Summary')}>
                View
               </button>
              </div>
            </div>
            
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
              <svg
                     className="w-8 h-8 text-green-600"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth={2}
                       d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                     />
                   </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Withholding Report</p>
               <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
               onClick={() => router.push('/withholdingReport')}>
                View
               </button>
              </div>
            </div>
            
          </div>
        </div>

        {/* Receipts List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Receipts ({filteredReceipts.length})
            </h2>
          </div>

          {error && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {filteredReceipts.length === 0 && !loading ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No receipts found for the selected filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredReceipts.map((receipt) => (
                <div key={receipt.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full ${
                            receipt.receipt_category === 'Revenue' ? 'bg-green-400' :
                            receipt.receipt_category === 'Expense' ? 'bg-red-400' :
                            'bg-gray-400'
                          }`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-4">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {receipt.receipt_number}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              receipt.receipt_category === 'Revenue' ? 'bg-green-100 text-green-800' :
                              receipt.receipt_category === 'Expense' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {receipt.receipt_category}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(receipt.receipt_date)}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>From: {receipt.issued_by_details.name}</span>
                            <span>To: {receipt.issued_to_details.name}</span>
                            <span>Total: {formatCurrency(receipt.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleReceiptDetails(receipt.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {expandedReceipt === receipt.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>

                  {expandedReceipt === receipt.id && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Receipt Details</h4>
                          <dl className="space-y-1 text-sm text-gray-600">
                            <div className="flex justify-between">
                              <dt>Receipt Type:</dt>
                              <dd>{receipt.receipt_type}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt>Receipt Kind:</dt>
                              <dd>{receipt.receipt_kind}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt>Payment Method:</dt>
                              <dd>{receipt.payment_method_type}</dd>
                            </div>
                            {receipt.bank_name && (
                              <div className="flex justify-between">
                                <dt>Bank:</dt>
                                <dd>{receipt.bank_name}</dd>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <dt>Withholding Applicable:</dt>
                              <dd>{receipt.is_withholding_applicable ? 'Yes' : 'No'}</dd>
                            </div>
                          </dl>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Financial Summary</h4>
                          <dl className="space-y-1 text-sm text-gray-600">
                            <div className="flex justify-between">
                              <dt>Subtotal:</dt>
                              <dd>{formatCurrency(receipt.subtotal)}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt>Tax:</dt>
                              <dd>{formatCurrency(receipt.tax)}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt>Total:</dt>
                              <dd className="font-medium">{formatCurrency(receipt.total)}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt>Withholding:</dt>
                              <dd>{formatCurrency(receipt.withholding_amount)}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt>Net Payable:</dt>
                              <dd className="font-medium">{formatCurrency(receipt.net_payable_to_supplier)}</dd>
                            </div>
                          </dl>
                        </div>
                      </div>

                      {receipt.items && receipt.items.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Items</h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Type</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {receipt.items.map((item, index) => (
                                  <tr key={index}>
                                    <td className="px-3 py-2 text-sm text-gray-900">
                                      {item.item.item_description}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-600">
                                      {item.quantity}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-600">
                                      {formatCurrency(item.unit_cost)}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-600">
                                      {item.tax_type}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-600">
                                      {formatCurrency(item.subtotal)}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-600">
                                      {formatCurrency(item.total_after_tax)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Documents Section */}
                      {receipt.documents && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Documents</h4>
                          <div className="space-y-3">
                            {receipt.documents.main_receipt && (
                              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  {getFileIcon(receipt.documents.main_receipt.content_type)}
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      Main Receipt
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {receipt.documents.main_receipt.filename}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Uploaded: {new Date(receipt.documents.main_receipt.uploaded_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      const doc = receipt.documents?.main_receipt;
                                      if (doc) {
                                        handleViewDocument(doc.file, doc.filename);
                                      }
                                    }}
                                    className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => {
                                      const doc = receipt.documents?.main_receipt;
                                      if (doc) {
                                        handleDownloadDocument(doc.file, doc.filename);
                                      }
                                    }}
                                    className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                  >
                                    Download
                                  </button>
                                </div>
                              </div>
                            )}

                            {receipt.documents.withholding_receipt && (
                              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  {getFileIcon(receipt.documents.withholding_receipt.content_type)}
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      Withholding Receipt
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {receipt.documents.withholding_receipt.filename}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Uploaded: {new Date(receipt.documents.withholding_receipt.uploaded_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      const doc = receipt.documents?.withholding_receipt;
                                      if (doc) {
                                        handleViewDocument(doc.file, doc.filename);
                                      }
                                    }}
                                    className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => {
                                      const doc = receipt.documents?.withholding_receipt;
                                      if (doc) {
                                        handleDownloadDocument(doc.file, doc.filename);
                                      }
                                    }}
                                    className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                  >
                                    Download
                                  </button>
                                </div>
                              </div>
                            )}

                            {(!receipt.documents.main_receipt && !receipt.documents.withholding_receipt) && (
                              <div className="text-center py-4 text-gray-500">
                                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="mt-2 text-sm">No documents available</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
