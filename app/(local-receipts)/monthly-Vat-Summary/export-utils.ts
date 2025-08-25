import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { natureCodeMappings } from './constants';
import { formatCurrency, formatDateRange } from './utils';
import { EditableValues, VATSummaryData, SectionTotals, ManualAdjustments, DateRange } from './types';

export const downloadPDF = (
  dateRange: DateRange,
  currentValues: EditableValues,
  vatSummary: { [key: string]: VATSummaryData },
  sectionTotals: SectionTotals,
  manualAdjustments: ManualAdjustments,
  adjustedVatDue: number,
  vatDue: number,
  taxpayerInfo?: {
    name?: string;
    tin?: string;
    region?: string;
    woreda?: string;
    kebele?: string;
    phone?: string;
  }
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header Information
  doc.setFontSize(16);
  doc.text('VALUE ADDED TAX DECLARATION', pageWidth / 2, 20, { align: 'center' });
  
  // Period Information
  doc.setFontSize(12);
  doc.text(`Period: ${formatDateRange(dateRange)}`, pageWidth / 2, 35, { align: 'center' });
  // doc.text(`Report Generated: ${new Date().toLocaleDateString('en-US', { 
  //   year: 'numeric', 
  //   month: 'long', 
  //   day: 'numeric',
  //   hour: '2-digit',
  //   minute: '2-digit'
  // })}`, 20, 50);
  
  let currentY = 50;

  // Section 1 - Taxpayer Information (if provided)
  if (taxpayerInfo) {
    doc.setFont('helvetica', 'bold');
    doc.text('Section 1 - Taxpayer Information', pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;

    doc.setFont('helvetica', 'normal');
    const leftX = 20;
    const midX = pageWidth / 2 + 5;
    const labelGap = 4;
    const lineGap = 7;

    // Left column
    doc.text(`Taxpayer's Name:`, leftX, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text(`${taxpayerInfo.name || '-'}`, leftX + 45, currentY);
    doc.setFont('helvetica', 'normal');
    currentY += lineGap;

    doc.text(`TIN:`, leftX, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text(`${taxpayerInfo.tin || '-'}`, leftX + 45, currentY);
    doc.setFont('helvetica', 'normal');
    currentY += lineGap;

    doc.text(`Region:`, leftX, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text(`${taxpayerInfo.region || '-'}`, leftX + 45, currentY);
    doc.setFont('helvetica', 'normal');
    currentY += lineGap;

    // Right column (aligned starting from initial y of section)
    let rightY = currentY - (lineGap * 3);
    doc.text(`Tax Period:`, midX, rightY);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `${new Date(dateRange.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`,
      midX + 35,
      rightY
    );
    doc.setFont('helvetica', 'normal');
    rightY += lineGap;

    doc.text(`Woreda:`, midX, rightY);
    doc.setFont('helvetica', 'bold');
    doc.text(`${taxpayerInfo.woreda || '-'}`, midX + 35, rightY);
    doc.setFont('helvetica', 'normal');
    rightY += lineGap;

    doc.text(`Kebele:`, midX, rightY);
    doc.setFont('helvetica', 'bold');
    doc.text(`${taxpayerInfo.kebele || '-'}`, midX + 35, rightY);
    doc.setFont('helvetica', 'normal');
    rightY += lineGap;

    doc.text(`Phone:`, midX, rightY);
    doc.setFont('helvetica', 'bold');
    doc.text(`${taxpayerInfo.phone || '-'}`, midX + 35, rightY);
    doc.setFont('helvetica', 'normal');

    // Move currentY below the right column
    currentY = Math.max(currentY, rightY) + 12;
  }
  
  // COMPUTATION OF OUTPUT TAX Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPUTATION OF OUTPUT TAX', 20, currentY);
  currentY += 10;
  
  const outputTaxData = [
    ['Line', 'Description', 'Total Amount', 'Line', 'Output VAT']
  ];
  
  // Add output tax entries
  Object.entries(natureCodeMappings)
    .filter(([_, mapping]) => mapping.section === 'output')
    .sort(([_, a], [__, b]) => a.lineNumber - b.lineNumber)
    .forEach(([natureCode, mapping]) => {
      const currentData = currentValues[natureCode] || { total: 0, vat: 0 };
      const isShaded = ['15', '20'].includes(natureCode);
      
      outputTaxData.push([
        mapping.lineNumber.toString(),
        mapping.label,
        formatCurrency(currentData.total),
        mapping.vatLineNumber?.toString() || '-',
        isShaded ? '' : formatCurrency(currentData.vat)
      ]);
    });
  
  // Add total row
  outputTaxData.push([
    '55',
    'Total sales/Supplies',
    formatCurrency(sectionTotals.output.total),
    '60',
    formatCurrency(sectionTotals.output.vat)
  ]);
  
  autoTable(doc, {
    head: [outputTaxData[0]],
    body: outputTaxData.slice(1),
    startY: currentY,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 80 },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' }
    },
    didParseCell: function (data) {
      // Shade specific rows (lines 15, 20)
      if (data.section === 'body') {
        const lineNumber = (data.row.raw as string[])[0];
        if (lineNumber === '15' || lineNumber === '20') {
          data.cell.styles.fillColor = [200, 200, 200];
        }
        // Highlight total row
        if (lineNumber === '55') {
          data.cell.styles.fillColor = [220, 220, 220];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 20;
  
  // CAPITAL ASSET PURCHASES Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CAPITAL ASSET PURCHASES', 20, currentY);
  currentY += 10;
  
  const capitalAssetsData = [
    ['Line', 'Description', 'Total Amount', 'Line', 'Input VAT']
  ];
  
  // Add capital asset entries
  Object.entries(natureCodeMappings)
    .filter(([_, mapping]) => mapping.section === 'capital')
    .sort(([_, a], [__, b]) => a.lineNumber - b.lineNumber)
    .forEach(([natureCode, mapping]) => {
      const currentData = currentValues[natureCode] || { total: 0, vat: 0 };
      const isShaded = ['85'].includes(natureCode);
      
      capitalAssetsData.push([
        mapping.lineNumber.toString(),
        mapping.label,
        formatCurrency(currentData.total),
        mapping.vatLineNumber?.toString() || '-',
        isShaded ? '' : formatCurrency(currentData.vat)
      ]);
    });
  
  // Add total row
  capitalAssetsData.push([
    '90',
    'Total capital assets',
    formatCurrency(sectionTotals.capital.total),
    '95',
    formatCurrency(sectionTotals.capital.vat)
  ]);
  
  autoTable(doc, {
    head: [capitalAssetsData[0]],
    body: capitalAssetsData.slice(1),
    startY: currentY,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 80 },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' }
    },
    didParseCell: function (data) {
      // Shade specific rows (line 85)
      if (data.section === 'body') {
        const lineNumber = (data.row.raw as string[])[0];
        if (lineNumber === '85') {
          data.cell.styles.fillColor = [200, 200, 200];
        }
        // Highlight total row
        if (lineNumber === '90') {
          data.cell.styles.fillColor = [220, 220, 220];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 20;
  
  // Force NON-CAPITAL ASSET PURCHASES to start on a new page (Page 2)
  doc.addPage();
  currentY = 20;
  
  // NON-CAPITAL ASSET PURCHASES Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('NON-CAPITAL ASSET PURCHASES', 20, currentY);
  currentY += 10;
  
  const nonCapitalAssetsData = [
    ['Line', 'Description', 'Total Amount', 'Line', 'Input VAT']
  ];
  
  // Add non-capital asset entries
  Object.entries(natureCodeMappings)
    .filter(([_, mapping]) => mapping.section === 'nonCapital')
    .sort(([_, a], [__, b]) => a.lineNumber - b.lineNumber)
    .forEach(([natureCode, mapping]) => {
      const currentData = currentValues[natureCode] || { total: 0, vat: 0 };
      const isShaded = ['130'].includes(natureCode);
      
      nonCapitalAssetsData.push([
        mapping.lineNumber.toString(),
        mapping.label,
        formatCurrency(currentData.total),
        mapping.vatLineNumber?.toString() || '-',
        isShaded ? '' : formatCurrency(currentData.vat)
      ]);
    });
  
  // Add total row
  nonCapitalAssetsData.push([
    '165',
    'Total inputs',
    formatCurrency(sectionTotals.nonCapital.total),
    '170',
    formatCurrency(sectionTotals.nonCapital.vat)
  ]);
  
  autoTable(doc, {
    head: [nonCapitalAssetsData[0]],
    body: nonCapitalAssetsData.slice(1),
    startY: currentY,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 80 },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' }
    },
    didParseCell: function (data) {
      // Shade specific rows (line 130)
      if (data.section === 'body') {
        const lineNumber = (data.row.raw as string[])[0];
        if (lineNumber === '130') {
          data.cell.styles.fillColor = [200, 200, 200];
        }
        // Highlight total row
        if (lineNumber === '165') {
          data.cell.styles.fillColor = [220, 220, 220];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 20;
  
  // Check if we need a new page
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }
  
  // Final Calculation Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FINAL CALCULATION', 20, currentY);
  currentY += 10;
  
  const finalCalculationData = [
    ['Line', 'Description', 'Amount']
  ];
  
  // Add final calculation entries
  finalCalculationData.push([
    '175',
    'VAT on Government Voucher',
    formatCurrency(manualAdjustments.vatOnGovernmentVoucher)
  ]);
  
  finalCalculationData.push([
    '180',
    'Other credits for the month (payments, goods on hand)',
    formatCurrency(manualAdjustments.otherCredits)
  ]);
  
  finalCalculationData.push([
    '185',
    'VAT due for month (Line 60-95-170-175-180)',
    adjustedVatDue >= 0 ? formatCurrency(adjustedVatDue) : formatCurrency(0)
  ]);
  
  finalCalculationData.push([
    '190',
    'VAT credit for the month (Line 95+170+180-60)',
    adjustedVatDue < 0 ? formatCurrency(Math.abs(adjustedVatDue)) : formatCurrency(0)
  ]);
  
  finalCalculationData.push([
    '195',
    'Credit Carried forward from Previous Month',
    formatCurrency(manualAdjustments.creditCarriedForward)
  ]);
  
  finalCalculationData.push([
    '200',
    'Amount to be paid (Line 185-195)',
    vatDue >= 0 ? formatCurrency(Math.max(0, vatDue)) : formatCurrency(0)
  ]);
  
  finalCalculationData.push([
    '205',
    'Credit Available for carry forward (Line 190+195-185)',
    vatDue < 0 ? formatCurrency(Math.abs(vatDue)) : formatCurrency(manualAdjustments.creditCarriedForward)
  ]);
  
  autoTable(doc, {
    head: [finalCalculationData[0]],
    body: finalCalculationData.slice(1),
    startY: currentY,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 110 },
      2: { cellWidth: 40, halign: 'right' }
    },
    didParseCell: function (data) {
      if (data.section === 'body') {
        const lineNumber = (data.row.raw as string[])[0];
        // Highlight key calculation lines
        if (['185', '190', '200', '205'].includes(lineNumber)) {
          data.cell.styles.fontStyle = 'bold';
          if (lineNumber === '200') {
            data.cell.styles.fillColor = [200, 255, 200]; // Green for amount to be paid
          } else if (lineNumber === '205') {
            data.cell.styles.fillColor = [255, 200, 255]; // Purple for credit carry forward
          } else if (lineNumber === '185') {
            data.cell.styles.fillColor = [200, 200, 255]; // Blue for VAT due
          } else if (lineNumber === '190') {
            data.cell.styles.fillColor = [255, 220, 200]; // Orange for VAT credit
          }
        }
        // Highlight manual adjustment lines
        if (['175', '180', '195'].includes(lineNumber)) {
          data.cell.styles.fillColor = [255, 255, 200]; // Yellow for manual adjustments
        }
      }
    }
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 20;

  // Start DETAILED BREAKDOWN on a fresh page (Page 3)
  doc.addPage();
  currentY = 20;

  // DETAILED BREAKDOWN Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }
  doc.text('DETAILED BREAKDOWN', 20, currentY);
  currentY += 8;

  // Iterate by nature code and render item-level tables
  const natureEntries = Object.entries(vatSummary)
    .sort(([a], [b]) => {
      const ma = natureCodeMappings[a];
      const mb = natureCodeMappings[b];
      if (!ma || !mb) return a.localeCompare(b);
      return ma.lineNumber - mb.lineNumber;
    });

  natureEntries.forEach(([natureCode, data], idx) => {
    const mapping = natureCodeMappings[natureCode];
    const title = ` ${natureCode}${mapping ? ` - ${mapping.label}` : ''}`;

    // Collect all matching items across receipts for this nature code
    const rows: any[] = [];
    data.receipts.forEach(receipt => {
      const date = new Date(receipt.receipt_date).toLocaleDateString('en-ET', { year: 'numeric', month: 'short', day: 'numeric' });
      const receiptNumber = receipt.receipt_number;
      receipt.items
        .filter(it => it.item.nature === natureCode)
        .forEach(it => {
          const qty = Number(it.quantity);
          const unitCost = Number(it.unit_cost || it.item.unit_cost);
          const subtotal = Number(it.subtotal);
          const taxType = it.tax_type || it.item.tax_type || '';
          const taxAmount = Number(it.tax_amount || 0);
          rows.push([
            date,
            receiptNumber,
            it.item.item_description,
            String(qty),
            formatCurrency(unitCost),
            formatCurrency(subtotal),
            taxType,
            formatCurrency(taxAmount)
          ]);
        });
    });

    if (rows.length === 0) return;

    // Page break if needed before section title
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    // Section title for this nature code
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, currentY);
    currentY += 6;

    autoTable(doc, {
      head: [[
        'Date',
        'Receipt No',
        'Description',
        'Qty',
        'Unit Cost',
        'Subtotal',
        'Tax Type',
        'Tax'
      ]],
      body: rows,
      startY: currentY,
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak', cellWidth: 'wrap' },
      headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      // Right-align numerics, let widths auto-wrap to fit page
      columnStyles: {
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        7: { halign: 'right' }
      },
      margin: { left: 20, right: 20 },
      didDrawPage: () => {
        // Reset left margin title on new pages for this table
      }
    });

    // Update Y for next section or add page if close to end
    currentY = (doc as any).lastAutoTable.finalY + 14;
    if (idx < natureEntries.length - 1 && currentY > 240) {
      doc.addPage();
      currentY = 20;
    }
  });

  // Save the PDF
  const startDate = new Date(dateRange.startDate).toISOString().split('T')[0];
  const endDate = new Date(dateRange.endDate).toISOString().split('T')[0];
  doc.save(`VAT_Form_Structure_${startDate}_to_${endDate}.pdf`);
};

export const downloadCSV = (
  dateRange: DateRange,
  vatSummary: { [key: string]: VATSummaryData },
  totalOutputVAT: number,
  totalInputVAT: number,
  vatDue: number
) => {
  // Create CSV content with header information
  let csvContent = 'VAT SUMMARY REPORT\n';
  csvContent += `Period: ${formatDateRange(dateRange)}\n`;
  csvContent += `Report Generated: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}\n\n`;
  
  // Main table headers
  csvContent += 'Nature Code,Description,Total Amount,VAT Amount,Receipt Count,Tax Types\n';
  
  // Add nature code data
  Object.entries(vatSummary).forEach(([natureCode, data]) => {
    const mapping = natureCodeMappings[natureCode];
    // Get unique tax types for this nature code, but highlight VAT vs non-VAT
    const taxTypes = [...new Set(data.receipts.flatMap(receipt => 
      receipt.items
        .filter(item => item.item.nature === natureCode)
        .map(item => item.tax_type || item.item.tax_type || 'VAT')
    ))];
    const taxTypeDisplay = taxTypes.join(', ') + (taxTypes.length > 1 ? ' (VAT only in calc)' : '');
    
    csvContent += `${natureCode},"${mapping?.label || 'Unknown'}",${data.total},${data.vat},${data.count},"${taxTypeDisplay}"\n`;
  });
  
  // Add summary section
  csvContent += '\n';
  csvContent += 'Summary\n';
  csvContent += `Output VAT,,${totalOutputVAT},${totalOutputVAT}\n`;
  csvContent += `Input VAT,,${totalInputVAT},${totalInputVAT}\n`;
  csvContent += `${vatDue >= 0 ? 'VAT Due' : 'VAT Credit'},,${Math.abs(vatDue)},${Math.abs(vatDue)}\n`;
  
  // Create and download CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const startDate = new Date(dateRange.startDate).toISOString().split('T')[0];
  const endDate = new Date(dateRange.endDate).toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `VAT_Summary_${startDate}_to_${endDate}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
