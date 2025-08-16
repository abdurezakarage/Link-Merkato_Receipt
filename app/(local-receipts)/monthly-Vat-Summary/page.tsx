'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DJANGO_BASE_URL } from '../api/api';
import { FormReportResponse, ReceiptData } from '../local-data-forms/types';

// Import types and utilities
import { EditableValues, ManualAdjustments, DateRange } from './types';
import { 
  calculateVATSummary, 
  calculateSectionTotals, 
  getCurrentValues, 
  validateValues,
  filterReceiptsByDateRange,
  formatDateRange
} from './utils';
import { downloadPDF, downloadCSV } from './export-utils';

// Import components
import DateRangeFilters from './components/DateRangeFilters';
import SummaryCards from './components/SummaryCards';
import VATTables from './components/VATTables';
import FinalCalculation from './components/FinalCalculation';
import DetailedBreakdown from './components/DetailedBreakdown';

const MonthlySummaryPage: React.FC = () => {
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize with current month date range
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startOfMonth.toISOString().split('T')[0],
    endDate: endOfMonth.toISOString().split('T')[0]
  });
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableValues, setEditableValues] = useState<EditableValues>({});
  const [manualAdjustments, setManualAdjustments] = useState<ManualAdjustments>({
    vatOnGovernmentVoucher: 0,
    otherCredits: 0,
    creditCarriedForward: 0,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fetchReceipts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<FormReportResponse>(
        `${DJANGO_BASE_URL}/receipts`
      );

      if (response.data.results) {
        setReceipts(response.data.results);
        handleFilterReceipts(response.data.results, dateRange);
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

  const handleFilterReceipts = (receiptsData: ReceiptData[], dateRange: DateRange) => {
    const filtered = filterReceiptsByDateRange(receiptsData, dateRange);
    setFilteredReceipts(filtered);
  };

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
    handleFilterReceipts(receipts, newDateRange);
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  // Initialize editable values when receipts change
  useEffect(() => {
    if (!isEditMode) {
      const currentSummary = calculateVATSummary(filteredReceipts);
      const initialValues: EditableValues = {};
      
      Object.entries(currentSummary).forEach(([natureCode, data]) => {
        initialValues[natureCode] = {
          total: data.total,
          vat: data.vat,
        };
      });
      
      setEditableValues(initialValues);
    }
  }, [filteredReceipts, isEditMode]);

  // Handle edit mode toggle
  const toggleEditMode = () => {
    if (isEditMode && hasUnsavedChanges) {
      const confirmDiscard = window.confirm(
        'You have unsaved changes. Are you sure you want to discard them?'
      );
      if (!confirmDiscard) return;
    }
    
    setIsEditMode(!isEditMode);
    setHasUnsavedChanges(false);
    
    if (!isEditMode) {
      // Initialize editable values with current data
      const currentSummary = calculateVATSummary(filteredReceipts);
      const initialValues: EditableValues = {};
      
      Object.entries(currentSummary).forEach(([natureCode, data]) => {
        initialValues[natureCode] = {
          total: data.total,
          vat: data.vat,
        };
      });
      
      setEditableValues(initialValues);
    }
  };

  // Handle value changes
  const handleValueChange = (natureCode: string, field: 'total' | 'vat', value: string) => {
    const numericValue = parseFloat(value) || 0;
    
    setEditableValues(prev => ({
      ...prev,
      [natureCode]: {
        ...prev[natureCode],
        [field]: numericValue,
      },
    }));
    
    setHasUnsavedChanges(true);
  };

  // Handle manual adjustment changes
  const handleManualAdjustmentChange = (field: keyof ManualAdjustments, value: string) => {
    const numericValue = parseFloat(value) || 0;
    
    setManualAdjustments(prev => ({
      ...prev,
      [field]: numericValue,
    }));
    
    setHasUnsavedChanges(true);
  };

  // Save changes
  const saveChanges = async () => {
    const validationErrors = validateValues(editableValues, manualAdjustments);
    
    if (validationErrors.length > 0) {
      alert('Validation errors:\n' + validationErrors.join('\n'));
      return;
    }
    
    try {
      setLoading(true);
      
      // Here you would typically save to your backend
      // For now, we'll just simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasUnsavedChanges(false);
      setIsEditMode(false);
      alert('Changes saved successfully!');
      
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel changes
  const cancelChanges = () => {
    if (hasUnsavedChanges) {
      const confirmDiscard = window.confirm(
        'You have unsaved changes. Are you sure you want to discard them?'
      );
      if (!confirmDiscard) return;
    }
    
    setIsEditMode(false);
    setHasUnsavedChanges(false);
    
    // Reset to original values
    const currentSummary = calculateVATSummary(filteredReceipts);
    const resetValues: EditableValues = {};
    
    Object.entries(currentSummary).forEach(([natureCode, data]) => {
      resetValues[natureCode] = {
        total: data.total,
        vat: data.vat,
      };
    });
    
    setEditableValues(resetValues);
    setManualAdjustments({
      vatOnGovernmentVoucher: 0,
      otherCredits: 0,
      creditCarriedForward: 0,
    });
  };

  // Calculate VAT summary and related values
  const vatSummary = calculateVATSummary(filteredReceipts);
  const currentValues = getCurrentValues(vatSummary, isEditMode, editableValues);
  const sectionTotals = calculateSectionTotals(vatSummary, currentValues);

  // Calculate final VAT due/credit with manual adjustments
  const totalOutputVAT = sectionTotals.output.vat;
  const totalInputVAT = sectionTotals.capital.vat + sectionTotals.nonCapital.vat;
  const baseVatDue = totalOutputVAT - totalInputVAT;
  
  // Apply manual adjustments
  const adjustedVatDue = baseVatDue - manualAdjustments.vatOnGovernmentVoucher - manualAdjustments.otherCredits;
  const finalVatDue = adjustedVatDue - manualAdjustments.creditCarriedForward;
  const vatDue = finalVatDue;

  // Download handlers
  const handleDownloadPDF = () => {
    downloadPDF(
      dateRange,
      currentValues,
      vatSummary,
      sectionTotals,
      manualAdjustments,
      adjustedVatDue,
      vatDue
    );
  };

  const handleDownloadCSV = () => {
    downloadCSV(
      dateRange,
      vatSummary,
      totalOutputVAT,
      totalInputVAT,
      vatDue
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading VAT summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">VAT Summary Report</h1>
        </div>

        {/* Filters Section */}
        <DateRangeFilters
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          onRefresh={fetchReceipts}
          loading={loading}
          hasUnsavedChanges={hasUnsavedChanges}
          isEditMode={isEditMode}
          onSaveChanges={saveChanges}
          onToggleEditMode={isEditMode ? cancelChanges : toggleEditMode}
          onToggleDetailedBreakdown={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
          showDetailedBreakdown={showDetailedBreakdown}
          onDownloadPDF={handleDownloadPDF}
          onDownloadCSV={handleDownloadCSV}
          hasData={Object.keys(vatSummary).length > 0}
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* VAT Summary Overview */}
        <SummaryCards
          totalOutputVAT={totalOutputVAT}
          totalInputVAT={totalInputVAT}
          vatDue={vatDue}
        />

        {/* VAT Form Structure */}
        <VATTables
          vatSummary={vatSummary}
          currentValues={currentValues}
          sectionTotals={sectionTotals}
          isEditMode={isEditMode}
          onValueChange={handleValueChange}
        />

        {/* Final Calculation Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <FinalCalculation
            manualAdjustments={manualAdjustments}
            onManualAdjustmentChange={handleManualAdjustmentChange}
            totalOutputVAT={totalOutputVAT}
            totalInputVAT={totalInputVAT}
            adjustedVatDue={adjustedVatDue}
            vatDue={vatDue}
            isEditMode={isEditMode}
          />
        </div>

        {/* Detailed Breakdown */}
        <DetailedBreakdown
          vatSummary={vatSummary}
          showDetailedBreakdown={showDetailedBreakdown}
        />
      </div>
    </div>
  );
};

export default MonthlySummaryPage;
