"use client";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import { TaxData } from "./AccountantTaxViewer"; // Adjust the import path as needed

// Register fonts (optional but recommended)
Font.register({
  family: "Helvetica",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: 300,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
      fontWeight: 500,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 10,
    fontSize: 7, // Kept small to fit many columns
    fontFamily: "Helvetica",
  },
  header: {
    textAlign: "center",
    marginBottom: 10,
    borderBottom: "1pt solid #000",
    paddingBottom: 10,
  },
  declarationNumber: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 5,
  },
  companyName: {
    fontSize: 12,
    fontWeight: 500,
    marginBottom: 3,
  },
  date: {
    fontSize: 9,
  },
  table: {
    // display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
    minHeight: 20,
  },
  tableColHeader: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 3,
    flexShrink: 0, // Prevent shrinking
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 3,
    flexShrink: 0, // Prevent shrinking
  },
  tableCellHeader: {
    margin: "auto",
    fontSize: 6, // Adjusted for readability within tight columns
    fontWeight: 700,
    textAlign: "center",
  },
  tableCell: {
    margin: "auto",
    fontSize: 6, // Adjusted for readability within tight columns
    textAlign: "center",
  },
  totalRow: {
    backgroundColor: "#e6f7ff",
    fontWeight: 700,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 5,
    marginTop: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "grey",
  },
});

// PDF Document component
const TaxDeclarationPDF = ({ declaration }: { declaration: TaxData }) => {
  // Optimized column widths to sum up to 100% for a single page fit
  const columnWidths = [
    "1.8%", // Item No
    "6.5%", // Description (adjusted slightly to make total 100%)
    "1.2%", // Unit
    "1.8%", // Qty
    "3.0%", // Unit Price
    "2.4%", // FOB Cost
    "3.0%", // Subtotal
    "2.4%", // External Freight
    "2.4%", // Djibouti Clearance
    "2.4%", // Inland Freight 1
    "2.4%", // Insurance Cost
    "3.0%", // Total Freight Cost
    "2.4%", // DPV
    "3.0%", // Custom Duty Tax
    "3.0%", // Custom Excise
    "2.4%", // Surtax
    "3.0%", // Social Welfare
    "2.4%", // VAT
    "2.4%", // Scanning Fee
    "3.0%", // Withholding Tax 3%
    "3.0%", // Total Tax
    "3.0%", // Inland Freight 2
    "3.0%", // Bank Service Charge
    "3.0%", // Transportation Cost
    "2.4%", // Warehouse Fee
    "2.4%", // Warehouse Fee VAT
    "3.6%", // Empty Container Loading Cost
    "3.6%", // Empty Container Loading Cost VAT
    "3.0%", // Transitor Fee
    "3.0%", // Transitor Fee VAT
    "3.6%", // Grand in ETB
    "3.0%", // Total VAT
    "3.0%", // Total Withholding
    "3.6%", // Unit Cost in ETB
    "1.2%", // Unit
    "3.6%", // Penalty Paid to Customs
    "3.6%", // Total Taxes Paid to Customs
  ];

  const headers = [
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
  ];

  // Helper function to format values
  const formatValue = (value: any, isCurrency: boolean = false) => {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "number") {
      return isCurrency
        ? `${value.toLocaleString()} ETB`
        : value.toLocaleString();
    }
    return value;
  };

  return (
    <Document>
      <Page size="A3" orientation="landscape" style={styles.page} wrap>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.declarationNumber}>
            Declaration #{declaration.declarationNumber}
          </Text>
          <Text style={styles.companyName}>
            {declaration.companyInfo?.companyname || "Unknown Company"}
          </Text>
          <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
        </View>

        {/* Items Section Title */}
        <Text style={styles.sectionTitle}>Items Details</Text>

        {/* Table Header */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            {headers.map((header, idx) => (
              <View
                key={idx}
                style={[styles.tableColHeader, { width: columnWidths[idx] }]}
              >
                <Text style={styles.tableCellHeader}>{header}</Text>
              </View>
            ))}
          </View>

          {/* Data Rows */}
          {declaration.iteminfo.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              {/* Item No */}
              <View style={[styles.tableCol, { width: columnWidths[0] }]}>
                <Text style={styles.tableCell}>{i + 1}</Text>
              </View>

              {/* Description */}
              <View style={[styles.tableCol, { width: columnWidths[1] }]}>
                <Text style={styles.tableCell}>{item.itemdescription}</Text>
              </View>

              {/* Unit */}
              <View style={[styles.tableCol, { width: columnWidths[2] }]}>
                <Text style={styles.tableCell}>-</Text>
              </View>

              {/* Qty */}
              <View style={[styles.tableCol, { width: columnWidths[3] }]}>
                <Text style={styles.tableCell}>{item.quantity}</Text>
              </View>

              {/* Unit Price */}
              <View style={[styles.tableCol, { width: columnWidths[4] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(item.unitprice, true)}
                </Text>
              </View>

              {/* FOB Cost */}
              <View style={[styles.tableCol, { width: columnWidths[5] }]}>
                <Text style={styles.tableCell}>-</Text>
              </View>

              {/* Subtotal */}
              <View style={[styles.tableCol, { width: columnWidths[6] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(item.quantity * item.unitprice, true)}
                </Text>
              </View>

              {/* External Freight */}
              <View style={[styles.tableCol, { width: columnWidths[7] }]}>
                <Text style={styles.tableCell}>-</Text>
              </View>

              {/* Djibouti Clearance */}
              <View style={[styles.tableCol, { width: columnWidths[8] }]}>
                <Text style={styles.tableCell}>-</Text>
              </View>

              {/* Inland Freight 1 */}
              <View style={[styles.tableCol, { width: columnWidths[9] }]}>
                <Text style={styles.tableCell}>-</Text>
              </View>

              {/* Insurance Cost */}
              <View style={[styles.tableCol, { width: columnWidths[10] }]}>
                <Text style={styles.tableCell}>-</Text>
              </View>

              {/* Total Freight Cost */}
              <View style={[styles.tableCol, { width: columnWidths[11] }]}>
                <Text style={styles.tableCell}>-</Text>
              </View>

              {/* DPV */}
              <View style={[styles.tableCol, { width: columnWidths[12] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(item.taxAmountPerItem?.[0]?.dpvAmountPerItem)}
                </Text>
              </View>

              {/* Custom Duty Tax */}
              <View style={[styles.tableCol, { width: columnWidths[13] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(item.taxAmountPerItem?.[0]?.dutyTax, true)}
                </Text>
              </View>

              {/* Custom Excise */}
              <View style={[styles.tableCol, { width: columnWidths[14] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(item.taxAmountPerItem?.[0]?.exciseTax, true)}
                </Text>
              </View>

              {/* Surtax */}
              <View style={[styles.tableCol, { width: columnWidths[15] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(item.taxAmountPerItem?.[0]?.surtax, true)}
                </Text>
              </View>

              {/* Social Welfare */}
              <View style={[styles.tableCol, { width: columnWidths[16] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(
                    item.taxAmountPerItem?.[0]?.socialWelfareTax,
                    true
                  )}
                </Text>
              </View>

              {/* VAT */}
              <View style={[styles.tableCol, { width: columnWidths[17] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(item.taxAmountPerItem?.[0]?.vat, true)}
                </Text>
              </View>

              {/* Scanning Fee */}
              <View style={[styles.tableCol, { width: columnWidths[18] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(item.taxAmountPerItem?.[0]?.scanningFee, true)}
                </Text>
              </View>

              {/* Withholding Tax 3% */}
              <View style={[styles.tableCol, { width: columnWidths[19] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(
                    item.taxAmountPerItem?.[0]?.withholdingTax,
                    true
                  )}
                </Text>
              </View>

              {/* Total Tax */}
              <View style={[styles.tableCol, { width: columnWidths[20] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(
                    item.taxAmountPerItem?.[0]?.totalTaxPerItem,
                    true
                  )}
                </Text>
              </View>

              {/* Inland Freight 2 */}
              <View style={[styles.tableCol, { width: columnWidths[21] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(item.inlandFeright2PerItem, true)}
                </Text>
              </View>

              {/* Bank Service Charge */}
              <View style={[styles.tableCol, { width: columnWidths[22] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(item.bankServicePerItem, true)}
                </Text>
              </View>

              {/* Transportation Cost */}
              <View style={[styles.tableCol, { width: columnWidths[23] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(item.transportFeePerItem, true)}
                </Text>
              </View>

              {/* Warehouse Fee */}
              <View style={[styles.tableCol, { width: columnWidths[24] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(item.warehousePerItem, true)}
                </Text>
              </View>

              {/* Warehouse Fee VAT */}
              <View style={[styles.tableCol, { width: columnWidths[25] }]}>
                <Text style={styles.tableCell}>-</Text>
              </View>

              {/* Empty Container Loading Cost */}
              <View style={[styles.tableCol, { width: columnWidths[26] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(item.loadingCostPerItem, true)}
                </Text>
              </View>

              {/* Empty Container Loading Cost VAT */}
              <View style={[styles.tableCol, { width: columnWidths[27] }]}>
                <Text style={styles.tableCell}>-</Text>
              </View>

              {/* Transitor Fee */}
              <View style={[styles.tableCol, { width: columnWidths[28] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(item.transitorPerItem, true)}
                </Text>
              </View>

              {/* Transitor Fee VAT */}
              <View style={[styles.tableCol, { width: columnWidths[29] }]}>
                <Text style={styles.tableCell}>-</Text>
              </View>

              {/* Grand in ETB */}
              <View style={[styles.tableCol, { width: columnWidths[30] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(item.grandTotalInETBPerItem, true)}
                </Text>
              </View>

              {/* Total VAT */}
              <View style={[styles.tableCol, { width: columnWidths[31] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(declaration.totalVatPerDeclaration, true)}
                </Text>
              </View>

              {/* Total Withholding */}
              <View style={[styles.tableCol, { width: columnWidths[32] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(declaration.totalWithholding, true)}
                </Text>
              </View>

              {/* Unit Cost in ETB */}
              <View style={[styles.tableCol, { width: columnWidths[33] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(item.unitCostInETBPerItem, true)}
                </Text>
              </View>

              {/* Unit */}
              <View style={[styles.tableCol, { width: columnWidths[34] }]}>
                <Text style={styles.tableCell}>-</Text>
              </View>

              {/* Penalty Paid to Customs */}
              <View style={[styles.tableCol, { width: columnWidths[35] }]}>
                <Text style={styles.tableCell}>-</Text>
              </View>

              {/* Total Taxes Paid to Customs */}
              <View style={[styles.tableCol, { width: columnWidths[36] }]}>
                <Text style={styles.tableCell}>
                  {formatValue(
                    item.taxAmountPerItem?.[0]?.totalTaxPerDeclaration,
                    true
                  )}
                </Text>
              </View>
            </View>
          ))}

          {/* Total Row */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <View style={[styles.tableCol, { width: columnWidths[0] }]}>
              <Text style={styles.tableCell}>TOTAL:</Text>
            </View>

            {/* Empty cells for most columns, only filling the ones with data */}
            {Array(11)
              .fill(0)
              .map((_, i) => (
                <View
                  key={i}
                  style={[styles.tableCol, { width: columnWidths[i + 1] }]}
                >
                  <Text style={styles.tableCell}></Text>
                </View>
              ))}

            {/* DPV Total */}
            <View style={[styles.tableCol, { width: columnWidths[12] }]}>
              <Text style={styles.tableCell}>
                {formatValue(declaration.totaldpvAmountPerDeclaration)}
              </Text>
            </View>

            {/* Custom Duty Tax Total */}
            <View style={[styles.tableCol, { width: columnWidths[13] }]}>
              <Text style={styles.tableCell}>
                {formatValue(declaration.totaldutyTax, true)}
              </Text>
            </View>

            {/* Custom Excise Total */}
            <View style={[styles.tableCol, { width: columnWidths[14] }]}>
              <Text style={styles.tableCell}>
                {formatValue(declaration.totalexciseTax, true)}
              </Text>
            </View>

            {/* Surtax Total */}
            <View style={[styles.tableCol, { width: columnWidths[15] }]}>
              <Text style={styles.tableCell}>
                {formatValue(declaration.totalsurtax, true)}
              </Text>
            </View>

            {/* Social Welfare Total */}
            <View style={[styles.tableCol, { width: columnWidths[16] }]}>
              <Text style={styles.tableCell}>
                {formatValue(declaration.totalsocialWelfareTax, true)}
              </Text>
            </View>

            {/* VAT Total */}
            <View style={[styles.tableCol, { width: columnWidths[17] }]}>
              <Text style={styles.tableCell}>
                {formatValue(declaration.totalvat, true)}
              </Text>
            </View>

            {/* Scanning Fee Total */}
            <View style={[styles.tableCol, { width: columnWidths[18] }]}>
              <Text style={styles.tableCell}>
                {formatValue(declaration.totalscanningFee, true)}
              </Text>
            </View>

            {/* Withholding Tax 3% Total */}
            <View style={[styles.tableCol, { width: columnWidths[19] }]}>
              <Text style={styles.tableCell}>
                {formatValue(declaration.totalwithholdingTax, true)}
              </Text>
            </View>

            {/* Total Tax */}
            <View style={[styles.tableCol, { width: columnWidths[20] }]}>
              <Text style={styles.tableCell}>
                {formatValue(declaration.totalTaxPerDeclaration, true)}
              </Text>
            </View>

            {/* Empty cell for Inland Freight 2 */}
            <View style={[styles.tableCol, { width: columnWidths[21] }]}>
              <Text style={styles.tableCell}></Text>
            </View>

            {/* Bank Service Charge Total */}
            <View style={[styles.tableCol, { width: columnWidths[22] }]}>
              <Text style={styles.tableCell}>
                {formatValue(declaration.totalBankService, true)}
              </Text>
            </View>

            {/* Transportation Cost Total */}
            <View style={[styles.tableCol, { width: columnWidths[23] }]}>
              <Text style={styles.tableCell}>
                {formatValue(declaration.totalTransportFee, true)}
              </Text>
            </View>

            {/* Warehouse Fee Total */}
            <View style={[styles.tableCol, { width: columnWidths[24] }]}>
              <Text style={styles.tableCell}>
                {formatValue(declaration.totalWareHouseFee, true)}
              </Text>
            </View>

            {/* Empty cells for several columns */}
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <View
                  key={i}
                  style={[styles.tableCol, { width: columnWidths[i + 25] }]}
                >
                  <Text style={styles.tableCell}></Text>
                </View>
              ))}

            {/* Transitor Fee Total */}
            <View style={[styles.tableCol, { width: columnWidths[28] }]}>
              <Text style={styles.tableCell}>
                {formatValue(declaration.totalTransitorFee, true)}
              </Text>
            </View>

            {/* Empty cell for Transitor Fee VAT */}
            <View style={[styles.tableCol, { width: columnWidths[29] }]}>
              <Text style={styles.tableCell}></Text>
            </View>

            {/* Grand Total in ETB */}
            <View style={[styles.tableCol, { width: columnWidths[30] }]}>
              <Text style={styles.tableCell}>
                {formatValue(declaration.grandTotalInETB, true)}
              </Text>
            </View>

            {/* Total VAT */}
            <View style={[styles.tableCol, { width: columnWidths[31] }]}>
              <Text style={styles.tableCell}>
                {formatValue(declaration.totalVatPerDeclaration, true)}
              </Text>
            </View>

            {/* Total Withholding */}
            <View style={[styles.tableCol, { width: columnWidths[32] }]}>
              <Text style={styles.tableCell}>
                {formatValue(declaration.totalWithholding, true)}
              </Text>
            </View>

            {/* Empty cells for remaining columns */}
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <View
                  key={i}
                  style={[styles.tableCol, { width: columnWidths[i + 33] }]}
                >
                  <Text style={styles.tableCell}></Text>
                </View>
              ))}
          </View>
        </View>

        {/* Footer */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Generated on ${new Date().toLocaleDateString()} | Page ${pageNumber} of ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
};

// Function to generate and download PDF
export const downloadTaxDeclarationPDF = async (declaration: TaxData) => {
  const blob = await pdf(
    <TaxDeclarationPDF declaration={declaration} />
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `tax-declaration-${declaration.declarationNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default TaxDeclarationPDF;
