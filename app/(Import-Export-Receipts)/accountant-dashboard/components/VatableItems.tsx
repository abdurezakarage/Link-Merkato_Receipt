import React, { useRef } from "react";
import { ItemInfo, TaxAmountPerItem } from "./AccountantTaxViewer"; // Adjust the import path as needed

export interface VatItem {
  declarationNumber: string;
  companyName: string;
  itemDescription: string;
  hscode: string;
  quantity: number;
  unitPrice: number;
  vatAmount: number;
  totalTaxPerItem: string;
}

interface VatableItemsProps {
  items: ItemInfo[];
  declarationNumber: string;
  companyName: string;
}

export default function VatableItems({ items, declarationNumber, companyName }: VatableItemsProps) {
  const printRef = useRef<HTMLDivElement>(null);
  
  // Filter items with VAT > 0
  const vatItems = items.filter(item => {
    const vatAmount = item.taxAmountPerItem?.[0]?.vat;
    return vatAmount !== null && vatAmount !== undefined && vatAmount > 0;
  });

  const handlePrint = () => {
    if (!printRef.current) return;
    
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>VAT Items Report - ${companyName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .print-header { margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .print-header h2 { margin: 0; color: #333; }
            .print-header p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .vat-positive { color: green; font-weight: bold; }
            .no-print { display: none; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h2>${companyName}</h2>
            <p>Declaration Number: ${declarationNumber}</p>
            <p>VAT Items Report (VAT > 0)</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load before printing
  setTimeout(() => {
  printWindow.print();
  printWindow.addEventListener("afterprint", () => printWindow.close());
}, 250);
  };

  if (vatItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-semibold text-gray-800">Items with VAT > 0</h3>
        <button
          onClick={handlePrint}
          className="no-print bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
        >
          Print Report
        </button>
      </div>
      
      <div ref={printRef}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Description
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HS Code
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VAT Amount
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Tax
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vatItems.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {item.itemdescription}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {item.hscode || "-"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {item.unitprice?.toLocaleString()} ETB
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-green-600 font-medium">
                    {item.taxAmountPerItem?.[0]?.vat?.toLocaleString()} ETB
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {item.taxAmountPerItem?.[0]?.totalTaxPerItem || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}