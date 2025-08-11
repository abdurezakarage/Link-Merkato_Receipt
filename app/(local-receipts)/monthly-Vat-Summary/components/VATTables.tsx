'use client';

import React from 'react';
import { natureCodeMappings } from '../constants';
import { formatCurrency } from '../utils';
import { EditableValues, VATSummaryData, SectionTotals } from '../types';
import EditableField from './EditableField';

interface VATTablesProps {
  vatSummary: { [key: string]: VATSummaryData };
  currentValues: EditableValues;
  sectionTotals: SectionTotals;
  isEditMode: boolean;
  onValueChange: (natureCode: string, field: 'total' | 'vat', value: string) => void;
}

const VATTables: React.FC<VATTablesProps> = ({
  vatSummary,
  currentValues,
  sectionTotals,
  isEditMode,
  onValueChange
}) => {
  const renderVATSection = (
    sectionType: 'output' | 'capital' | 'nonCapital',
    title: string,
    totalLineNumber: string,
    totalVATLineNumber: string,
    totalLabel: string,
    shadedCodes: string[]
  ) => {
    return (
      <div className="p-6 border-t border-gray-200">
        <h4 className="text-md font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          {title}
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {sectionType === 'output' ? 'Output VAT' : 'Input VAT'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(natureCodeMappings)
                .filter(([_, mapping]) => mapping.section === sectionType)
                .sort(([_, a], [__, b]) => a.lineNumber - b.lineNumber)
                .map(([natureCode, mapping]) => {
                  const originalData = vatSummary[natureCode] || { total: 0, vat: 0, count: 0 };
                  const currentData = currentValues[natureCode] || { total: 0, vat: 0 };
                  const isShaded = shadedCodes.includes(natureCode);
                  const backgroundClass = originalData.count > 0 ? 
                    (sectionType === 'output' ? 'bg-blue-50' : 'bg-green-50') : '';
                  
                  return (
                    <tr key={natureCode} className={backgroundClass}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{mapping.lineNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{mapping.label}</div>
                          {isEditMode && (
                            <div className="text-xs text-gray-500 mt-1">
                              Original: {formatCurrency(originalData.total)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        <EditableField
                          value={currentData.total}
                          onChange={(value) => onValueChange(natureCode, 'total', value)}
                          isEditable={isEditMode}
                          className="font-medium"
                        />
                      </td>
                      <td className={`px-4 py-3 text-sm text-center font-medium ${isShaded ? 'bg-gray-300' : ''}`}>
                        {mapping.vatLineNumber || '-'}
                      </td>
                      <td className={`px-4 py-3 text-sm font-medium ${isShaded ? 'bg-gray-300' : ''} ${
                        sectionType === 'output' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {isShaded ? '' : (
                          <EditableField
                            value={currentData.vat}
                            onChange={(value) => onValueChange(natureCode, 'vat', value)}
                            isEditable={isEditMode && !isShaded}
                            className={`font-medium ${sectionType === 'output' ? 'text-red-600' : 'text-green-600'}`}
                          />
                        )}
                        {isEditMode && !isShaded && (
                          <div className="text-xs text-gray-500 mt-1">
                            Original: {formatCurrency(originalData.vat)}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{totalLineNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{totalLabel}</td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {formatCurrency(sectionTotals[sectionType].total)}
                </td>
                <td className="px-4 py-3 text-sm text-center font-medium text-gray-900">{totalVATLineNumber}</td>
                <td className={`px-4 py-3 text-sm font-medium ${
                  sectionType === 'output' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatCurrency(sectionTotals[sectionType].vat)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">VAT Form Structure</h3>
      </div>

      {/* COMPUTATION OF OUTPUT TAX */}
      <div className="p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          COMPUTATION OF OUTPUT TAX
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Output VAT</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(natureCodeMappings)
                .filter(([_, mapping]) => mapping.section === 'output')
                .sort(([_, a], [__, b]) => a.lineNumber - b.lineNumber)
                .map(([natureCode, mapping]) => {
                  const originalData = vatSummary[natureCode] || { total: 0, vat: 0, count: 0 };
                  const currentData = currentValues[natureCode] || { total: 0, vat: 0 };
                  const isShaded = ['15', '20'].includes(natureCode);
                  return (
                    <tr key={natureCode} className={originalData.count > 0 ? 'bg-blue-50' : ''}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{mapping.lineNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{mapping.label}</div>
                          {isEditMode && (
                            <div className="text-xs text-gray-500 mt-1">
                              Original: {formatCurrency(originalData.total)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        <EditableField
                          value={currentData.total}
                          onChange={(value) => onValueChange(natureCode, 'total', value)}
                          isEditable={isEditMode}
                          className="font-medium"
                        />
                      </td>
                      <td className={`px-4 py-3 text-sm text-center font-medium ${isShaded ? 'bg-gray-300' : ''}`}>
                        {mapping.vatLineNumber || '-'}
                      </td>
                      <td className={`px-4 py-3 text-sm text-red-600 font-medium ${isShaded ? 'bg-gray-300' : ''}`}>
                        {isShaded ? '' : (
                          <EditableField
                            value={currentData.vat}
                            onChange={(value) => onValueChange(natureCode, 'vat', value)}
                            isEditable={isEditMode && !isShaded}
                            className="text-red-600 font-medium"
                          />
                        )}
                        {isEditMode && !isShaded && (
                          <div className="text-xs text-gray-500 mt-1">
                            Original: {formatCurrency(originalData.vat)}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">55</td>
                <td className="px-4 py-3 text-sm text-gray-900">Total sales/Supplies</td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {formatCurrency(sectionTotals.output.total)}
                </td>
                <td className="px-4 py-3 text-sm text-center font-medium text-gray-900">60</td>
                <td className="px-4 py-3 text-sm text-red-600 font-medium">
                  {formatCurrency(sectionTotals.output.vat)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CAPITAL ASSET PURCHASES */}
      {renderVATSection(
        'capital',
        'CAPITAL ASSET PURCHASES',
        '90',
        '95',
        'Total capital assets',
        ['85']
      )}

      {/* NON-CAPITAL ASSET PURCHASES */}
      {renderVATSection(
        'nonCapital',
        'NON-CAPITAL ASSET PURCHASES',
        '165',
        '170',
        'Total inputs',
        ['130']
      )}
    </div>
  );
};

export default VATTables;
