"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, Printer, Search } from "lucide-react";
import { BASE_API_URL } from "../../import-api/ImportApi";
import { costBuildUPExcel } from "./costBuildUPExcel"; // Adjust the path as needed
import styles from "./Accountant.module.css";
import VatableItems from "./VatableItems";
import NonVatableItems from "./nonVatable";
import CostSheet from "./costSheeet";
import StockRecord from "./costSheeet";




export interface TaxAmountPerItem {
  dpvAmountPerDeclaration: number ;
  dutyTax: number ;
  exciseTax: number ;
  scanningFee: number ;
  scanningFeeVAT: number ;
  socialWelfareTax: number ;
  surtax: number ;
  totalTaxPerDeclaration: number ;
  vat: number;
  withholdingTax: number ;
  totalTaxPerItem: string;
  dpvAmountPerItem: string;
}
export interface companyInfo {
  companyname: string;
  firstname: string;
  lastname: string;
  tinnumber: string;
}
export interface ItemInfo {
  bankServicePerItem: number ;
  hscode: string;
  itemdescription: string;
  quantity: number;
  tinnumber: string;
  transitorPerItem: number ;
  transportFeePerItem: number ;
  warehousePerItem: number;
  unitprice: number;
  taxAmountPerItem: TaxAmountPerItem[];
  inlandFeright2PerItem: number ;
  loadingCostPerItem: number ;
  grandTotalInETBPerItem: number ;
  unitCostInETBPerItem: number ;
  externalfreight: number;
  djibouticost: number ;
  inlandFreight1: number ;
  insurancecost: number ;
  subtotal: number 

}

export interface TaxData {
  declarationNumber: string;
  exchangerate: number ,
  grandTotalInETB: number;
  iteminfo: ItemInfo[];
  companyInfo: companyInfo;
  totalBankService: number;
  totalTaxPerDeclaration: number;
  totalVatPerDeclaration: number;
  totalTransitorFee: number ;
  totalTransportFee: number;
  totalWareHouseFee: number ;
  totalWithholding: number ;
  totaldpvAmountPerDeclaration: number ;
  totaldutyTax: number ;
  totalexciseTax: number ;
  totalscanningFee: number ;
  totalscanningFeeVAT: number;
  totalsocialWelfareTax: number ;
  totalsurtax: number ;
  totalvat: number ;
  totalwithholdingTax: number ;
  totalFob: number ;
  totalExternalFreight:number;
  totalDjibouticost:number;
  totalInlandFreight1:number;
  totalInsurancecost:number;

}

export default function AllTaxViewer() {
  const [data, setData] = useState<TaxData[]>([]);
  const [filteredData, setFilteredData] = useState<Record<string, TaxData[]>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDeclarations, setExpandedDeclarations] = useState<
    Record<string, boolean>
  >({});
  const [expandedCompanies, setExpandedCompanies] = useState<
    Record<string, boolean>
  >({});
  const [lastExpandedDeclaration, setLastExpandedDeclaration] = useState<
    string | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        const res = await axios.get<TaxData[]>(
          `${BASE_API_URL}/api/v1/accountant/alltax/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setData(res.data);
        console.log(res.data);

        // Initialize filtered data with all data
        const grouped = groupDataByCompany(res.data);
        setFilteredData(grouped);

        // Initialize all declarations as collapsed
        const initialExpandedState = res.data.reduce((acc, item) => {
          acc[item.declarationNumber] = false;
          return acc;
        }, {} as Record<string, boolean>);
        setExpandedDeclarations(initialExpandedState);

        // Initialize all companies as collapsed
        const uniqueCompanies = Object.keys(grouped);
        const initialCompanyState = uniqueCompanies.reduce((acc, company) => {
          acc[company] = false;
          return acc;
        }, {} as Record<string, boolean>);
        setExpandedCompanies(initialCompanyState);
      } catch (err) {
        console.error(err);
        setError("Failed to load tax data ❌");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper function to group data by company
  const groupDataByCompany = (data: TaxData[]) => {
    return data.reduce((acc, declaration) => {
      const companyName =
        declaration.companyInfo?.companyname || "Unknown Company";
      if (!acc[companyName]) {
        acc[companyName] = [];
      }
      acc[companyName].push(declaration);
      return acc;
    }, {} as Record<string, TaxData[]>);
  };

  // Filter data based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(groupDataByCompany(data));
    } else {
      const filtered = data.filter((declaration) =>
        declaration.declarationNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredData(groupDataByCompany(filtered));
    }
  }, [searchTerm, data]);

  const toggleDeclaration = (declarationNumber: string) => {
    setExpandedDeclarations((prev) => {
      const newState = { ...prev };

      // If this declaration was the last expanded one, just collapse it
      if (lastExpandedDeclaration === declarationNumber) {
        newState[declarationNumber] = false;
        setLastExpandedDeclaration(null);
      } else {
        // Collapse all declarations first
        Object.keys(newState).forEach((key) => {
          newState[key] = false;
        });

        // Then expand the clicked one
        newState[declarationNumber] = true;
        setLastExpandedDeclaration(declarationNumber);
      }

      return newState;
    });
  };

  const toggleCompany = (companyName: string) => {
    setExpandedCompanies((prev) => ({
      ...prev,
      [companyName]: !prev[companyName],
    }));
  };

  const printDeclaration = (declarationNumber: string) => {
    const printWindow = window.open("", "_blank", "width=1400,height=900");
    const declaration = data.find(
      (d) => d.declarationNumber === declarationNumber
    );

    if (printWindow && declaration) {
      // Create the print content with all necessary data
      const printContent = `
      <html>
        <head>
          <title>Tax Declaration ${declarationNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 10px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .declaration-number { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            .company-info {
              margin-bottom: 10px;
            }
            .company-name { 
              font-size: 16px; 
              margin-bottom: 5px; 
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
            }
            .items-table th, .items-table td { 
              border: 1px solid #ddd; 
              padding: 4px; 
              text-align: left; 
              font-size: 9px; 
            }
            .items-table th { 
              background-color: #f5f5f5; 
              font-weight: bold;
            }
            .total-row { 
              font-weight: bold; 
              background-color: #e6f7ff; 
            }
            .section-title {
              font-weight: bold;
              margin: 15px 0 10px 0;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
            }
            @media print {
              body { 
                -webkit-print-color-adjust: exact; 
                margin: 0; 
                padding: 15px; 
              }
              .page-break { 
                page-break-after: always; 
              }
              .items-table {
                zoom: 85%;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="declaration-number">Declaration #${declarationNumber}</div>
            <div class="company-info">
              <div class="company-name">${declaration.companyInfo?.companyname || "Unknown Company"
        }</div>
              <div>TIN: ${declaration.companyInfo?.tinnumber || "N/A"}</div>
              <div>Contact: ${declaration.companyInfo?.firstname || ""} ${declaration.companyInfo?.lastname || ""
        }</div>
            </div>
            <div>Print Date: ${new Date().toLocaleDateString()}</div>
          </div>

          <div class="section-title">Items Details</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th>HS Code</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>DPV</th>
                <th>Duty Tax</th>
                <th>Excise Tax</th>
                <th>Surtax</th>
                <th>Social Welfare</th>
                <th>VAT</th>
                <th>Scanning Fee</th>
                <th>Withholding Tax</th>
                <th>Total Tax</th>
                <th>Inland Freight 2</th>
                <th>Bank Service</th>
                <th>Transport</th>
                <th>Warehouse</th>
                <th>Loading Cost</th>
                <th>Transitor Fee</th>
                <th>Grand Total (ETB)</th>
                <th>Unit Cost (ETB)</th>
              </tr>
            </thead>
            <tbody>
              ${declaration.iteminfo
          .map(
            (item, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${item.itemdescription}</td>
                  <td>${item.hscode || "-"}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unitprice?.toLocaleString() || "-"}</td>
                  <td>${item.taxAmountPerItem?.[0]?.dpvAmountPerItem || "-"
              }</td>
                  <td>${item.taxAmountPerItem?.[0]?.dutyTax?.toLocaleString() || "-"
              }</td>
                  <td>${item.taxAmountPerItem?.[0]?.exciseTax?.toLocaleString() ||
              "-"
              }</td>
                  <td>${item.taxAmountPerItem?.[0]?.surtax?.toLocaleString() || "-"
              }</td>
                  <td>${item.taxAmountPerItem?.[0]?.socialWelfareTax?.toLocaleString() ||
              "-"
              }</td>
                  <td>${item.taxAmountPerItem?.[0]?.vat?.toLocaleString() || "-"
              }</td>
                  <td>${item.taxAmountPerItem?.[0]?.scanningFee?.toLocaleString() ||
              "-"
              }</td>
                  <td>${item.taxAmountPerItem?.[0]?.withholdingTax?.toLocaleString() ||
              "-"
              }</td>
                  <td>${item.taxAmountPerItem?.[0]?.totalTaxPerItem || "-"}</td>
                  <td>${item.inlandFeright2PerItem?.toLocaleString() || "-"
              }</td>
                  <td>${item.bankServicePerItem?.toLocaleString() || "-"}</td>
                  <td>${item.transportFeePerItem?.toLocaleString() || "-"}</td>
                  <td>${item.warehousePerItem?.toLocaleString() || "-"}</td>
                  <td>${item.loadingCostPerItem?.toLocaleString() || "-"}</td>
                  <td>${item.transitorPerItem?.toLocaleString() || "-"}</td>
                  <td>${item.grandTotalInETBPerItem?.toLocaleString() || "-"
              }</td>
                  <td>${item.unitCostInETBPerItem?.toLocaleString() || "-"}</td>
                </tr>
              `
          )
          .join("")}
              
              <!-- TOTAL ROW -->
              <tr class="total-row">
                <td colspan="5">TOTAL:</td>
                <td>${declaration.totaldpvAmountPerDeclaration?.toLocaleString() ||
        "-"
        }</td>
                <td>${declaration.totaldutyTax?.toLocaleString() || "-"}</td>
                <td>${declaration.totalexciseTax?.toLocaleString() || "-"}</td>
                <td>${declaration.totalsurtax?.toLocaleString() || "-"}</td>
                <td>${declaration.totalsocialWelfareTax?.toLocaleString() || "-"
        }</td>
                <td>${declaration.totalvat?.toLocaleString() || "-"}</td>
                <td>${declaration.totalscanningFee?.toLocaleString() || "-"
        }</td>
                <td>${declaration.totalwithholdingTax?.toLocaleString() || "-"
        }</td>
                <td>${declaration.totalTaxPerDeclaration?.toLocaleString() || "-"
        }</td>
                <td></td>
                <td>${declaration.totalBankService?.toLocaleString() || "-"
        }</td>
                <td>${declaration.totalTransportFee?.toLocaleString() || "-"
        }</td>
                <td>${declaration.totalWareHouseFee?.toLocaleString() || "-"
        }</td>
                <td></td>
                <td>${declaration.totalTransitorFee?.toLocaleString() || "-"
        }</td>
                <td>${declaration.grandTotalInETB?.toLocaleString() || "-"}</td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <div class="section-title">Declaration Summary</div>
          <table class="items-table">
            <tr>
              <td>Total VAT per Declaration:</td>
              <td><strong>${declaration.totalVatPerDeclaration?.toLocaleString() || "-"
        } ETB</strong></td>
            </tr>
            <tr>
              <td>Total Withholding Tax:</td>
              <td><strong>${declaration.totalWithholding?.toLocaleString() || "-"
        } ETB</strong></td>
            </tr>
            <tr>
              <td>Grand Total in ETB:</td>
              <td><strong>${declaration.grandTotalInETB?.toLocaleString() || "-"
        } ETB</strong></td>
            </tr>
          </table>

          <script>
            setTimeout(() => {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }, 1000);
          </script>
        </body>
      </html>
    `;

      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  
  };
  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-lg mx-4 my-6">
        {error}
      </div>
    );

  if (!loading && !error && data.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No tax declarations found
      </div>
    );
  }



  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tax Information</h1>

      {/* Search Bar */}
      <div className="relative max-w-md mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search by declaration number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {Object.entries(filteredData).map(([companyName, declarations]) => (
        <div
          key={companyName}
          className="border rounded-lg shadow-sm bg-white overflow-hidden"
        >
          {/* Company Header */}
          <div
            className="flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 cursor-pointer border-b"
            onClick={() => toggleCompany(companyName)}
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white px-3 py-1 rounded-md">
                <span className="font-medium">{companyName}</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {declarations.length} declaration(s)
                </p>
              </div>
            </div>
            <div className="text-gray-500">
              {expandedCompanies[companyName] ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>
          </div>

          {expandedCompanies[companyName] && (
            <div className="space-y-4 p-4">
              {declarations.map((declaration) => (
                <div
                  key={declaration.declarationNumber}
                  className="border rounded-lg shadow-xs bg-gray-50 overflow-hidden"
                >
                  {/* Declaration Header */}
                  <div
                    className="flex justify-between items-center p-3 bg-white hover:bg-gray-50 cursor-pointer border-b"
                    onClick={() =>
                      toggleDeclaration(declaration.declarationNumber)
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-600 text-white px-2 py-1 rounded-md text-sm">
                        <span>#{declaration.declarationNumber}</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          {declaration.iteminfo.length} item(s){" "}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-gray-500">
                        {expandedDeclarations[declaration.declarationNumber] ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedDeclarations[declaration.declarationNumber] && (
                    <div className="p-3 space-y-4 bg-white">
                      {/* Financial Summary Section with horizontal scroll */}
                      <div className="border-b pb-3">
                     <h3 className="font-bold italic font-serif text-lg font-semibold mb-2 text-center text-blue-600">
  Import/Export cost build up
</h3>

                        <div className="overflow-x-auto"></div>
                      </div>

                      {/* print and excel */}

                      <div className="flex justify-end space-x-2">
                        {/* Print button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            printDeclaration(declaration.declarationNumber);
                          }}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                          title="Print this declaration"
                        >
                          <Printer size={16} />
                          <span className="text-xs hidden md:inline">
                            Print
                          </span>
                        </button>

                        {/* Excel download button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            costBuildUPExcel(declaration);
                          }}
                          className="flex items-center space-x-1 text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                          title="Download as Excel"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="text-xs hidden md:inline">
                            Excel
                          </span>
                        </button>
                      </div>

                      {/* Items Section */}
                      <div className="border-b pb-3">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-semibold text-gray-800">
                            Items Details
                          </h3>
                          <span className="text-xs text-gray-500">
                            {declaration.iteminfo.length} items
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr className={styles["table-column"]}>
                                <th className="px-3 py-2 bg-red text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Item No
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Description
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Unit
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Qty
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Unit Price
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  FOB Cost
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  exchangerate

                                </th>

                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Subtotal
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  External Freight
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Djibouti Cost
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Inland Freight 1
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Insurance Cost
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Total Freight Cost
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  DPV
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Duty Tax
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Excise
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Surtax
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Social Welfare
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  VAT
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Scanning Fee
                                </th>
                                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Scanning FeeVat
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Withholding Tax 3%
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Total Tax
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Inland Freight 2
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Bank Service Charge
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Transportation Cost
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Warehouse Fee
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Warehouse Fee VAT
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Empty Container Loading Cost
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Empty Container Loading Cost VAT
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Transitor Fee
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Transitor Fee VAT
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Grand in ETB
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Total VAT
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Total Withholding
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Unit Cost in ETB
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Unit
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Penalty Paid to Customs
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Total Taxes Paid to Customs
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {declaration.iteminfo.map((item, i) => (
                                <tr
                                  key={i}
                                  className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} ${styles.tableRow}`}
                                    
                                  
                                >
                                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                                    {i + 1}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {item.itemdescription}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Unit - not in interface, using placeholder */}
                                    -
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {item.quantity}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {item.unitprice} ETB
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* FOB Cost - not in interface */}

                                    {i === 0 ?declaration.totalFob:""}

                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* FOB Cost - not in interface */}
                                    {i === 0 ? declaration.exchangerate : ""}
                                    
                                  </td>

                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Subtotal - calculate from quantity * unitprice */}
                                    {(
                                      item.subtotal
                                    )}{" "}

                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* External Freight - not in interface */}
                                    {item.externalfreight}

                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Djibouti Clearance - not in interface */}
                                    {item.djibouticost}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Inland Freight 1 - not in interface */}
                                    {item.inlandFreight1}

                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Insurance Cost - not in interface */}
                                    {item.insurancecost}                                 

                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Total Freight Cost - not in interface */}
                                {((item.inlandFreight1 || 0)  +  (item.djibouticost || 0)  + (item.insurancecost || 0) +  (item.externalfreight || 0)).toLocaleString()}               
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* DPV - from taxAmountPerItem */}
                                      {item.taxAmountPerItem?.[0]?.dpvAmountPerItem ||
                                      "-"}{" "}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Custom Duty Tax - from taxAmountPerItem */}
                                    {item.taxAmountPerItem?.[0]?.dutyTax||
                                      "-"}{" "}
                                  
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Custom Excise - from taxAmountPerItem */}
                                    {item.taxAmountPerItem?.[0]?.exciseTax ||
                                      "-"}{" "}
                                  
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Surtax - from taxAmountPerItem */}
                                    {item.taxAmountPerItem?.[0]?.surtax||
                                      "-"}{" "}
                                    ETB
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Social Welfare - from taxAmountPerItem */}
                                    {item.taxAmountPerItem?.[0]?.socialWelfareTax ||
                                      "-"}
                                    ETB
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* VAT - from taxAmountPerItem */}
                                    {item.taxAmountPerItem?.[0]?.vat ||
                                      "-"}{" "}
                                    ETB
                                  </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Scanning Fee - from taxAmountPerItem */}
                                    {item.taxAmountPerItem?.[0]?.scanningFee ||
                                      "-"}
                                    ETB
                                  </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* scanningFeeVAT */}
                                    {item.taxAmountPerItem?.[0]?.scanningFeeVAT ||
                                      "-"}{" "}
                                    ETB
                                  </td>
                                
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Withholding Tax 3% - from taxAmountPerItem */}
                                    {item.taxAmountPerItem?.[0]?.withholdingTax ||
                                      "-"}
                                    ETB
                                  </td>
                                 <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 font-bold">
                                                  {(
                                                    (item.taxAmountPerItem?.[0]?.dutyTax || 0) +
                                                    (item.taxAmountPerItem?.[0]?.exciseTax || 0) +
                                                    (item.taxAmountPerItem?.[0]?.surtax || 0) +
                                                    (item.taxAmountPerItem?.[0]?.socialWelfareTax || 0) +
                                                    (item.taxAmountPerItem?.[0]?.vat || 0) +
                                                    (item.taxAmountPerItem?.[0]?.scanningFee || 0) +
                                                    (item.taxAmountPerItem?.[0]?.scanningFeeVAT || 0) +
                                                    (item.taxAmountPerItem?.[0]?.withholdingTax || 0) 
                                                  ).toLocaleString()}{" "}
                                                  ETB
                                                </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Inland Freight 2 - from interface */}
                                    {item.inlandFeright2PerItem ||
                                      "-"}{" "}
                                    ETB
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Bank Service Charge - from interface */}
                                    {item.bankServicePerItem ||
                                      "-"}{" "}
                                    ETB
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Transportation Cost - from interface */}
                                    {item.transportFeePerItem ||
                                      "-"}{" "}
                                    ETB
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Warehouse Fee - from interface */}
                                    {item.warehousePerItem ||
                                      "-"}{" "}
                                    ETB
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Warehouse Fee VAT - not in interface */}
                                    -
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Empty Container Loading Cost - from interface */}
                                    {item.loadingCostPerItem ||
                                      "-"}{" "}
                                    ETB
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Empty Container Loading Cost VAT - not in interface */}
                                    -
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Transitor Fee - from interface */}
                                    {item.transitorPerItem ||

                                      "-"}{" "}
                                    ETB
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Transitor Fee VAT - not in interface */}
                                      {item.transportFeePerItem ||

                                      "-"}{" "}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Grand Total in ETB - from interface */}
                                    {item.grandTotalInETBPerItem ||
                                      "-"}{" "}
                                    ETB
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Total VAT - from declaration level */}
                                    {declaration.totalvat ||
                                      "-"}{" "}
                                    ETB
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Total Withholding - from declaration level */}
                                    {declaration.totalWithholding ||
                                      "-"}{" "}
                                    ETB
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Unit Cost in ETB - from interface */}
                                    {item.unitCostInETBPerItem ||
                                      "-"}{" "}
                                    ETB
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Unit - not in interface */}-
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {/* Penalty Paid to Customs - not in interface */}
                                    -
                                  </td>
                                 <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 font-bold">
                                                  {(
                                                    (item.taxAmountPerItem?.[0]?.dutyTax || 0) +
                                                    (item.taxAmountPerItem?.[0]?.exciseTax || 0) +
                                                    (item.taxAmountPerItem?.[0]?.surtax || 0) +
                                                    (item.taxAmountPerItem?.[0]?.socialWelfareTax || 0) +
                                                    (item.taxAmountPerItem?.[0]?.vat || 0) +
                                                    (item.taxAmountPerItem?.[0]?.scanningFee || 0) +
                                                    (item.taxAmountPerItem?.[0]?.scanningFeeVAT || 0) +
                                                    (item.taxAmountPerItem?.[0]?.withholdingTax || 0) 
                                                  ).toLocaleString()}{" "}
                                                  ETB
                                                </td>
                                </tr>
                              ))}
                              {/* TOTAL ROW WITH BACKEND-CALCULATED VALUES */}
                            
                              <tr className="bg-blue-100 font-bold">
                                <td
                                  className="px-3 py-2 text-right text-xs uppercase"
                                >
                                  TOTAL:
                                </td>
                                <td></td>
                                <td></td>

                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {/* Quantity Total */}
                                    {declaration.iteminfo.reduce((sum, item) => sum + (item.quantity || 0), 0)
                                    }
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {/* Unit Price Total */}
                                    {declaration.iteminfo.reduce((sum, item) => sum + (item.unitprice || 0), 0)
                                    }
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {/* FOB Cost Total */}
                                    {/* {declaration.totalFob} */}

                                </td>
                                 
                                  <td></td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">


                                  {/* Subtotal Total */}
                                    {declaration.iteminfo.reduce((sum, item) => sum + (item.subtotal || 0), 0)
                                    }
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {/* External Freight Total */}
                                    {declaration.totalExternalFreight ||
                                      "-"}{" "}
                                    ETB
                                  
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {/* Djibouti Clearance Total */}
                                  {declaration.totalDjibouticost ||
                                    "-"}{" "}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {/* Inland Freight 1 Total */}
                                   {declaration.totalInlandFreight1 ||
                                    "-"}{" "}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {/* Insurance Cost Total */}
                                     {declaration.totalInsurancecost||
                                    "-"}{" "}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {/* Total Freight Cost Total */}
                                   {/* {( 
    (declaration.totalDjibouticost || 0) +
    (declaration.totalExternalFreight || 0) +

    (declaration.totalInlandFreight1 || 0) +
    (declaration.totalInsurancecost || 0)
  )} */}


                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {/* dpv */}
                                  {declaration.totaldpvAmountPerDeclaration ||
                                    "-"}
                                  ETB
                                </td>
                                <td>
                                  {/* Total totaldutyTax  Total */}
                                  {declaration.totaldutyTax ||
                                    "-"}
                                  ETB
                                  
                                </td>

                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                {/* totalexciseTax */}
                                      {declaration.totalexciseTax ||
                                    "-"}{" "}
                                  ETB
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                 {/* totalsurtax */}
                                  {declaration.totalsurtax ||
                                    "-"}{" "}
                                  ETB
                                </td>
                              
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {declaration.totalsocialWelfareTax ||
                                    "-"}{" "}
                                  ETB
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {declaration.totalvat ||
                                    "-"}{" "}
                                  ETB
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {declaration.totalscanningFee ||
                                    "-"}{" "}
                                  ETB
                                </td>
                                {/* totalscanningFeeVAT */}
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {declaration.totalscanningFeeVAT ||
                                    "-"}{" "}
                                  ETB
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                 {/* totalWithholding */}
                                  {declaration.totalWithholding||
                                    "-"}{" "}
                                  ETB
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {/* total tax */}
                                  {declaration.totalTaxPerDeclaration}
    
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {/* Inland Freight 2 Total */}
                                    {declaration.iteminfo.reduce((sum, item) => sum + (item.inlandFeright2PerItem || 0), 0)
                                    }
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {declaration.totalBankService ||
                                    "-"}{" "}
                                  ETB
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {declaration.totalTransportFee ||
                                    "-"}{" "}
                                  ETB
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {declaration.totalWareHouseFee ||
                                    "-"}{" "}
                                  ETB
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {/* Warehouse Fee VAT Total */}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {/* Empty Container Loading Cost Total */}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {/* Empty Container Loading Cost VAT Total */}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {declaration.totalTransitorFee ||
                                    "-"}{" "}
                                  ETB
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {/* Transitor Fee VAT Total */}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {declaration.grandTotalInETB ||
                                    "-"}{" "}
                                  ETB
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {declaration.totalVatPerDeclaration ||
                                    "-"}{" "}
                                  ETB
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {declaration.totalwithholdingTax ||
                                    "-"}{" "}
                                  ETB
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {/* Unit Cost in ETB Total */}
                                   {declaration.iteminfo.reduce((sum, item) => sum + (item.unitCostInETBPerItem || 0), 0)
                                    }
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {/* Unit Total */}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {/* Penalty Paid to Customs Total */}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {/* Total Taxes Paid to Customs Total - this is totalTaxPerDeclaration */}
                                  {declaration.totalTaxPerDeclaration ||
                                    "-"}{" "}
                                  ETB
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Add the components here */}
                           <CostSheet
  items={declaration.iteminfo || []}
  declarationNumber={declaration.declarationNumber}
  companyName={
    declaration.companyInfo?.companyname ||
    "Unknown Company"
  }
/>
                      
            <VatableItems
            items={declaration.iteminfo}
            declarationNumber={declaration.declarationNumber}
            companyName={
              declaration.companyInfo?.companyname ||
              "Unknown Company"
            }
            totalvat={declaration.totalvat}
            companyTin={declaration.companyInfo?.tinnumber || ""}
        // You need to add this to your interface
          />
             <NonVatableItems
            items={declaration.iteminfo}
            declarationNumber={declaration.declarationNumber}
            companyName={
              declaration.companyInfo?.companyname ||
              "Unknown Company"
            }
            companyTin={declaration.companyInfo?.tinnumber || ""}
            // You need to add this to your interface
          />
             <StockRecord
  items={declaration.iteminfo}
  declarationNumber={String(declaration.declarationNumber)}
  companyName={declaration.companyInfo?.companyname || "Unknown Company"} 
  
/>

  

                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Show message when no results found */}
      {searchTerm && Object.keys(filteredData).length === 0 && (
        <div className="p-6 text-center text-gray-500">
          No declarations found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}
