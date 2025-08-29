'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DJANGO_BASE_URL } from '../api/api';
import { SPRING_BASE_URL } from '../api/api';
import { FormReportResponse, ReceiptData } from '../local-data-forms/types';
import { useAuth } from '../../Context/AuthContext';

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
  const { token, user, isLoading: authLoading } = useAuth();
  const [importExport, setImportExport] = useState<any | null>(null);
  // Initialize with current month date range
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startOfMonth.toISOString().split('T')[0],
    endDate: endOfMonth.toISOString().split('T')[0]
  });
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(true);
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableValues, setEditableValues] = useState<EditableValues>({});
  const [manualAdjustments, setManualAdjustments] = useState<ManualAdjustments>({
    vatOnGovernmentVoucher: 0,
    otherCredits: 0,
    creditCarriedForward: 0,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Parse JWT token to get company information
  const parseJwt = (token: string): any => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

// Get company information from token when available
const getCompanyInfo = () => {
  if (!token) return {};
  const decodedToken = parseJwt(token);
  return {
    company: decodedToken?.company_name,
    tin: decodedToken?.tin_number,
    company_address: decodedToken?.Region,
    Phone_number: decodedToken?.PhoneNumber,
    woreda: decodedToken?.Wereda,
    kebele: decodedToken?.Kebele
  };
};




  const fetchReceipts = async () => {
    if (!token || authLoading) {
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<FormReportResponse>(
        `${DJANGO_BASE_URL}/receipts`,{
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
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

  // Fetch Import/Export VAT from Spring backend and store raw response
  const fetchImportExportVat = async () => {
    try {
      if (!token) {
        //console.log('No token available for import/export VAT request');
        return;
      }
      
      const decoded = parseJwt(token);
      const userId = decoded?.user_id;
      
      if (!userId) {
        //console.log('No user_id found in token for import/export VAT request');
        return;
      }
      
      //console.log('Fetching import/export VAT for user:', userId);
      //console.log('Request URL:', `${SPRING_BASE_URL}/clerk/report/${userId}`);
      
      const response = await axios.get(`${SPRING_BASE_URL}/clerk/report/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      //console.log('Import/export VAT response:', response.data);
      setImportExport(response.data);
    } catch (e) {
      console.error('Error fetching import/export VAT:', e);
      if (axios.isAxiosError(e)) {
        console.error('Response status:', e.response?.status);
        console.error('Response data:', e.response?.data);
      }
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
    if (token && !authLoading) {
      fetchReceipts();
    }
  }, [token, authLoading]);

  // Separate useEffect for import/export VAT that depends on token
  useEffect(() => {
    if (token) {
      fetchImportExportVat();
    }
  }, [token]);

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

  // Build augmented summary by merging import/export totals and synthetic breakdowns
  const augmentedVatSummary: typeof vatSummary = React.useMemo(() => {
    if (!importExport) return vatSummary;
    const cloned: any = JSON.parse(JSON.stringify(vatSummary));

    const ensureEntry = (natureCode: string) => {
      if (!cloned[natureCode]) {
        cloned[natureCode] = { total: 0, vat: 0, count: 0, receipts: [] };
      }
    };

    // Helper to make a synthetic receipt row for breakdown
    const makeSyntheticReceipt = (
      natureCode: string,
      src: any
    ): ReceiptData => {
      const receipt: any = {
        id: Math.floor(Math.random() * 1e9),
        receipt_number: src.declarationnumber || 'N/A',
        receipt_date: src.declarationDate || '',
        calendar_type: 'Gregorian',
        issued_by_details: { id: 0, name: '-', tin_number: '-', address: '-' },
        issued_to_details: { id: 0, name: '-', tin_number: '-', address: '-' },
        receipt_category_id: 0,
        receipt_kind_id: 0,
        receipt_type_id: 0,
        receipt_name_id: 0,
        receipt_category: 'Import/Export',
        receipt_kind: '-',
        receipt_type: '-',
        receipt_name: '-',
        is_withholding_applicable: false,
        payment_method_type: '-',
        bank_name: '-',
        items: [
          {
            id: Math.floor(Math.random() * 1e9),
            item: {
              item_code: src.hscode || '-',
              item_description: src.itemdescription || '-',
              unit_of_measurement: src.unitofmeasurement || '-',
              gl_account: '-',
              nature: String(natureCode),
              tax_type: 'VAT',
              unit_cost: String(src.unitCost ?? 0)
            },
            quantity: String(src.quantity ?? 1),
            unit_cost: String(src.unitCost ?? 0),
            tax_type: 'VAT',
            tax_amount: String(src.vatPeritem ?? 0),
            discount_amount: '0',
            subtotal: Number(src.costPeritem ?? 0),
            total_after_tax: Number((src.costPeritem ?? 0) + (src.vatPeritem ?? 0))
          }
        ],
        purchase_recipt_number: null,
        withholding_receipt_number: null,
        reason_of_receiving: null,
        created_at: '',
        updated_at: '',
        subtotal: String(src.costPeritem ?? 0),
        tax: String(src.vatPeritem ?? 0),
        total: String((src.costPeritem ?? 0) + (src.vatPeritem ?? 0)),
        withholding_amount: '0',
        net_payable_to_supplier: '0',
        documents: {}
      };
      return receipt as ReceiptData;
    };

    // Map nature code totals from backend
    const additions: Array<{ code: string; total: number; vat: number; items: any[] }>
      = [
        { code: '110', total: Number(importExport.totalcost110 || 0), vat: Number(importExport.vatAmount115 || 0), items: importExport.item110 || [] },
        { code: '75',  total: Number(importExport.totalcost75 || 0),  vat: Number(importExport.vatAmoutn80 || 0),  items: importExport.item75 || [] },
        { code: '85',  total: Number(importExport.totalcost85 || 0),  vat: 0,                                             items: importExport.item85 || [] },
        { code: '130', total: Number(importExport.totalcost130 || 0), vat: 0,                                             items: importExport.item130 || [] },
      ];

    additions.forEach(({ code, total, vat, items }) => {
      if (total === 0 && vat === 0 && (!items || items.length === 0)) return;
      ensureEntry(code);
      cloned[code].total += total;
      cloned[code].vat += vat;
      cloned[code].count += items?.length || 0;
      if (items && items.length > 0) {
        const syntheticReceipts = items.map((it: any) => makeSyntheticReceipt(code, it));
        // Avoid duplicates by using receipt_number key
        const existingKeys = new Set((cloned[code].receipts || []).map((r: ReceiptData) => r.receipt_number));
        syntheticReceipts.forEach((sr: ReceiptData) => {
          if (!existingKeys.has(sr.receipt_number)) {
            cloned[code].receipts.push(sr);
          }
        });
      }
    });

    return cloned;
  }, [vatSummary, importExport]);

  const currentValuesBase = getCurrentValues(augmentedVatSummary, isEditMode, editableValues);

  // Use current values derived from augmented summary to avoid double counting
  const currentValues = currentValuesBase;

  const sectionTotals = calculateSectionTotals(augmentedVatSummary, currentValues);

  // Calculate final VAT due/credit with manual adjustments
  const totalOutputVAT = sectionTotals.output.vat;
  const totalInputVAT = sectionTotals.capital.vat + sectionTotals.nonCapital.vat;
  const baseVatDue = totalOutputVAT - totalInputVAT;
  
  // Apply manual adjustments
  const adjustedVatDue = baseVatDue - manualAdjustments.vatOnGovernmentVoucher - manualAdjustments.otherCredits;
  const finalVatDue = adjustedVatDue - manualAdjustments.creditCarriedForward;
  const vatDue = finalVatDue;
  const [reportPage, setReportPage] = useState<number>(1);
  const receiptsPerDetailPage = 15;
  const detailedTotalPages = React.useMemo(() => {
    const pages = Object.entries(vatSummary).map(([natureCode, data]) => {
      const count = data.receipts
        .flatMap(r => r.items.filter(i => i.item.nature === natureCode)).length;
      return Math.ceil((count || 0) / receiptsPerDetailPage) || 1;
    });
    const maxPages = pages.length ? Math.max(...pages) : 1;
    return Math.max(1, maxPages);
  }, [vatSummary]);
  const maxReportPage = 2 + detailedTotalPages;

  // Download handlers
  const handleDownloadPDF = () => {
    downloadPDF(
      dateRange,
      currentValues,
      vatSummary,
      sectionTotals,
      manualAdjustments,
      adjustedVatDue,
      vatDue,
      {
        name: getCompanyInfo().company,
        tin: getCompanyInfo().tin,
        region: getCompanyInfo().company_address,
        woreda: getCompanyInfo().woreda,
        kebele: getCompanyInfo().kebele,
        phone: getCompanyInfo().Phone_number
      }
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
          onToggleDetailedBreakdown={() => {}}
          showDetailedBreakdown={true}
          onDownloadPDF={handleDownloadPDF}
          onDownloadCSV={handleDownloadCSV}
          hasData={Object.keys(vatSummary).length > 0}
        />

        <div className="flex items-center justify-end gap-2 mb-4">
          <button
            onClick={() => setReportPage(Math.max(1, reportPage - 1))}
            disabled={reportPage <= 1}
            className="px-3 py-1 rounded-md text-sm bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">Page {reportPage} of {maxReportPage}</span>
          <button
            onClick={() => setReportPage(Math.min(maxReportPage, reportPage + 1))}
            disabled={reportPage >= maxReportPage}
            className="px-3 py-1 rounded-md text-sm bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>

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

        {/* VAT Summary Overview
        <SummaryCards
          totalOutputVAT={totalOutputVAT}
          totalInputVAT={totalInputVAT}
          vatDue={vatDue}
        /> */}

{/* Taxpayer Information - formatted to match the provided sample */}
{reportPage === 1 && (
<div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8 text-black">
  <div className="border border-black">
    <div className="bg-gray-200 px-3 py-2 border-b border-black text-center">
      <h3 className="font-bold">Section 1 - Taxpayer Information</h3>
    </div>
    <div className="text-sm">
      {/* Header row: Name | TIN | Tax Period (Mon, Year) */}
      <div className="grid grid-cols-12">
        <div className="col-span-6 border-b border-r border-black p-2">
          <p className="font-semibold">Taxpayer's Name:</p>
                          <p className="mt-1">{getCompanyInfo().company || '-'}</p>
        </div>
        <div className="col-span-3 border-b border-r border-black p-2">
          <p className="font-semibold">TIN:</p>
                          <p className="mt-1">{getCompanyInfo().tin || '-'}</p>
        </div>
        <div className="col-span-3 border-b border-black p-2">
          <p className="font-semibold">Tax Period:</p>
          <p className="mt-1">
            {dateRange?.endDate
              ? new Date(dateRange.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
              : '-'}
          </p>
        </div>
      </div>

      {/* Second row: Registration Address | Tax Account Number | Official Use Only (placeholder) */}
      <div className="grid grid-cols-12">
        <div className="col-span-6 border-b border-r border-black p-2">
          <p className="font-semibold">Registration Address:</p>
          <div className="mt-1 grid grid-cols-6 gap-2">
            {/* <div className="col-span-3">
              <p className="text-xs font-medium">House No.</p>
              <p>-</p>
            </div> */}
            {/* <div className="col-span-3">
              <p className="text-xs font-medium">Po.Box</p>
              <p>-</p>
            </div> */}

            
           
            <div className="col-span-3">
              <p className="text-xs font-medium">Woreda</p>
              <p>{getCompanyInfo().woreda || '-'}</p>
            </div>
            {/* <div className="col-span-3">
              <p className="text-xs font-medium">Zone/Sub-City</p>
              <p>-</p>
            </div> */}
            <div className="col-span-3">
              <p className="text-xs font-medium">Region</p>
              <p>{getCompanyInfo().company_address || '-'}</p>
            </div>
            <div className="col-span-3">
              <p className="text-xs font-medium">Kebele</p>
              <p>{getCompanyInfo().kebele || '-'}</p>
            </div>
            {/* <div className="col-span-6">
              <p className="text-xs font-medium">Country</p>
              <p>Ethiopia</p>
            </div> */}
            <div className="col-span-6">
              <p className="text-xs font-medium">Telephone Number</p>
              <p>{getCompanyInfo().Phone_number || '-'}</p>
            </div>
          </div>
        </div>
        <div className="col-span-3 border-b border-r border-black p-2">
          <p className="font-semibold">Tax Account Number:</p>
          <p className="mt-1">-</p>
          <div className="mt-4">
            <p className="font-semibold">Tax Centre:</p>
            <p className="mt-1 whitespace-pre-line">-</p>
          </div>
        </div>
        <div className="col-span-3 border-b border-black p-2">
          <p className="font-semibold">(Official Use Only)</p>
          <div className="mt-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs font-medium">Document Number</p>
                <p>-</p>
              </div>
              <div>
                <p className="text-xs font-medium">Document Date</p>
                <p>-</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs font-medium">Submission Number</p>
                <p>-</p>
              </div>
              <div>
                <p className="text-xs font-medium">Submission Date</p>
                <p>-</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
)}

{reportPage <= 2 && (
  <div className="bg-gray-200 px-3 py-2 border-b border-black text-center text-black" >
      <h3 className="font-bold">Section 2 - Tax Declaration</h3>
    </div>
)}

        {/* VAT Form Structure */}
        {reportPage === 1 && (
          <VATTables
            vatSummary={augmentedVatSummary}
            currentValues={currentValues}
            sectionTotals={sectionTotals}
            isEditMode={isEditMode}
            onValueChange={handleValueChange}
            sectionType="output"
          />
        )}
        {reportPage === 2 && (
          <>
            <VATTables
              vatSummary={augmentedVatSummary}
              currentValues={currentValues}
              sectionTotals={sectionTotals}
              isEditMode={isEditMode}
              onValueChange={handleValueChange}
              sectionType="capital"
            />
            <VATTables
              vatSummary={augmentedVatSummary}
              currentValues={currentValues}
              sectionTotals={sectionTotals}
              isEditMode={isEditMode}
              onValueChange={handleValueChange}
              sectionType="nonCapital"
            />
          </>
        )}

        {/* Final Calculation Section */}
        {reportPage === 2 && (
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
        )}

        {/* Detailed Breakdown */}
        {reportPage >= 3 && (
          <DetailedBreakdown
            vatSummary={augmentedVatSummary}
            showDetailedBreakdown={true}
            globalPage={reportPage - 2}
            receiptsPerPage={receiptsPerDetailPage}
          />
        )}
      </div>
    </div>
  );
};

export default MonthlySummaryPage;
