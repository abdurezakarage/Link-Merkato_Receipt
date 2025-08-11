import React, { useState, useEffect } from "react";
import FileUpload from "./FileUpload";

interface NoReceiptFormsProps {
  submitting: boolean;
  onSubmit: (formData: any) => void;
  activeSection: string;
}

interface PurchaseVoucherForm {
  purchaseReceiptNumber: string;
  supplierName: string;
  supplierTIN: string;
  supplierAddress: string;
  date: string;
  amountPaid: number;
  description: string;
  document: File | null;
}

interface WithholdingForm {
  supplierName: string;
  supplierTIN: string;
  date: string;
  withholdingReceiptNumber: string;
  amountPaid: number;
  withholdingTax: number;
  description: string;
  document: File | null;
}

const NoReceiptForms: React.FC<NoReceiptFormsProps> = ({ submitting, onSubmit, activeSection }) => {
  const [purchaseVoucherForm, setPurchaseVoucherForm] = useState<PurchaseVoucherForm>({
    purchaseReceiptNumber: '',
    supplierName: '',
    supplierTIN: '',
    supplierAddress: '',
    date: '',
    amountPaid: 0,
    description: '',
    document: null
  });

  const [withholdingForm, setWithholdingForm] = useState<WithholdingForm>({
    supplierName: '',
    supplierTIN: '',
    date: '',
    withholdingReceiptNumber: '',
    amountPaid: 0,
    withholdingTax: 0,
    description: '',
    document: null
  });

  // State for input display values (to avoid leading zeros)
  const [purchaseAmountDisplay, setPurchaseAmountDisplay] = useState<string>('');
  const [withholdingAmountDisplay, setWithholdingAmountDisplay] = useState<string>('');

  // Auto-calculate withholding tax (30% of amount paid)
  useEffect(() => {
    if (withholdingForm.amountPaid > 0) {
      setWithholdingForm(prev => ({
        ...prev,
        withholdingTax: withholdingForm.amountPaid * 0.3
      }));
    }
  }, [withholdingForm.amountPaid]);

  const handlePurchaseVoucherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amountPaid') {
      // Remove any non-numeric characters except decimal point
      const cleanValue = value.replace(/[^0-9.]/g, '');
      setPurchaseAmountDisplay(cleanValue);
      
      // Convert to number for the form state
      const numValue = parseFloat(cleanValue) || 0;
      setPurchaseVoucherForm(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setPurchaseVoucherForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleWithholdingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amountPaid') {
      // Remove any non-numeric characters except decimal point
      const cleanValue = value.replace(/[^0-9.]/g, '');
      setWithholdingAmountDisplay(cleanValue);
      
      // Convert to number for the form state
      const numValue = parseFloat(cleanValue) || 0;
      setWithholdingForm(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setWithholdingForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePurchaseVoucherFile = (file: File | null) => {
    setPurchaseVoucherForm(prev => ({ ...prev, document: file }));
  };

  const handleWithholdingFile = (file: File | null) => {
    setWithholdingForm(prev => ({ ...prev, document: file }));
  };

  const handlePurchaseVoucherSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate required fields for Purchase Voucher
    if (!purchaseVoucherForm.purchaseReceiptNumber || !purchaseVoucherForm.supplierName || !purchaseVoucherForm.supplierTIN || 
        !purchaseVoucherForm.date || purchaseVoucherForm.amountPaid <= 0) {
      alert('Please fill in all required fields for Purchase Voucher form');
      return;
    }

    // Submit only purchase voucher form
    onSubmit({
      purchaseVoucher: purchaseVoucherForm,
      withholding: null
    });
  };

  const handleWithholdingSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Validate required fields for Withholding form
    if (!withholdingForm.supplierName || !withholdingForm.supplierTIN || 
        !withholdingForm.date || !withholdingForm.withholdingReceiptNumber || 
        withholdingForm.amountPaid <= 0) {
      alert('Please fill in all required fields for Withholding form');
      return;
    }

    // Submit only withholding form
    onSubmit({
      purchaseVoucher: null,
      withholding: withholdingForm
    });
  };

  const handleBothSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate required fields for Purchase Voucher
    if (!purchaseVoucherForm.purchaseReceiptNumber || !purchaseVoucherForm.supplierName || !purchaseVoucherForm.supplierTIN || 
        !purchaseVoucherForm.date || purchaseVoucherForm.amountPaid <= 0) {
      alert('Please fill in all required fields for Purchase Voucher form');
      return;
    }

    // Validate required fields for Withholding form
    if (!withholdingForm.supplierName || !withholdingForm.supplierTIN || 
        !withholdingForm.date || !withholdingForm.withholdingReceiptNumber || 
        withholdingForm.amountPaid <= 0) {
      alert('Please fill in all required fields for Withholding form');
      return;
    }

    // Submit both forms
    onSubmit({
      purchaseVoucher: purchaseVoucherForm,
      withholding: withholdingForm
    });
  };

  // Show only the selected form based on activeSection
  const showPurchaseVoucher = activeSection === 'purchase-voucher';
  const showWithholding = activeSection === 'withholding-30';

  return (
    <div className="mb-8 flex flex-col gap-8">
      {/* Purchase Voucher Receipt Form */}
      {showPurchaseVoucher && (
        <div className="bg-gradient-to-br from-white to-gray-50 border border-blue-200 rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-white text-black px-6 py-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Purchase Voucher Receipt Form
            </h2>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
          

            {/* Supplier Information Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              Supplier Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    name="supplierName" 
                    value={purchaseVoucherForm.supplierName}
                    onChange={handlePurchaseVoucherChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Supplier TIN <span className="text-red-500">*</span>
                  </label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    name="supplierTIN" 
                    value={purchaseVoucherForm.supplierTIN}
                    onChange={handlePurchaseVoucherChange}
                  
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Supplier Address <span className="text-red-500">*</span>
                  </label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    name="supplierAddress" 
                    value={purchaseVoucherForm.supplierAddress}
                    onChange={handlePurchaseVoucherChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    name="date" 
                    type="date" 
                    value={purchaseVoucherForm.date}
                    onChange={handlePurchaseVoucherChange}
                  />
                </div>
               
              </div>
            </div>

  {/* Receipt Information Section */}
  <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Purchase Receipt Number <span className="text-red-500">*</span>
                  </label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    name="purchaseReceiptNumber" 
                    value={purchaseVoucherForm.purchaseReceiptNumber}
                    onChange={handlePurchaseVoucherChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    name="description" 
                    value={purchaseVoucherForm.description}
                    onChange={handlePurchaseVoucherChange}
                  
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Amount Paid <span className="text-red-500">*</span>
                  </label>
                                    <input 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    name="amountPaid" 
                    type="text" 
                    value={purchaseAmountDisplay}
                    onChange={handlePurchaseVoucherChange}
    
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
                <div className="space-y-2">
                  <FileUpload
                    label="Attach Purchase Voucher Receipt"
                    accept="image/*,.pdf"
                    onChange={handlePurchaseVoucherFile}
                    value={purchaseVoucherForm.document}
                    maxSize={10}
                    required={false}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button 
                type="button"
                onClick={handlePurchaseVoucherSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2" 
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit 
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 30% Withholding Form */}
      {showWithholding && (
        <div className="bg-gradient-to-br from-white to-gray-50 border border-blue-200 rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-white text-black px-6 py-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
             
              30% Withholding Receipt Form
            </h2>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">


            {/* Supplier Information Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors" 
                    name="supplierName" 
                    value={withholdingForm.supplierName}
                    onChange={handleWithholdingChange}
                   
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Supplier TIN <span className="text-red-500">*</span>
                  </label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors" 
                    name="supplierTIN" 
                    value={withholdingForm.supplierTIN}
                    onChange={handleWithholdingChange}
                    placeholder="Enter TIN number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Withholding Receipt Number <span className="text-red-500">*</span>
                  </label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors" 
                    name="withholdingReceiptNumber" 
                    value={withholdingForm.withholdingReceiptNumber}
                    onChange={handleWithholdingChange}
                    placeholder="Enter receipt number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors" 
                    name="date" 
                    type="date" 
                    value={withholdingForm.date}
                    onChange={handleWithholdingChange}
                  />
                </div>
             
              </div>
            </div>

            {/* Receipt Information Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors" 
                    name="description" 
                    value={withholdingForm.description}
                    onChange={handleWithholdingChange}
                    placeholder="Enter description"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Amount Paid <span className="text-red-500">*</span>
                  </label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors" 
                    name="amountPaid" 
                    type="text" 
                    value={withholdingAmountDisplay}
                    onChange={handleWithholdingChange}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">
                      Withholding Tax (30%)
                    </label>
                    <div className="text-lg font-bold text-amber-700 bg-amber-100 px-3 py-2 rounded-lg">
                {withholdingForm.withholdingTax.toFixed(2)} 
                    </div>
                  </div>
              </div>
            </div>


          

            {/* Additional Information Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
                <div className="space-y-2">
                  <FileUpload
                    label="Attach Withholding Receipt"
                    accept="image/*,.pdf"
                    onChange={handleWithholdingFile}
                    value={withholdingForm.document}
                    maxSize={10}
                    required={false}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button 
                type="button"
                onClick={handleWithholdingSubmit}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2" 
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Both Forms Button - Only show when both forms are visible */}
      {showPurchaseVoucher && showWithholding && (
        <div className="flex justify-center">
          <button 
            type="button" 
            onClick={handleBothSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2" 
            disabled={submitting}
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submit Both Forms
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default NoReceiptForms; 