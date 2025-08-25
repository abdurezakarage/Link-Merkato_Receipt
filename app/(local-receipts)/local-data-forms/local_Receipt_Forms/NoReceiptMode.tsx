"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import NoReceiptForms from "./NoReceiptForms";
import { DJANGO_BASE_URL } from "../../api/api";
import { useRouter } from "next/navigation";

interface NoReceiptModeProps {
  token: string | null;
  activeSection: string;
}

export default function NoReceiptMode({ token, activeSection }: NoReceiptModeProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  // Memoize the navigation function to avoid dependency issues
  const navigateToUserInfo = useCallback(() => {
    router.push('/userinfo');
  }, [router]);

  // Countdown effect for navigation delay
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && success) {
      navigateToUserInfo();
    }
  }, [countdown, success, navigateToUserInfo]);

  // Handle no receipt form submit function 
  const handleNoReceiptSubmit = async (formData: any) => {
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const formatToDDMMYYYY = (input: string) => {
        if (!input) return input;
        const parts = input.trim().split(/[\/\-\.\s]/).filter(Boolean);
        let year: string | undefined;
        let month: string | undefined;
        let day: string | undefined;
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            year = parts[0];
            month = parts[1];
            day = parts[2];
          } else if (parts[2].length === 4) {
            if (parseInt(parts[0], 10) > 12) {
              day = parts[0];
              month = parts[1];
              year = parts[2];
            } else {
              day = parts[0];
              month = parts[1];
              year = parts[2];
            }
          } else if (
            parts[0].length === 2 &&
            parts[1].length === 2 &&
            parts[2].length === 2
          ) {
            year = `20${parts[0]}`;
            month = parts[1];
            day = parts[2];
          } else {
            year = parts[0];
            month = parts[1];
            day = parts[2];
          }
        } else {
          const d = new Date(input);
          if (!isNaN(d.getTime())) {
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yyyy = String(d.getFullYear());
            return `${dd}-${mm}-${yyyy}`;
          }
          return input;
        }
        const dd = String(parseInt(day as string, 10)).padStart(2, "0");
        const mm = String(parseInt(month as string, 10)).padStart(2, "0");
        const yyyy = (year as string).length === 2
          ? parseInt(year as string, 10) >= 70
            ? `19${year}`
            : `20${year}`
          : (year as string);
        return `${dd}-${mm}-${yyyy}`;
      };
      // Handle Purchase Voucher form submission
      if (formData.purchaseVoucher && !formData.withholding) {
        const purchaseVoucherFormData = new FormData();
        purchaseVoucherFormData.append('purchase_recipt_number', formData.purchaseVoucher.purchaseReceiptNumber);
        purchaseVoucherFormData.append('supplier_name', formData.purchaseVoucher.supplierName);
        purchaseVoucherFormData.append('supplier_tin', formData.purchaseVoucher.supplierTIN);
        purchaseVoucherFormData.append('supplier_address', formData.purchaseVoucher.supplierAddress);
        purchaseVoucherFormData.append('date', formatToDDMMYYYY(formData.purchaseVoucher.date));
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
        setCountdown(3);
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
        setCountdown(5);
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
        purchaseVoucherFormData.append('date', formatToDDMMYYYY(formData.purchaseVoucher.date));
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
        setCountdown(5);
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
      {success && (
        <div className="text-green-700 bg-green-100 rounded px-3 py-2 text-center mb-2 font-semibold">
          {success}
          {countdown > 0 && (
            <div className="mt-2 text-sm text-green-600">
              Redirecting to user info page in {countdown} second{countdown !== 1 ? 's' : ''}...
            </div>
          )}
        </div>
      )}
    </>
  );
} 