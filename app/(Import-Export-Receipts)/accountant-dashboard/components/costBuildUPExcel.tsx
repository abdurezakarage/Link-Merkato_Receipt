"use client";
import * as XLSX from "sheetjs-style";
import { TaxData } from "./AccountantTaxViewer"; // Adjust the import path

export const costBuildUPExcel = (declaration: TaxData) => {
  // Prepare data for Excel
  const worksheetData = [
    // Header row
    [
      "Item No",
      "Description",
      "Unit",
      "Qty",
      "Unit Price",
      "FOB Cost",
      "Subtotal",
      "External Freight",
      "Djibouti Clearance",
      "Inland Freight 1",
      "Insurance Cost",
      "Total Freight Cost",
      "DPV",
      "Custom Duty Tax",
      "Custom Excise",
      "Surtax",
      "Social Welfare",
      "VAT",
      "Scanning Fee",
      "Withholding Tax 3%",
      "Total Tax",
      "Inland Freight 2",
      "Bank Service Charge",
      "Transportation Cost",
      "Warehouse Fee",
      "Warehouse Fee VAT",
      "Empty Container Loading Cost",
      "Empty Container Loading Cost VAT",
      "Transitor Fee",
      "Transitor Fee VAT",
      "Grand in ETB",
      "Total VAT",
      "Total Withholding",
      "Unit Cost in ETB",
      "Unit",
      "Penalty Paid to Customs",
      "Total Taxes Paid to Customs",
    ],

    // Data rows
    ...declaration.iteminfo.map((item, i) => [
      i + 1,
      item.itemdescription,
      "-", // Unit
      item.quantity,
      item.unitprice,
      "-", // FOB Cost
      item.quantity * item.unitprice, // Subtotal
      "-", // External Freight
      "-", // Djibouti Clearance
      "-", // Inland Freight 1
      "-", // Insurance Cost
      "-", // Total Freight Cost
      item.taxAmountPerItem?.[0]?.dpvAmountPerItem || "-",
      item.taxAmountPerItem?.[0]?.dutyTax || "-",
      item.taxAmountPerItem?.[0]?.exciseTax || "-",
      item.taxAmountPerItem?.[0]?.surtax || "-",
      item.taxAmountPerItem?.[0]?.socialWelfareTax || "-",
      item.taxAmountPerItem?.[0]?.vat || "-",
      item.taxAmountPerItem?.[0]?.scanningFee || "-",
      item.taxAmountPerItem?.[0]?.withholdingTax || "-",
      item.taxAmountPerItem?.[0]?.totalTaxPerItem || "-",
      item.inlandFeright2PerItem || "-",
      item.bankServicePerItem || "-",
      item.transportFeePerItem || "-",
      item.warehousePerItem || "-",
      "-", // Warehouse Fee VAT
      item.loadingCostPerItem || "-",
      "-", // Empty Container Loading Cost VAT
      item.transitorPerItem || "-",
      "-", // Transitor Fee VAT
      item.grandTotalInETBPerItem || "-",
      declaration.totalVatPerDeclaration || "-",
      declaration.totalWithholding || "-",
      item.unitCostInETBPerItem || "-",
      "-", // Unit
      "-", // Penalty Paid to Customs
      item.taxAmountPerItem?.[0]?.totalTaxPerDeclaration || "-",
    ]),

    // Total row
    [
      "TOTAL:",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      declaration.totaldpvAmountPerDeclaration || "-",
      declaration.totaldutyTax || "-",
      declaration.totalexciseTax || "-",
      declaration.totalsurtax || "-",
      declaration.totalsocialWelfareTax || "-",
      declaration.totalvat || "-",
      declaration.totalscanningFee || "-",
      declaration.totalwithholdingTax || "-",
      declaration.totalTaxPerDeclaration || "-",
      "", // Inland Freight 2
      declaration.totalBankService || "-",
      declaration.totalTransportFee || "-",
      declaration.totalWareHouseFee || "-",
      "", // Warehouse Fee VAT
      "", // Empty Container Loading Cost
      "", // Empty Container Loading Cost VAT
      declaration.totalTransitorFee || "-",
      "", // Transitor Fee VAT
      declaration.grandTotalInETB || "-",
      declaration.totalVatPerDeclaration || "-",
      declaration.totalWithholding || "-",
      "", // Unit Cost in ETB
      "", // Unit
      "", // Penalty Paid to Customs
      declaration.totalTaxPerDeclaration || "-",
    ],
  ];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Columns to style (1-based indexing)
  const highlightColumns = [4, 13, 22, 34, 35, 36, 37, 38];

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
