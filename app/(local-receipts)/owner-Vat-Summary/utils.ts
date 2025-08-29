import { ReceiptData } from '../local-data-forms/types';
import { VATSummaryData, EditableValues, SectionTotals, MonthOption, DateRange } from './types';
import { natureCodeMappings, monthOptions, excludeVATCodes } from './constants';

// Currency formatting utility
export const formatCurrency = (amount: string | number): string => {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
  }).format(Number(amount));
};

// Get month name by month number
export const getMonthName = (monthNumber: number): string => {
  const monthOption = monthOptions.find(m => m.monthNumber === monthNumber);
  return monthOption ? monthOption.label : '';
};

// Filter receipts by month and year
export const filterReceiptsByMonth = (
  receiptsData: ReceiptData[], 
  month: number, 
  year: number
): ReceiptData[] => {
  return receiptsData.filter((receipt) => {
    const receiptDate = new Date(receipt.receipt_date);
    const receiptYear = receiptDate.getFullYear();
    const receiptMonth = receiptDate.getMonth() + 1;
    return receiptYear === year && receiptMonth === month;
  });
};

// Filter receipts by date range
export const filterReceiptsByDateRange = (
  receiptsData: ReceiptData[], 
  dateRange: DateRange
): ReceiptData[] => {
  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);
  
  // Set time to start of day for startDate and end of day for endDate
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return receiptsData.filter((receipt) => {
    const receiptDate = new Date(receipt.receipt_date);
    return receiptDate >= startDate && receiptDate <= endDate;
  });
};

// Format date range for display
export const formatDateRange = (dateRange: DateRange): string => {
  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);
  
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
};

// Calculate VAT summary by nature codes
export const calculateVATSummary = (filteredReceipts: ReceiptData[]): { [key: string]: VATSummaryData } => {
  const summary: { [key: string]: VATSummaryData } = {};

  //console.log('Filtered receipts:', filteredReceipts);
  //console.log('Number of filtered receipts:', filteredReceipts.length);

  filteredReceipts.forEach((receipt, receiptIndex) => {
   // console.log(`Receipt ${receiptIndex + 1}:`, receipt.id, 'Items:', receipt.items.length);
   // console.log(`Receipt total:`, receipt.total, 'Receipt tax:', receipt.tax);
    
    receipt.items.forEach((item, itemIndex) => {
      const natureCode = item.item.nature;
      const taxType = item.tax_type || item.item.tax_type;
      
     // console.log(`  Item ${itemIndex + 1}: Nature=${natureCode}, TaxType=${taxType}, Subtotal=${item.subtotal}, Tax=${item.tax_amount}`);
      //console.log(`  Item details:`, item);
      
      if (!summary[natureCode]) {
        summary[natureCode] = { total: 0, vat: 0, count: 0, receipts: [] };
      }
      
      // Check if this nature code should exclude VAT from calculations
      const shouldExcludeVAT = excludeVATCodes.includes(natureCode);
      
      if (shouldExcludeVAT) {
        // For excluded codes, only include subtotal, no VAT calculation
        summary[natureCode].total += Number(item.subtotal);
        summary[natureCode].vat = 0; // VAT is not considered for these codes
      } else {
        // Check if this is a VAT type item for VAT calculations
        const isVATType = taxType === 'VAT' || !taxType; // Consider empty/null as VAT
        
        // Special handling for TOT tax type
        if (taxType === 'TOT') {
          // For TOT items, Total Amount = Subtotal + VAT (both input and output VAT)
          const subtotal = Number(item.subtotal);
          const vatAmount = Number(item.tax_amount);
          const totalAmountForTOT = subtotal + vatAmount;
          
         // console.log(`  TOT Calculation: Subtotal=${subtotal} + VAT=${vatAmount} = Total=${totalAmountForTOT}`);
          
          summary[natureCode].total += totalAmountForTOT;
          // Only include VAT amount if it's actually a VAT type (TOT is not VAT for calculation purposes)
          summary[natureCode].vat += 0; // TOT doesn't contribute to VAT calculation
        } else {
          // Regular calculation for non-TOT items
          summary[natureCode].total += Number(item.subtotal);
          // Only include VAT amount if this is a VAT type item
          if (isVATType) {
            summary[natureCode].vat += Number(item.tax_amount);
          } else {
            summary[natureCode].vat += 0; // Non-VAT items don't contribute to VAT
          }
        }
      }
      
      summary[natureCode].count += 1;
      
      if (!summary[natureCode].receipts.find(r => r.id === receipt.id)) {
        summary[natureCode].receipts.push(receipt);
      }
    });
  });

  //console.log('Final summary:', summary);
  return summary;
};

// Calculate section totals
export const calculateSectionTotals = (
  vatSummary: { [key: string]: VATSummaryData },
  currentValues?: EditableValues
): SectionTotals => {
  const sections: SectionTotals = {
    output: { total: 0, vat: 0, count: 0 },
    capital: { total: 0, vat: 0, count: 0 },
    nonCapital: { total: 0, vat: 0, count: 0 }
  };

  const valuesToUse = currentValues || {};

  Object.entries(vatSummary).forEach(([natureCode, data]) => {
    const mapping = natureCodeMappings[natureCode];
    
    if (mapping) {
      const currentData = valuesToUse[natureCode] || { total: data.total, vat: data.vat };
      
      sections[mapping.section].total += currentData.total;
      // Only include VAT if the nature code is not in the exclude list
      if (!excludeVATCodes.includes(natureCode)) {
        sections[mapping.section].vat += currentData.vat;
      }
      sections[mapping.section].count += data.count;
    }
  });

  return sections;
};

// Get current values (either original or edited)
export const getCurrentValues = (
  vatSummary: { [key: string]: VATSummaryData },
  isEditMode: boolean,
  editableValues: EditableValues
): EditableValues => {
  if (isEditMode && Object.keys(editableValues).length > 0) {
    return editableValues;
  }
  
  const currentValues: EditableValues = {};
  Object.entries(vatSummary).forEach(([natureCode, data]) => {
    currentValues[natureCode] = {
      total: data.total,
      vat: data.vat,
    };
  });
  
  return currentValues;
};

// Validate edited values
export const validateValues = (
  editableValues: EditableValues,
  manualAdjustments: any
): string[] => {
  const errors: string[] = [];
  
  Object.entries(editableValues).forEach(([natureCode, values]) => {
    if (values.total < 0) {
      errors.push(`Nature code ${natureCode}: Total amount cannot be negative`);
    }
    if (values.vat < 0) {
      errors.push(`Nature code ${natureCode}: VAT amount cannot be negative`);
    }
    
    // Check if VAT makes sense relative to total (basic validation)
    const mapping = natureCodeMappings[natureCode];
    if (mapping && mapping.vatLineNumber && values.vat > values.total) {
      errors.push(`Nature code ${natureCode}: VAT amount cannot be greater than total amount`);
    }
  });
  
  // Validate manual adjustments
  Object.entries(manualAdjustments).forEach(([field, value]: [string, any]) => {
    if (typeof value === 'number' && value < 0) {
      errors.push(`${field}: Value cannot be negative`);
    }
  });
  
  return errors;
};
