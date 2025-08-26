import React, { useEffect } from "react";
import type { Item } from "../types";

interface ItemTableProps {
  items: Item[];
  handleItemChange: (idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  addItem: () => void;
  removeItem: (idx: number) => void;
  receiptCategory: string;
  receiptName: string;
  itemType: string;
  hasImportExport: string;
  subTotal: number;
  tax: number;
  total: number;
}

const ItemTable: React.FC<ItemTableProps> = ({ items, handleItemChange, addItem, removeItem, receiptCategory, receiptName, itemType, hasImportExport, subTotal, tax, total }) => {
  // Determine category types
  const isRevenueOrExpense = receiptCategory === 'Revenue' || receiptCategory === 'Expense';
  const isCRV = receiptCategory === 'Crv';
  const isOther = receiptCategory === 'Other';
  
  // Show table only for valid categories
  if (!isRevenueOrExpense && !isCRV && !isOther) {
    return null;
  }

  // Get tax percentage for display
  const getTaxPercentage = () => {
    if (receiptName === 'VAT') {
      return '15%';
    } else if (receiptName === 'EXEMPTED') {
      return '0%';
    } else if (receiptName === 'TOT') {
      if (itemType === 'goods') {
        return '2%';
      } else if (itemType === 'service') {
        return '10%';
      }
    } else if (receiptName === 'MIXED') {
      return 'Mixed';
    }
    return '0%';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Items & Services</h3>
          {/* <p className="text-sm text-gray-600 mt-1">Add items or services for this receipt</p> */}
        </div>
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
          onClick={addItem}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Item
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            {/* Item Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Item #{idx + 1}</h4>
              {items.length > 1 && (
                <button
                  type="button"
                  className="bg-red-100 hover:bg-red-200 text-red-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                  onClick={() => removeItem(idx)}
                  title="Remove item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Item Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* GL Account */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">GL Account *</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                  name="glAccount"
                  value={item.glAccount || ''}
                  onChange={e => handleItemChange(idx, e)}
                  required
                />
              </div>

              {/* Declaration Number for Import/Export */}
              {hasImportExport === 'yes' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Declaration Number *</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                    name="declarationNumber"
                    value={item.declarationNumber || ''}
                    onChange={e => handleItemChange(idx, e)}
                    required
                  />
                </div>
              )}

              {/* HS Code */}
              {(isRevenueOrExpense || isOther) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">HS Code *</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                    name="hsCode"
                    value={item.hsCode || ''}
                    onChange={e => handleItemChange(idx, e)}
                    required
                  />
                </div>
              )}

              {/* Item Code */}
              {(isRevenueOrExpense || isOther) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Item Code *</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                    name="itemCode"
                    value={item.itemCode || ''}
                    onChange={e => handleItemChange(idx, e)}
                    required
                  />
                </div>
              )}
              {/* Tax Type for mixed receipts */}
              {receiptName === 'MIXED' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tax Type *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                    name="taxType"
                    value={item.taxType || ''}
                    onChange={e => handleItemChange(idx, e)}
                    required
                  >
                    <option value="">Select Tax Type</option>
                    <option value="VAT">VAT (15%)</option>
                    <option value="TOT">TOT ({itemType === 'goods' ? '2%' : '10%'})</option>
                    <option value="EXEMPTED">Exempted (0%)</option>
                  </select>
                </div>
              )}

              {/* Nature */}
              {(isRevenueOrExpense || isCRV || isOther) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nature *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                    name="nature"
                    value={item.nature || ''}
                    onChange={e => handleItemChange(idx, e)}
                    required
                  >
                    <option value="">Select Nature</option>
                    
                    {/* Revenue category: Show options 5-45 */}
                    {(receiptCategory === 'Revenue' || isCRV || isOther) && (
                      <>
                        <option value="5">5-Taxable Sales</option>
                        <option value="15">15-Zero rated sales</option>
                        <option value="20">20-Tax exempt sales</option>
                        <option value="25">25-Supplis subject to reverse tax</option>
                        <option value="35">35-Tax Adjustment with debit</option>
                        <option value="45">45-Tax Adjustment with credit</option>
                      </>
                    )}
                    
                    {/* Expense category: Show options 65-155 */}
                    {(receiptCategory === 'Expense' || isCRV || isOther) && (
                      <>
                        <option value="65">65-Local Purchase</option>
                        <option value="75">75-Imported capital assets</option>
                        <option value="85">85-Vat or unclaimed inputs</option>
                        <option value="100">100-Local purchase inputs</option>
                        <option value="110">110-Imported purchase inputs</option>
                        <option value="120">120-General Expense inputs purchase</option>
                        <option value="130">130-Purchase with no Vat</option>
                        <option value="135">135-Duductable on Vat reverse</option>
                        <option value="145">145-Tax adjustment with debit note for buyers</option>
                        <option value="155">155-Tax Adjustment with credit note for buyers</option>
                      </>
                    )}
                  </select>
                </div>
              )}


              {/* Description */}
              {(isRevenueOrExpense || isOther) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  {hasImportExport === 'yes' ? (
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                      name="description"
                      value={item.description || ''}
                      onChange={e => handleItemChange(idx, e)}
                      required
                    >
                      <option value="">Select</option>
                      <option value="Inland freight 2">Inland freight</option>
                      <option value="Transportation">Transportation cost</option>
                      <option value="Bank service">Bank service charge</option>
                      <option value="Warehouse fee">Warehouse fee</option>
                      <option value="Transit cost">Transitor Fee</option>
                    </select>
                  ) : (
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                      name="description"
                      value={item.description || ''}
                      onChange={e => handleItemChange(idx, e)}
                    />
                  )}
                </div>
              )}

              {/* Bank Service Extra Fields */}
              {hasImportExport === 'yes' && item.description === 'Bank service' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Bank Permit Date</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                      type="date"
                      name="bankPermitDate"
                      value={item.bankPermitDate || ''}
                      onChange={e => handleItemChange(idx, e)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Permit No</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                      name="permitNo"
                      value={item.permitNo || ''}
                      onChange={e => handleItemChange(idx, e)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Bank Reference</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                      name="bankReference"
                      value={item.bankReference || ''}
                      onChange={e => handleItemChange(idx, e)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Bank Service charge</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                      name="bankService"
                      value={item.bankService || ''}
                      onChange={e => handleItemChange(idx, e)}
                    />
                  </div>
                </>
              )}

              {/* Unit of Measurement */}
              {(isRevenueOrExpense || isOther) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Measurement *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                    name="unitOfMeasurement"
                    value={item.unitOfMeasurement || ''}
                    onChange={e => handleItemChange(idx, e)}
                    required
                  >
                    <option value="">Select Unit</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="l">Liter (l)</option>
                    <option value="ml">Milliliter (ml)</option>
                    <option value="m">Meter (m)</option>
                    <option value="cm">Centimeter (cm)</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                    <option value="set">Set</option>
                    <option value="dozen">Dozen</option>
                    <option value="pair">Pair</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Quantity *</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                  type="number"
                  min="0"
                  step="1"
                  name="quantity"
                  value={item.quantity || ''}
                  onChange={e => handleItemChange(idx, e)}
                  required
                />
              </div>

              {/* Unit Cost / Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {isCRV ? 'Amount *' : 'Unit Cost *'}
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                  type="number"
                  min="0"
                  step="0.01"
                  name="unitCost"
                  value={item.unitCost || ''}
                  onChange={e => handleItemChange(idx, e)}
                  required
                />
              </div>

              {/* Total Cost */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Total</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-black font-medium"
                  type="number"
                  name="totalCost"
                  value={item.totalCost || ''}
                  readOnly
                />
              </div>

              {/* Reason for CRV */}
              {isCRV && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Reason *</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                    name="reasonOfReceiving"
                    value={item.reasonOfReceiving || ''}
                    onChange={e => handleItemChange(idx, e)}
                    required
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Totals Section - Hidden for CRV */}
      {!isCRV && items.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex justify-end">
            <div className="bg-white border border-blue-200 rounded-lg p-6 min-w-[320px] shadow-sm">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-800">{subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax ({getTaxPercentage()}):</span>
                  <span className="font-semibold text-gray-800">{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                                  <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total:</span>
                  <span className="text-xl font-bold text-blue-600">{total.toFixed(2)}</span>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemTable; 