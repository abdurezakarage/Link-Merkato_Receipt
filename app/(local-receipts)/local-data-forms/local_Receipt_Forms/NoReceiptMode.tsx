"use client";

import React, { useState } from "react";
import axios from "axios";
import NoReceiptForms from "./NoReceiptForms";
import { DJANGO_BASE_URL } from "../../api/api";

interface NoReceiptModeProps {
  token: string | null;
  activeSection: string;
}

export default function NoReceiptMode({ token, activeSection }: NoReceiptModeProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
            // "Authorization": `Bearer ${token}`,
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

      // Handle both forms submission (existing functionality)
      if (formData.purchaseVoucher && formData.withholding) {
        // Submit Purchase Voucher form
        const purchaseVoucherFormData = new FormData();
        purchaseVoucherFormData.append('purchase_receipt_number', formData.purchaseVoucher.purchaseReceiptNumber);
        purchaseVoucherFormData.append('supplier_name', formData.purchaseVoucher.supplierName);
        purchaseVoucherFormData.append('supplier_tin', formData.purchaseVoucher.supplierTIN);
        purchaseVoucherFormData.append('supplier_address', formData.purchaseVoucher.supplierAddress);
        purchaseVoucherFormData.append('date', formData.purchaseVoucher.date);
        purchaseVoucherFormData.append('amount_paid', String(formData.purchaseVoucher.amountPaid));
        purchaseVoucherFormData.append('description', formData.purchaseVoucher.description);
        
        if (formData.purchaseVoucher.document) {
          purchaseVoucherFormData.append('document', formData.purchaseVoucher.document);
        }

        const purchaseVoucherResponse = await axios.post(`${DJANGO_BASE_URL}/purchase-vouchers`, purchaseVoucherFormData, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
        });

        // Submit 30% Withholding form
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

        setSuccess("Both Purchase Voucher and 30% Withholding forms submitted successfully!");
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
        setError("Failed to submit forms. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <NoReceiptForms 
        submitting={submitting} 
        onSubmit={handleNoReceiptSubmit} 
        activeSection={activeSection}
      />
      {error && <div className="text-red-600 bg-red-100 rounded px-3 py-2 text-center mb-2 font-semibold">{error}</div>}
      {success && <div className="text-green-700 bg-green-100 rounded px-3 py-2 text-center mb-2 font-semibold">{success}</div>}
    </>
  );
} 