'use client';

import React from 'react';
import { ReceiptData } from './types';

interface CategorySummaryProps {
  receipts: ReceiptData[];
  title?: string;
  showDetails?: boolean;
}

interface CategoryData {
  category: string;
  receiptCount: number;
  totalAmount: number;
  totalTax: number;
  totalWithholding: number;
  receipts: ReceiptData[];
}

const CategorySummary: React.FC<CategorySummaryProps> = ({ 
  receipts, 
  title = "Category Summary",
  showDetails = false 
}) => {
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ET', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate category breakdown
  const calculateCategorySummary = (): CategoryData[] => {
    const categories = ['Revenue', 'Expense', 'Crv', 'Other'];
    const summary: { [key: string]: CategoryData } = {};

    // Initialize categories
    categories.forEach(category => {
      summary[category] = {
        category,
        receiptCount: 0,
        totalAmount: 0,
        totalTax: 0,
        totalWithholding: 0,
        receipts: []
      };
    });

    // Process receipts
    receipts.forEach(receipt => {
      const category = receipt.receipt_category || 'Other';
      if (summary[category]) {
        summary[category].receiptCount += 1;
        summary[category].totalAmount += Number(receipt.total);
        summary[category].totalTax += Number(receipt.tax);
        summary[category].totalWithholding += Number(receipt.withholding_amount);
        summary[category].receipts.push(receipt);
      } else {
        // Handle unknown categories
        if (!summary['Other']) {
          summary['Other'] = {
            category: 'Other',
            receiptCount: 0,
            totalAmount: 0,
            totalTax: 0,
            totalWithholding: 0,
            receipts: []
          };
        }
        summary['Other'].receiptCount += 1;
        summary['Other'].totalAmount += Number(receipt.total);
        summary['Other'].totalTax += Number(receipt.tax);
        summary['Other'].totalWithholding += Number(receipt.withholding_amount);
        summary['Other'].receipts.push(receipt);
      }
    });

    return Object.values(summary).filter(cat => cat.receiptCount > 0);
  };

  const categorySummary = calculateCategorySummary();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Revenue':
        return 'bg-green-100 text-green-800';
      case 'Expense':
        return 'bg-red-100 text-red-800';
      case 'Crv':
        return 'bg-blue-100 text-blue-800';
      case 'Other':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Revenue':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'Expense':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'Crv':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
    }
  };

  if (categorySummary.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No receipts found for category breakdown.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      {/* Category Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {categorySummary.map((category) => (
            <div key={category.category} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${getCategoryColor(category.category).replace('text-', 'bg-').replace('bg-green-100', 'bg-green-100').replace('bg-red-100', 'bg-red-100').replace('bg-blue-100', 'bg-blue-100').replace('bg-purple-100', 'bg-purple-100')}`}>
                    {getCategoryIcon(category.category)}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{category.category}</h4>
                    <p className="text-sm text-gray-500">{category.receiptCount} receipts</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(category.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Tax:</span>
                  <span className="text-sm font-semibold text-amber-600">{formatCurrency(category.totalTax)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Withholding:</span>
                  <span className="text-sm font-semibold text-red-600">{formatCurrency(category.totalWithholding)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Receipts</span>
                  <span className="text-xs font-medium text-blue-600">{category.receiptCount} records</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(category.receiptCount / Math.max(...categorySummary.map(c => c.receiptCount))) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Category Summary Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tax</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Withholding</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg per Receipt</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categorySummary.map((category) => (
                <tr key={category.category} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className={`w-3 h-3 rounded-full mr-3 ${getCategoryColor(category.category).replace('text-', 'bg-').replace('bg-green-100', 'bg-green-500').replace('bg-red-100', 'bg-red-500').replace('bg-blue-100', 'bg-blue-500').replace('bg-purple-100', 'bg-purple-500')}`}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">{category.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category.category)}`}>
                      {category.receiptCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(category.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600">
                    {formatCurrency(category.totalTax)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {formatCurrency(category.totalWithholding)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.receiptCount > 0 ? formatCurrency(category.totalAmount / category.receiptCount) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detailed Receipts by Category */}
        {showDetails && (
          <div className="mt-8 space-y-6">
            {categorySummary.map((category) => (
              <div key={category.category} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  {category.category} Receipts ({category.receiptCount})
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Issued By</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Issued To</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tax</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Withholding</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {category.receipts.map((receipt) => (
                        <tr key={receipt.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{receipt.receipt_number}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatDate(receipt.receipt_date)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{receipt.issued_by_details.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{receipt.issued_to_details.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">{formatCurrency(receipt.total)}</td>
                          <td className="px-4 py-2 text-sm text-amber-600">{formatCurrency(receipt.tax)}</td>
                          <td className="px-4 py-2 text-sm text-red-600">{formatCurrency(receipt.withholding_amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySummary; 