'use client';

import React from 'react';
import { formatCurrency } from '../utils';

interface SummaryCardsProps {
  totalOutputVAT: number;
  totalInputVAT: number;
  vatDue: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalOutputVAT,
  totalInputVAT,
  vatDue
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Output VAT</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOutputVAT)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Input VAT</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalInputVAT)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
            vatDue >= 0 ? 'bg-blue-100' : 'bg-orange-100'
          }`}>
            <svg className={`w-5 h-5 ${vatDue >= 0 ? 'text-blue-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">
              {vatDue >= 0 ? 'VAT Due' : 'VAT Credit'}
            </p>
            <p className={`text-2xl font-bold ${vatDue >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatCurrency(Math.abs(vatDue))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
