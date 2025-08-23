"use client";

import React, { useState } from "react";
import axios from "axios";
import NoReceiptForms from "../local-data-forms/local_Receipt_Forms/NoReceiptForms";
import { DJANGO_BASE_URL } from "../api/api";
import ProtectedRoute from "../../Context/ProtectedRoute";
import { useAuth } from "../../Context/AuthContext";

const PurchaseVoucher = () => {
  const { user, token, isLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSection, setActiveSection] = useState<'purchase-voucher' | 'withholding-30'>('purchase-voucher');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Handle no receipt form submit function 
  const handleNoReceiptSubmit = async (formData: any) => {
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Handle Purchase Voucher form submission
      if (formData.purchaseVoucher && !formData.withholding) {
        const purchaseVoucherFormData = new FormData();
        purchaseVoucherFormData.append('purchase_recipt_number', formData.purchaseVoucher.purchaseReceiptNumber);
        purchaseVoucherFormData.append('supplier_name', formData.purchaseVoucher.supplierName);
        purchaseVoucherFormData.append('supplier_tin', formData.purchaseVoucher.supplierTIN);
        purchaseVoucherFormData.append('supplier_address', formData.purchaseVoucher.supplierAddress);
        purchaseVoucherFormData.append('date', formData.purchaseVoucher.date);
        purchaseVoucherFormData.append('amount_paid', String(formData.purchaseVoucher.amountPaid));
        purchaseVoucherFormData.append('description', formData.purchaseVoucher.description);
        
        if (formData.purchaseVoucher.document) {
          purchaseVoucherFormData.append('document', formData.purchaseVoucher.document);
        }

        const purchaseVoucherResponse = await axios.post(`${DJANGO_BASE_URL}/create-purchase-voucher`, purchaseVoucherFormData, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
        });

        setSuccess("Purchase Voucher form submitted successfully!");
        return;
      }

      // Handle 30% Withholding form submission
      if (formData.withholding && !formData.purchaseVoucher) {
        const withholdingFormData = new FormData();
        withholdingFormData.append('supplier_name', formData.withholding.supplierName);
        withholdingFormData.append('withholding_receipt_number', formData.withholding.withholdingReceiptNumber);
        withholdingFormData.append('withholding_receipt_date', formData.withholding.date);
        withholdingFormData.append('transaction_description', formData.withholding.description);
        withholdingFormData.append('sub_total', String(formData.withholding.amountPaid));
        withholdingFormData.append('tax_withholding_amount', String(formData.withholding.withholdingTax));
        withholdingFormData.append('buyer_tin', formData.withholding.supplierTIN);
        
        if (formData.withholding.document) {
          withholdingFormData.append('withholding_document', formData.withholding.document);
        }

        const withholdingResponse = await axios.post(`${DJANGO_BASE_URL}/30percent-withholding/`, withholdingFormData, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
        });

        setSuccess("30% Withholding form submitted successfully!");
        return;
      }
      
    } catch (err) {
      console.error('No receipt form submission error:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        response: (err as any)?.response?.data,
        status: (err as any)?.response?.status,
        statusText: (err as any)?.response?.statusText
      });
      
      // Determine which form failed and provide specific error message
      if (formData.purchaseVoucher && !formData.withholding) {
        setError("Failed to submit Purchase Voucher form. Please try again.");
      } else if (formData.withholding && !formData.purchaseVoucher) {
        setError("Failed to submit 30% Withholding form. Please try again.");
      } else {
        setError("Failed to submit form. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Sidebar sections
  const sidebarSections = [
    {
      id: 'purchase-voucher',
      title: 'Purchase Voucher',
      description: 'Submit purchase voucher details',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'withholding-30',
      title: '30% Withholding',
      description: 'Submit withholding receipt details',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#f7faff] to-[#f3f6fd]">
        {/* Show loading state while auth is initializing */}
        {isLoading && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        )}
        
        {/* Only render the content when not loading */}
        {!isLoading && (
          <div className="flex h-screen">
            {/* Sidebar */}
            <div className={`
              fixed lg:relative
              top-0 left-0 h-full
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              w-80 bg-white border-r border-gray-200 p-6
              transition-transform duration-300 ease-in-out z-50
              lg:z-30
              flex flex-col
              ${!sidebarOpen ? 'lg:hidden' : ''}
            `}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-800">
                    Purchase Voucher & Withholding
                  </h2>
                  {/* Desktop toggle button */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
                    title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
                  >
                    {sidebarOpen ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                </div>
                {/* Close button for mobile */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Sections */}
              <nav className="flex-1 space-y-2">
                {sidebarSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id as 'purchase-voucher' | 'withholding-30');
                      // Close sidebar on mobile after selection
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      activeSection === section.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600">
                        {section.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{section.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{section.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Mobile menu button when sidebar is closed */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="fixed top-4 left-4 z-40 lg:hidden flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                  title="Show Sidebar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}

              {/* Content Area */}
              <div className="p-6">
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {activeSection === 'purchase-voucher' ? 'Purchase Voucher' : '30% Withholding'}
                  </h1>
                  <p className="text-gray-600">
                    {activeSection === 'purchase-voucher' 
                      ? 'Submit purchase voucher details' 
                      : 'Submit withholding receipt details'
                    }
                  </p>
                </div>

                {/* Forms */}
                <NoReceiptForms 
                  submitting={submitting} 
                  onSubmit={handleNoReceiptSubmit} 
                  activeSection={activeSection}
                />

                {/* Error and Success Messages */}
                {error && (
                  <div className="text-red-600 bg-red-100 rounded px-3 py-2 text-center mb-2 font-semibold">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="text-green-700 bg-green-100 rounded px-3 py-2 text-center mb-2 font-semibold">
                    {success}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default PurchaseVoucher;
