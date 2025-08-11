import React from "react";

interface ModeSelectorProps {
  noReceiptMode: boolean;
  setNoReceiptMode: (mode: boolean) => void;
  variant?: 'tabs' | 'toggle' | 'cards';
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ 
  noReceiptMode, 
  setNoReceiptMode, 
  variant = 'tabs' 
}) => {
  if (variant === 'tabs') {
    return (
      <div className="mb-8">
        <div className="flex bg-gray-100 rounded-lg p-1 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setNoReceiptMode(false)}
            className={`flex-1 px-6 py-3 rounded-md font-medium text-sm transition-all duration-200 ${
              !noReceiptMode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>With Receipt</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setNoReceiptMode(true)}
            className={`flex-1 px-6 py-3 rounded-md font-medium text-sm transition-all duration-200 ${
              noReceiptMode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>No Receipt</span>
            </div>
          </button>
        </div>
        <div className="text-center mt-3">
          <p className="text-sm text-gray-600">
            {noReceiptMode 
              ? "Use this mode when the seller doesn't have a physical receipt"
              : "Use this mode when you have a physical receipt to enter"
            }
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'toggle') {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${!noReceiptMode ? 'text-blue-600' : 'text-gray-500'}`}>
            With Receipt
          </span>
          <button
            type="button"
            onClick={() => setNoReceiptMode(!noReceiptMode)}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              noReceiptMode ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                noReceiptMode ? 'translate-x-9' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${noReceiptMode ? 'text-blue-600' : 'text-gray-500'}`}>
            Purchase Voucher
          </span>
        </div>
        <div className="text-center mt-3">

        </div>
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => setNoReceiptMode(false)}
            className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
              !noReceiptMode ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${!noReceiptMode ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className={`font-semibold text-lg ${!noReceiptMode ? 'text-blue-900' : 'text-gray-900'}`}>
                  With Receipt
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Enter details from a physical receipt document
                </p>
              </div>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setNoReceiptMode(true)}
            className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
              noReceiptMode ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${noReceiptMode ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className={`font-semibold text-lg ${noReceiptMode ? 'text-blue-900' : 'text-gray-900'}`}>
                  No Receipt
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Create purchase voucher and withholding forms
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ModeSelector; 