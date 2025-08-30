"use client";

import * as XLSX from "sheetjs-style";
import { TaxData } from "./AccountantTaxViewer"; // Adjust the import path

export const costBuildUPExcel = (declaration: TaxData) => {
  // Prepare data for Excel
  const worksheetData = [
    // Header row (37 columns)
    [
      "Item No",
      "Description",
      "Unit",
      "Qty",
     " exchange rate",
      "Unit Price",
      "FOB Cost",
      "Subtotal",
      "External Freight",
      "Djibouti Clearance",
      "Inland Freight 1",
      "Insurance Cost",
      "Total Freight Cost", // Sum of all freight-related costs
      "DPV", // Duty Payable Value (customs valuation)
      "Custom Duty Tax", // Import duty tax calculated on DPV
      "Custom Excise", // Excise tax on specific goods
      "Surtax", // Additional surtax if applicable
      "Social Welfare", // Social welfare tax contribution
      "VAT", // Value Added Tax
      "Scanning Fee", // Container scanning fee at port
      "Withholding Tax 3%", // 3% withholding tax on imports
      "Total Tax", // Sum of all taxes and fees
      "Inland Freight 2", // Additional domestic transportation
      "Bank Service Charge", // Bank charges for LC or transfer
      "Transportation Cost", // Final delivery transportation cost
      "Warehouse Fee", // Storage fees at warehouse
      "Warehouse Fee VAT", // VAT on warehouse fees
      "Empty Container Loading Cost", // Cost to load empty containers
      "Empty Container Loading Cost VAT", // VAT on container loading
      "Transitor Fee", // Fee for transit services
      "Transitor Fee VAT", // VAT on transit services
      "Grand in ETB", // Total cost in Ethiopian Birr
      "Total VAT", // Total VAT paid across all items
      "Total Withholding", // Total withholding tax paid
      "Unit Cost in ETB", // Cost per unit in Ethiopian Birr
      "Unit", // Unit of measurement (repeated for clarity)
      "Penalty Paid to Customs", // Any penalties paid to customs
      "Total Taxes Paid to Customs", // Sum of all taxes paid to customs
    ],

    // Data rows for each item

    ...declaration.iteminfo.map((item, i) => {
      // Calculate total freight cost for this item
      const totalFreightCost = ((item.inlandFreight1 || 0) +
        (item.djibouticost || 0) +
        (item.insurancecost || 0) +
        (item.externalfreight || 0));

      // Return exactly 37 columns to match the header
      return [
        i + 1, // Item number (sequential)
        item.itemdescription || "-", // Item description
        "M", // Unit (to be filled with actual unit if available)
        item.quantity || 0, // Quantity of items
         declaration.exchangerate, //exchange rate

        item.unitprice || 0, // Price per unit
          "",// Total FOB cost for declaration
        (item.quantity || 0) * (item.unitprice || 0), // Subtotal (Qty × Unit Price)
        item.externalfreight || 0, // External freight cost for this item
        item.djibouticost || 0, // Djibouti clearance cost for this item
        item.inlandFreight1 || 0, // Inland freight part 1 for this item
        item.insurancecost || 0, // Insurance cost for this item
        totalFreightCost, // Total Freight Cost
        item.taxAmountPerItem?.[0]?.dpvAmountPerItem || 0, // DPV for this item
        item.taxAmountPerItem?.[0]?.dutyTax || 0, // Duty tax for this item
        item.taxAmountPerItem?.[0]?.exciseTax || 0, // Excise tax for this item
        item.taxAmountPerItem?.[0]?.surtax || 0, // Surtax for this item
        item.taxAmountPerItem?.[0]?.socialWelfareTax || 0, // Social welfare tax
        item.taxAmountPerItem?.[0]?.vat || 0, // VAT for this item
        item.taxAmountPerItem?.[0]?.scanningFee || 0, // Scanning fee for this item
        item.taxAmountPerItem?.[0]?.withholdingTax || 0, // Withholding tax for this item
        item.taxAmountPerItem?.[0]?.totalTaxPerItem || 0, // Total tax for this item
        item.inlandFeright2PerItem || 0, // Inland freight part 2 for this item
        item.bankServicePerItem || 0, // Bank service charge for this item
        item.transportFeePerItem || 0, // Transportation cost for this item
        item.warehousePerItem || 0, // Warehouse fee for this item
        0, // Warehouse Fee VAT (to be calculated if needed)
        item.loadingCostPerItem || 0, // Empty container loading cost
        0, // Empty Container Loading Cost VAT (to be calculated if needed)
        item.transitorPerItem || 0, // Transitor fee for this item
        0, // Transitor Fee VAT (to be calculated if needed)
        item.grandTotalInETBPerItem || 0, // Grand total in ETB for this item
        declaration.totalVatPerDeclaration || 0, // Total VAT for declaration
        declaration.totalWithholding || 0, // Total withholding for declaration
        item.unitCostInETBPerItem || 0, // Unit cost in ETB for this item
        "_", // Unit (repeated for consistency)
        0, // Penalty Paid to Customs (if any)
        item.taxAmountPerItem?.[0]?.totalTaxPerDeclaration || 0, // Total taxes to customs
      ];
    }),

    // Total row (summarizing all items) - Corrected to 37 columns
    [
      "TOTAL:", // Label for total row
      "", // Empty for description
      "", // Empty for unit

      // Total quantity (sum of all items)
      declaration.iteminfo.reduce((sum, item) => sum + (item.quantity || 0), 0),
        "",//  declaration.exchangerate,
      // unit price
       declaration.iteminfo.reduce(
        (sum, item) => sum + ( (item.unitprice || 0)),
        0
      ), //  for unit price
      declaration.totalFob,// Total FOB cost

      // Total subtotal (sum of all item subtotals)
      declaration.iteminfo.reduce(
        (sum, item) => sum + ((item.quantity || 0) * (item.unitprice || 0)),
        0
      ),

      // Total external freight (sum across all items)
      declaration.totalExternalFreight || 0,

      // Total Djibouti clearance (sum across all items)
      declaration.totalDjibouticost || 0,

      // Total inland freight 1 (sum across all items)
      declaration.totalInlandFreight1 || 0,

      // Total insurance cost (sum across all items)
      declaration.totalInsurancecost || 0,

      // Total freight cost (sum of all freight components across items)
      declaration.iteminfo.reduce(
        (sum, item) =>
          sum +
          ((item.inlandFreight1 || 0) +
            (item.djibouticost || 0) +
            (item.insurancecost || 0) +
            (item.externalfreight || 0)),
        0
      ),
      declaration.totaldpvAmountPerDeclaration || 0, // Total DPV
      declaration.totaldutyTax || 0, // Total duty tax
      declaration.totalexciseTax || 0, // Total excise tax
      declaration.totalsurtax || 0, // Total surtax
      declaration.totalsocialWelfareTax || 0, // Total social welfare tax
      declaration.totalvat || 0, // Total VAT
      declaration.totalscanningFee || 0, // Total scanning fee
      declaration.totalwithholdingTax || 0, // Total withholding tax
      declaration.totalTaxPerDeclaration || 0, // Total tax

      // Total inland freight 2 (sum across all items)
      declaration.iteminfo.reduce(
        (sum, item) => sum + (item.inlandFeright2PerItem || 0),
        0
      ),
      declaration.totalBankService || 0, // Total bank service charges
      declaration.totalTransportFee || 0, // Total transportation fees
      declaration.totalWareHouseFee || 0, // Total warehouse fees
      0, // Total Warehouse Fee VAT (to be calculated if needed)

      // Total loading cost (sum across all items)
      declaration.iteminfo.reduce(
        (sum, item) => sum + (item.loadingCostPerItem || 0),
        0
      ),
      0, // Total Empty Container Loading Cost VAT (to be calculated if needed)
      declaration.totalTransitorFee || 0, // Total transitor fees
      0, // Total Transitor Fee VAT (to be calculated if needed)
      declaration.grandTotalInETB || 0, // Grand total in ETB
      declaration.totalVatPerDeclaration || 0, // Total VAT
      declaration.totalWithholding || 0, // Total withholding
      declaration.iteminfo.reduce(
        (sum, item) => sum + (item.unitCostInETBPerItem || 0),
        0
      ), // Sum of Unit Cost in ETB (Note: This is a sum, not an average)
      "", // Empty for unit
      0, // Total Penalty Paid to Customs (if any)
      declaration.totalTaxPerDeclaration || 0, // Total taxes paid to customs
    ],
  ];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Columns to style (1-based indexing)
  // Corrected the array to only include existing columns up to 37
  const highlightColumns = [4, 13, 22, 34, 35, 36, 37];

  // Apply yellow background & black text to header and data cells
  const range = XLSX.utils.decode_range(worksheet["!ref"]!);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    if (highlightColumns.includes(C + 1)) {
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ c: C, r: R });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
          fill: { fgColor: { rgb: "FFFF00" } }, // Yellow background
          font: { color: { rgb: "000000" }, bold: true }, // Black bold text
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          },
        };
      }
    }
  }

  // Auto-fit columns based on max length
  const colWidths = worksheetData[0].map((_, i) => {
    let maxLength = 10; // default min width
    for (let j = 0; j < worksheetData.length; j++) {
      const cell = worksheetData[j][i];
      if (cell) {
        const length = cell.toString().length;
        if (length > maxLength) maxLength = length;
      }
    }
    return { wch: maxLength + 5 }; // padding
  });
  worksheet["!cols"] = colWidths;

  // Optional: set header row height
  worksheet["!rows"] = worksheetData.map((_, r) =>
    r === 0 ? { hpt: 30 } : { hpt: 20 }
  );

  // Append worksheet and generate Excel file
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tax Declaration");
  XLSX.writeFile(
    workbook,
    `tax_declaration_${declaration.declarationNumber}.xlsx`
  );
};
