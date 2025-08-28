'use client';

import React from 'react';
import { formatCurrency } from '../utils';
import { ManualAdjustments } from '../types';
import EditableField from './EditableField';

interface FinalCalculationProps {
  manualAdjustments: ManualAdjustments;
  onManualAdjustmentChange: (field: keyof ManualAdjustments, value: string) => void;
  totalOutputVAT: number;
  totalInputVAT: number;
  adjustedVatDue: number;
  vatDue: number;
  isEditMode: boolean;
}

const FinalCalculation: React.FC<FinalCalculationProps> = ({
  manualAdjustments,
  onManualAdjustmentChange,
  totalOutputVAT,
  totalInputVAT,
  adjustedVatDue,
  vatDue,
  isEditMode
}) => {
  return (
    <div className="p-6 border-t border-gray-200 bg-gray-50">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="bg-yellow-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">175</td>
              <td className="px-4 py-3 text-sm text-gray-900">
                VAT on Government Voucher
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                <EditableField
                  value={manualAdjustments.vatOnGovernmentVoucher}
                  onChange={(value) => onManualAdjustmentChange('vatOnGovernmentVoucher', value)}
                  isEditable={true}
                  className="font-medium"
                />
              </td>
            </tr>
            <tr className="bg-yellow-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">180</td>
              <td className="px-4 py-3 text-sm text-gray-900">
                Other credits for the month (payments, goods on hand)
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                <EditableField
                  value={manualAdjustments.otherCredits}
                  onChange={(value) => onManualAdjustmentChange('otherCredits', value)}
                  isEditable={true}
                  className="font-medium"
                />
              </td>
            </tr>
            <tr className="bg-blue-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">185</td>
              <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                VAT due for month (Line 60-95-170-175-180)
                {isEditMode && (
                  <div className="text-xs text-blue-600 mt-1">
                    Auto-calculated: {formatCurrency(totalOutputVAT)} - {formatCurrency(totalInputVAT)} - {formatCurrency(manualAdjustments.vatOnGovernmentVoucher)} - {formatCurrency(manualAdjustments.otherCredits)}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-blue-600 font-bold">
                {adjustedVatDue >= 0 ? formatCurrency(adjustedVatDue) : formatCurrency(0)}
              </td>
            </tr>
            <tr className="bg-orange-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">190</td>
              <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                VAT credit for the month (Line 95+170+180-60)
                {isEditMode && (
                  <div className="text-xs text-blue-600 mt-1">
                    Auto-calculated: {formatCurrency(totalInputVAT)} + {formatCurrency(manualAdjustments.otherCredits)} - {formatCurrency(totalOutputVAT)}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-orange-600 font-bold">
                {adjustedVatDue < 0 ? formatCurrency(Math.abs(adjustedVatDue)) : formatCurrency(0)}
              </td>
            </tr>
            <tr className="bg-yellow-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">195</td>
              <td className="px-4 py-3 text-sm text-gray-900">
                Credit Carried forward from Previous Month
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                <EditableField
                  value={manualAdjustments.creditCarriedForward}
                  onChange={(value) => onManualAdjustmentChange('creditCarriedForward', value)}
                  isEditable={true}
                  className="font-medium"
                />
              </td>
            </tr>
            <tr className="bg-green-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">200</td>
              <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                Amount to be paid (Line 185-195)
                {isEditMode && (
                  <div className="text-xs text-blue-600 mt-1">
                    Auto-calculated: {formatCurrency(Math.max(0, adjustedVatDue))} - {formatCurrency(manualAdjustments.creditCarriedForward)}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-green-600 font-bold">
                {vatDue >= 0 ? formatCurrency(Math.max(0, vatDue)) : formatCurrency(0)}
              </td>
            </tr>
            <tr className="bg-purple-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">205</td>
              <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                Credit Available for carry forward (Line 190+195-185)
                {isEditMode && (
                  <div className="text-xs text-blue-600 mt-1">
                    Auto-calculated: {formatCurrency(Math.max(0, Math.abs(adjustedVatDue)))} + {formatCurrency(manualAdjustments.creditCarriedForward)} - {formatCurrency(Math.max(0, adjustedVatDue))}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-purple-600 font-bold">
                {vatDue < 0 ? formatCurrency(Math.abs(vatDue)) : formatCurrency(manualAdjustments.creditCarriedForward)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinalCalculation;
