'use client';

import React from 'react';
import { DateRange } from '../types';
import { formatDateRange } from '../utils';

interface DateRangeFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  onRefresh: () => void;
  loading: boolean;
  hasUnsavedChanges: boolean;
  isEditMode: boolean;
  onSaveChanges: () => void;
  onToggleEditMode: () => void;
  onToggleDetailedBreakdown: () => void;
  showDetailedBreakdown: boolean;
  onDownloadPDF: () => void;
  onDownloadCSV: () => void;
  hasData: boolean;
}

const DateRangeFilters: React.FC<DateRangeFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  onRefresh,
  loading,
  hasUnsavedChanges,
  isEditMode,
  onSaveChanges,
  onToggleEditMode,
  onToggleDetailedBreakdown,
  showDetailedBreakdown,
  onDownloadPDF,
  onDownloadCSV,
  hasData
}) => {
  const handleStartDateChange = (value: string) => {
    onDateRangeChange({
      ...dateRange,
      startDate: value
    });
  };

  const handleEndDateChange = (value: string) => {
    onDateRangeChange({
      ...dateRange,
      endDate: value
    });
  };

  // Set quick date range presets
  const setQuickRange = (months: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);
    
    onDateRangeChange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  const setCurrentMonth = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    onDateRangeChange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  const setPreviousMonth = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    
    onDateRangeChange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  const setCurrentYear = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1);
    const endDate = new Date(now.getFullYear(), 11, 31);
    
    onDateRangeChange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8 text-black">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Date Range Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 font-bold">
            Select Date Range
          </label>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Date Range Presets */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quick Select
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={setCurrentMonth}
              className="px-3 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Current Month
            </button>
            <button
              onClick={setPreviousMonth}
              className="px-3 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Previous Month
            </button>
            <button
              onClick={() => setQuickRange(3)}
              className="px-3 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Last 3 Months
            </button>
            <button
              onClick={() => setQuickRange(6)}
              className="px-3 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Last 6 Months
            </button>
            <button
              onClick={setCurrentYear}
              className="px-3 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Current Year
            </button>
            <button
              onClick={() => setQuickRange(12)}
              className="px-3 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Last 12 Months
            </button>
          </div>
        </div> */}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        {!isEditMode ? (
          <>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
            
            {/* Save Manual Adjustments Button - Always visible when there are unsaved manual adjustments */}
            {hasUnsavedChanges && (
              <button
                onClick={onSaveChanges}
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {loading ? 'Saving Manual Adjustments...' : 'Save Manual Adjustments'}
              </button>
            )}
            
            <button
              onClick={onToggleEditMode}
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Values
            </button>
            
            <button
              onClick={onToggleDetailedBreakdown}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              {showDetailedBreakdown ? 'Hide' : 'Show'} Detailed Breakdown
            </button>
            
            <button
              onClick={onDownloadPDF}
              disabled={loading || !hasData}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
{/*             
            <button
              onClick={onDownloadCSV}
              disabled={loading || !hasData}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download CSV
            </button> */}
          </>
        ) : (
          <>
            <button
              onClick={onSaveChanges}
              disabled={loading || !hasUnsavedChanges}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button
              onClick={onToggleEditMode}
              disabled={loading}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            
            {hasUnsavedChanges && (
              <div className="flex items-center px-3 py-2 bg-yellow-100 border border-yellow-300 rounded-md">
                <svg className="w-4 h-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm font-medium text-yellow-800">Unsaved changes</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Selected Period Display */}
      <div className="mt-4 space-y-3">
        <div className="p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Showing VAT summary for:</span> {formatDateRange(dateRange)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilters;
