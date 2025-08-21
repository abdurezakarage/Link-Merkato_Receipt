"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, Printer, Search } from "lucide-react";
import { BASE_API_URL } from "../../import-api/ImportApi";

interface TaxAmountPerItem {
  dpvAmountPerDeclaration: number | null;
  dutyTax: number | null;
  exciseTax: number | null;
  scanningFee: number | null;
  scanningFeeVAT: number | null;
  socialWelfareTax: number | null;
  surtax: number | null;
  totalTaxPerDeclaration: number | null;
  vat: number | null;
  withholdingTax: number | null;
}
interface companyInfo {
  companyname: string;
  firstname: string;
  lastname: string;
  tinnumber: string;
}
interface ItemInfo {
  bankServicePerItem: number | null;

  hscode: string;
  itemdescription: string;
  quantity: number;
  tinnumber: string;
  transitorPerItem: number | null;
  transportFeePerItem: number | null;
  warehousePerItem: number | null;
  unitprice: number;
  taxAmountPerItem: TaxAmountPerItem[];
}

interface TaxData {
  declarationNumber: string;
  grandTotalInETB: number;
  iteminfo: ItemInfo[];
  companyInfo: companyInfo;
  totalBankService: number;
  totalTaxPerDeclaration: number;
  totalVatPerDeclaration: number;
  totalTransitorFee: number | null;
  totalTransportFee: number | null;
  totalWareHouseFee: number | null;
  totalWithholding: number | null;
  totaldpvAmountPerDeclaration: number | null;
  totaldutyTax: number | null;
  totalexciseTax: number | null;
  totalscanningFee: number | null;
  totalscanningFeeVAT: number | null;
  totalsocialWelfareTax: number | null;
  totalsurtax: number | null;
  totalvat: number | null;
  totalwithholdingTax: number | null;
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
    const printWindow = window.open("", "", "width=900,height=650");
    const declaration = data.find(
      (d) => d.declarationNumber === declarationNumber
    );

    if (printWindow && declaration) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Tax Declaration ${declarationNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .declaration-number { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
              .company-name { font-size: 16px; margin-bottom: 5px; }
              .summary-section { margin-bottom: 20px; }
              .section-title { font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin: 15px 0 10px 0; }
              .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
              .summary-card { border: 1px solid #ddd; padding: 12px; border-radius: 5px; }
              .card-title { font-weight: bold; margin-bottom: 8px; color: #333; }
              .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .items-table th { background-color: #f5f5f5; }
              .tax-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
              .tax-item { border: 1px solid #eee; padding: 8px; border-radius: 4px; font-size: 14px; }
              .tax-label { font-weight: 600; color: #555; }
              .total-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
              .total-item { border: 1px solid #ddd; padding: 10px; border-radius: 4px; }
              .total-label { font-weight: bold; margin-bottom: 5px; }
              .total-value { font-size: 15px; }
              .total-row { font-weight: bold; background-color: #f9f9f9; }
              @media print {
                body { -webkit-print-color-adjust: exact; }
                .page-break { page-break-after: always; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="declaration-number">Declaration #${declarationNumber}</div>
              <div class="company-name">${
                declaration.companyInfo?.companyname || "Unknown Company"
              }</div>
              <div>${new Date().toLocaleDateString()}</div>
            </div>

            <div class="summary-section">
              <div class="section-title">Financial Summary</div>
              
              <div class="total-grid">
                <div class="total-item">
                  <div class="total-label">Grand Total</div>
                  <div class="total-value">${declaration.grandTotalInETB?.toLocaleString()} ETB</div>
                </div>
                
                <div class="total-item">
                  <div class="total-label">Total Tax</div>
                  <div class="total-value">${declaration.totalTaxPerDeclaration?.toLocaleString()} ETB</div>
                </div>
                
                <div class="total-item">
                  <div class="total-label">Total VAT</div>
                  <div class="total-value">${declaration.totalVatPerDeclaration?.toLocaleString()} ETB</div>
                </div>
                
                <div class="total-item">
                  <div class="total-label">Bank Service Charge</div>
                  <div class="total-value">${declaration.totalBankService?.toLocaleString()} ETB</div>
                </div>
                
                <div class="total-item">
                  <div class="total-label">Transitor Fee</div>
                  <div class="total-value">${declaration.totalTransitorFee?.toLocaleString()} ETB</div>
                </div>
                
                <div class="total-item">
                  <div class="total-label">Transport Fee</div>
                  <div class="total-value">${declaration.totalTransportFee?.toLocaleString()} ETB</div>
                </div>
                
                <div class="total-item">
                  <div class="total-label">WareHouse Fee</div>
                  <div class="total-value">${declaration.totalWareHouseFee?.toLocaleString()} ETB</div>
                </div>
                
                <div class="total-item">
                  <div class="total-label">Total Withholding</div>
                  <div class="total-value">${declaration.totalWithholding?.toLocaleString()} ETB</div>
                </div>
                
                <div class="total-item">
                  <div class="total-label">DPV Amount</div>
                  <div class="total-value">${declaration.totaldpvAmountPerDeclaration?.toLocaleString()} ETB</div>
                </div>
                
                <div class="total-item">
                  <div class="total-label">Duty Tax</div>
                  <div class="total-value">${declaration.totaldutyTax?.toLocaleString()} ETB</div>
                </div>
                
                <div class="total-item">
                  <div class="total-label">Excise Tax</div>
                  <div class="total-value">${declaration.totalexciseTax?.toLocaleString()} ETB</div>
                </div>
                
                <div class="total-item">
                  <div class="total-label">Scanning Fee</div>
                  <div class="total-value">${declaration.totalscanningFee?.toLocaleString()} ETB</div>
                </div>
                
                <div class="total-item">
                  <div class="total-label">Scanning Fee VAT</div>
                  <div class="total-value">${declaration.totalscanningFeeVAT?.toLocaleString()} ETB</div>
                </div>
                
                <div class="total-item">
                  <div class="total-label">Social Welfare Tax</div>
                  <div class="total-value">${declaration.totalsocialWelfareTax?.toLocaleString()} ETB</div>
                </div>
                
                <div class="total-item">
                  <div class="total-label">Surtax</div>
                  <div class="total-value">${declaration.totalsurtax?.toLocaleString()} ETB</div>
                </div>
                
                <div class="total-item">
                  <div class="total-label">VAT</div>
                  <div class="total-value">${declaration.totalvat?.toLocaleString()} ETB</div>
                </div>
                
                <div class="total-item">
                  <div class="total-label">Withholding Tax</div>
                  <div class="total-value">${declaration.totalwithholdingTax?.toLocaleString()} ETB</div>
                </div>
              </div>
            </div>

            <div class="section-title">Items Details</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>HS Code</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>TIN</th>
                </tr>
              </thead>
              <tbody>
                ${declaration.iteminfo
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.itemdescription}</td>
                    <td>${item.hscode}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unitprice?.toLocaleString()} ETB</td>
                    <td>${item.tinnumber}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <div class="section-title">Tax Details</div>
            <div class="tax-grid">
              ${declaration.iteminfo
                .flatMap((item) =>
                  item.taxAmountPerItem
                    ?.map((tax, index) =>
                      Object.entries(tax)
                        .map(([key, value]) =>
                          value !== null
                            ? `
                      <div class="tax-item">
                        <div class="tax-label">${key
                          .replace(/([A-Z])/g, " $1")
                          .trim()}</div>
                        <div>${
                          typeof value === "number"
                            ? value.toLocaleString()
                            : value || "N/A"
                        } ETB</div>
                      </div>
                    `
                            : ""
                        )
                        .join("")
                    )
                    .join("")
                )
                .join("")}
            </div>

            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 200);
            </script>
          </body>
        </html>
      `);
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          printDeclaration(declaration.declarationNumber);
                        }}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        title="Print this declaration"
                      >
                        <Printer size={16} />
                        <span className="text-xs hidden md:inline">Print</span>
                      </button>
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
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">
                          Financial Summary for{" "}
                          {declaration.companyInfo.tinnumber} tin Number
                        </h3>
                        <div className="overflow-x-auto">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 min-w-[800px]">
                            {/* Summary Card */}
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 min-w-[250px]">
                              <h3 className="font-medium text-blue-800 text-sm mb-2">
                                Totals
                              </h3>
                              <div className="space-y-1">
                                <div className="flex justify-between py-1 border-b border-blue-100">
                                  <span className="text-gray-600 text-xs">
                                    Grand Total:
                                  </span>
                                  <span className="font-medium text-xs">
                                    {declaration.grandTotalInETB?.toLocaleString()}{" "}
                                    ETB
                                  </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-blue-100">
                                  <span className="text-gray-600 text-xs">
                                    Total custom Tax:
                                  </span>
                                  <span className="font-medium text-xs">
                                    {declaration.totalTaxPerDeclaration?.toLocaleString()}{" "}
                                    ETB
                                  </span>
                                </div>
                                <div className="flex justify-between py-1">
                                  <span className="text-gray-600 text-xs">
                                    Total duty Tax:
                                  </span>
                                  <span className="font-medium text-xs">
                                    {declaration.totaldutyTax?.toLocaleString()}{" "}
                                    ETB
                                  </span>
                                </div>

                                <div className="flex justify-between py-1">
                                  <span className="text-gray-600 text-xs">
                                    Total exciseTax:
                                  </span>
                                  <span className="font-medium text-xs">
                                    {declaration.totalexciseTax?.toLocaleString()}{" "}
                                    ETB
                                  </span>
                                </div>
                                <div className="flex justify-between py-1">
                                  <span className="text-gray-600 text-xs">
                                    Total surtax:
                                  </span>
                                  <span className="font-medium text-xs">
                                    {declaration.totalsurtax?.toLocaleString()}{" "}
                                    ETB
                                  </span>
                                </div>
                                <div className="flex justify-between py-1">
                                  <span className="text-gray-600 text-xs">
                                    Total socialWelfareTax:
                                  </span>
                                  <span className="font-medium text-xs">
                                    {declaration.totalsocialWelfareTax?.toLocaleString()}{" "}
                                    ETB
                                  </span>
                                </div>
                                <div className="flex justify-between py-1">
                                  <span className="text-gray-600 text-xs">
                                    Total vat:
                                  </span>
                                  <span className="font-medium text-xs">
                                    {declaration.totalvat?.toLocaleString()} ETB
                                  </span>
                                </div>
                                <div className="flex justify-between py-1">
                                  <span className="text-gray-600 text-xs">
                                    Total withholdingTax:
                                  </span>
                                  <span className="font-medium text-xs">
                                    {declaration.totalwithholdingTax?.toLocaleString()}{" "}
                                    ETB
                                  </span>
                                </div>
                                <div className="flex justify-between py-1">
                                  <span className="text-gray-600 text-xs">
                                    Total scanningFee:
                                  </span>
                                  <span className="font-medium text-xs">
                                    {declaration.totalscanningFee?.toLocaleString()}{" "}
                                    ETB
                                  </span>
                                </div>
                                <div className="flex justify-between py-1">
                                  <span className="text-gray-600 text-xs">
                                    Total scanningFeeVAT:
                                  </span>
                                  <span className="font-medium text-xs">
                                    {declaration.totalscanningFeeVAT?.toLocaleString()}{" "}
                                    ETB
                                  </span>
                                </div>
                                <div className="flex justify-between py-1">
                                  <span className="text-gray-600 text-xs">
                                    Total dpv Amount Per Declaration :
                                  </span>
                                  <span className="font-medium text-xs">
                                    {declaration.totaldpvAmountPerDeclaration?.toLocaleString()}{" "}
                                    ETB
                                  </span>
                                </div>
                                <div className="flex justify-between py-1">
                                  <span className="text-gray-600 text-xs">
                                    Total Withholding:
                                  </span>
                                  <span className="font-medium text-xs">
                                    {declaration.totalWithholding?.toLocaleString()}{" "}
                                    ETB
                                  </span>
                                </div>

                                <div className="flex justify-between py-1">
                                  <span className="text-gray-600 text-xs">
                                    Total WareHouseFee:
                                  </span>
                                  <span className="font-medium text-xs">
                                    {declaration.totalWareHouseFee?.toLocaleString()}{" "}
                                    ETB
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Fees Card */}
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 min-w-[250px]">
                              <h3 className="font-medium text-purple-800 text-sm mb-2">
                                Fees & Charges
                              </h3>
                              <div className="space-y-1">
                                <div className="flex justify-between py-1 border-b border-purple-100">
                                  <span className="text-gray-600 text-xs">
                                    Bank Service:
                                  </span>
                                  <span className="font-medium text-xs">
                                    {declaration.totalBankService?.toLocaleString()}{" "}
                                    ETB
                                  </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-purple-100">
                                  <span className="text-gray-600 text-xs">
                                    Transit Fee:
                                  </span>
                                  <span className="font-medium text-xs">
                                    {declaration.totalTransitorFee?.toLocaleString()}{" "}
                                    ETB
                                  </span>
                                </div>
                                <div className="flex justify-between py-1">
                                  <span className="text-gray-600 text-xs">
                                    Warehouse Fee:
                                  </span>
                                  <span className="font-medium text-xs">
                                    {declaration.totalWareHouseFee?.toLocaleString()}{" "}
                                    ETB
                                  </span>
                                </div>

                                <div className="flex justify-between py-1 border-b border-purple-100">
                                  <span className="text-gray-600 text-xs">
                                    transport Fee Per Item :
                                  </span>
                                  <span className="font-medium text-xs">
                                    {declaration.totalTransportFee?.toLocaleString()}{" "}
                                    ETB
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
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
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Item
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  HS Code
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Quantity
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Unit Price
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  TIN
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {declaration.iteminfo.map((item, i) => (
                                <tr
                                  key={i}
                                  className={
                                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                                  }
                                >
                                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                                    {item.itemdescription}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {item.hscode}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {item.quantity}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {item.unitprice?.toLocaleString()} ETB
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {item.tinnumber}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Tax Details Section with horizontal scroll */}
                      {declaration.iteminfo.some(
                        (item) => item.taxAmountPerItem?.length > 0
                      ) && (
                        <div className="pt-3">
                          <h3 className="text-sm font-semibold text-gray-800 mb-2">
                            Tax Details
                          </h3>
                          <div className="overflow-x-auto ">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 min-w-[800px] ">
                              {declaration.iteminfo.flatMap((item) =>
                                item.taxAmountPerItem?.map((tax, index) =>
                                  Object.entries(tax).map(
                                    ([key, value]) =>
                                      value !== null && (
                                        <div
                                          key={`${key}-${index}`}
                                          className="bg-red-50 p-2 rounded-lg border border-gray-800 shadow-xs min-w-[200px]"
                                        >
                                          <h4 className="font-medium text-black-700 capitalize text-xs mb-1">
                                            {key
                                              .replace(/([A-Z])/g, " $1")
                                              .trim()}
                                          </h4>
                                          <p className="text-black-900 font-bold text-xs">
                                            {typeof value === "number"
                                              ? value.toLocaleString()
                                              : value || "N/A"}{" "}
                                            ETB
                                          </p>
                                        </div>
                                      )
                                  )
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )}
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
