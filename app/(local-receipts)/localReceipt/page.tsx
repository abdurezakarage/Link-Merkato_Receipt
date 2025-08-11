
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import type { Item, SellerInfo, BuyerInfo, FormState, WithholdingForm, ReceiptKind, ReceiptKindsResponse } from "../local-data-forms/types";
import SellerForm from "../local-data-forms/Company/SellerForm";
import BuyerForm from "../local-data-forms/Company/BuyerForm";
import ItemTable from "../local-data-forms/local_Receipt_Forms/ItemTable";
import WithholdingFormComponent from "../local-data-forms/local_Receipt_Forms/WithholdingForm";
import NoReceiptMode from "../local-data-forms/local_Receipt_Forms/NoReceiptMode";
import ReceiptDetailsForm from "../local-data-forms/local_Receipt_Forms/ReceiptDetailsForm";
import ProtectedRoute from "../../Context/ProtectedRoute";
import { useAuth } from "../../Context/AuthContext";
import FileUpload from "../local-data-forms/local_Receipt_Forms/FileUpload";
import Sidebar from "../local-data-forms/local_Receipt_Forms/Sidebar";
import FormSection from "../local-data-forms/local_Receipt_Forms/FormSection";
import ModeSelector from "../local-data-forms/local_Receipt_Forms/ModeSelector";
import { DJANGO_BASE_URL } from "../api/api";
import { Rowdies } from "next/font/google";

// Static data arrays
const BANK_NAMES = [
  "Commercial Bank of Ethiopia",
  "Bank of Abyssinia", 
  "Dashen Bank",
  "Awash Bank",
  "United Bank",
  "Hibret Bank",
  "Lion Bank",
  "Cooperative Bank of Oromia",
  "Development Bank of Ethiopia",
  "National Bank of Ethiopia"
];

const PAYMENT_METHODS = ["Cash", "Bank"];

export default function LocalReceipt() {
  const { user, logout, token, isLoading } = useAuth();
  
  // Token validation function
  const isTokenValid = useCallback(() => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (e) {
      return false;
    }
  }, [token]);
  
  const [form, setForm] = useState<FormState>({
    seller: { name: '', tin: '', address: '' },
    buyer: { name: '', tin: '', address: '' },
    receiptKind: '',
    receiptNumber: '',
    receiptDate: '',
    receiptType: '',
    receiptName: '',
    calendarType: '',
    receiptCategory: '',
    paymentMethod: '',
    bankName: '',
    itemType: '',
    hasImportExport: '',
    items: [{ glAccount: '', nature: '', hsCode: '', itemCode: '', description: '', quantity: 1, unitCost: 0, totalCost: 0, unitOfMeasurement: '', category: '', reasonOfReceiving: '', taxType: '', declarationNumber: '' }],
  });
  const [MainReceipt, setMainReceipt] = useState<File | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [noReceiptMode, setNoReceiptMode] = useState(false);
  const [withholdingRequired, setWithholdingRequired] = useState<string>(''); 
  const [withholdingForm, setWithholdingForm] = useState<WithholdingForm>({
    receiptNumber: '',
    receiptDate: '',
    transactionType: '',
    subTotal: 0,
    taxWithholdingAmount: 0,
    salesInvoiceNumber: '',
    document: null,
  });
  const [receiptKinds, setReceiptKinds] = useState<string[]>([]);
  const [receiptNames, setReceiptNames] = useState<string[]>([]);
  const [receiptCategories, setReceiptCategories] = useState<string[]>([]);
  const [receiptTypes, setReceiptTypes] = useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(PAYMENT_METHODS);
  const [bankNames, setBankNames] = useState<string[]>(BANK_NAMES);
  
  // Store the full objects with IDs for backend submission
  const [receiptKindsData, setReceiptKindsData] = useState<any[]>([]);
  const [receiptNamesData, setReceiptNamesData] = useState<any[]>([]);
  const [receiptCategoriesData, setReceiptCategoriesData] = useState<any[]>([]);
  const [receiptTypesData, setReceiptTypesData] = useState<any[]>([]);
  


  // Sidebar and form section management
  const [activeSection, setActiveSection] = useState('receipt-details');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed, will be set by useEffect
  const [formProgress, setFormProgress] = useState({
    seller: false,
    buyer: false,
    receiptDetails: false,
    items: false,
    payment: false,
    withholding: false
  });

  // Debug logging
  useEffect(() => {
    console.log('LocalReceipt auth state:', { 
      hasUser: !!user, 
      hasToken: !!token, 
      isLoading,
      tokenValid: isTokenValid(),
      tokenValue: token ? `${token.substring(0, 20)}...` : 'no token'
    });
  }, [user, token, isLoading, isTokenValid]);

  // Handle section change for both receipt and no-receipt modes
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    
    // If switching to no-receipt mode sections, ensure noReceiptMode is true
    if (section === 'purchase-voucher' || section === 'withholding-30') {
      setNoReceiptMode(true);
    }
    
    // If switching to receipt mode sections, ensure noReceiptMode is false
    if (section === 'receipt-details' || section === 'seller-buyer' || section === 'items' || section === 'payment' || section === 'withholding') {
      setNoReceiptMode(false);
    }
  };

  // Update section when mode changes
  useEffect(() => {
    if (noReceiptMode && (activeSection === 'receipt-details' || activeSection === 'seller-buyer' || activeSection === 'items' || activeSection === 'payment' || activeSection === 'withholding')) {
      setActiveSection('purchase-voucher');
    } else if (!noReceiptMode && (activeSection === 'purchase-voucher' || activeSection === 'withholding-30')) {
      setActiveSection('receipt-details');
    }
  }, [noReceiptMode, activeSection]);


  // Memoized setter functions to prevent infinite re-renders
  const setSeller = useCallback((seller: SellerInfo) => {
    setForm(f => ({ ...f, seller }));
  }, []);

  const setBuyer = useCallback((buyer: BuyerInfo) => {
    setForm(f => ({ ...f, buyer }));
  }, []);



  // Fetch receipt categories
  useEffect(() => {
    if (!token || !isTokenValid()) return; 
    
    const fetchReceiptCategories = async () => {
      try {
        const res = await axios.get(`${DJANGO_BASE_URL}/receipt-categories`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.data && res.data.results && Array.isArray(res.data.results)) {
          // Store the full data objects
          setReceiptCategoriesData(res.data.results);
          // Extract the name field from each category object
          const categoryNames = res.data.results.map((category: any) => category.name);
          setReceiptCategories(categoryNames);
        }
      } catch (err: any) {
        console.error('Error fetching receipt categories:', err);
      }
    };
    fetchReceiptCategories();
  }, [token, isTokenValid]);

  // Fetch receipt types
  useEffect(() => {
    if (!token || !isTokenValid()) return; // Don't make API calls if no token
    
    const fetchReceiptTypes = async () => {
      try {
        const res = await axios.get(`${DJANGO_BASE_URL}/receipt-types`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.data && res.data.results && Array.isArray(res.data.results)) {
          // Store the full data objects
          setReceiptTypesData(res.data.results);
          // Extract the name field from each category object
          const receiptTypes = res.data.results.map((receiptType: any) => receiptType.name);
          setReceiptTypes(receiptTypes);
        } 
      } catch (err: any) {
        console.error('Error fetching receipt types:', err);
        if (err.response?.status === 401) {
          console.log('Receipt types API returned 401');
        }
      }
    };
    fetchReceiptTypes();
  }, [token, isTokenValid]);

  // Fetch receipt kinds
  useEffect(() => {
    if (!token || !isTokenValid()) return; // Don't make API calls if no token
    
    const fetchReceiptKinds = async () => {
      try {
        const res = await axios.get<ReceiptKindsResponse>(`${DJANGO_BASE_URL}/receipt-kinds`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }); 
        if (res.data && res.data.results && Array.isArray(res.data.results)) {
          // Store the full data objects
          setReceiptKindsData(res.data.results);
          const receiptKinds = res.data.results.map((receiptKind: any) => receiptKind.name);
          setReceiptKinds(receiptKinds);
        }
      } catch (err: any) {
        console.error('Error fetching receipt kinds:', err);
        if (err.response?.status === 401) {
          console.log('Receipt kinds API returned 401');
        }
      }
    };
    fetchReceiptKinds();
  }, [token, isTokenValid]);

  // Fetch receipt names
  useEffect(() => {
    if (!token || !isTokenValid()) return; // Don't make API calls if no token
    
    const fetchReceiptNames = async () => {
      try {
        const res = await axios.get(`${DJANGO_BASE_URL}/receipt-names`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.data && res.data.results && Array.isArray(res.data.results)) {
          // Store the full data objects
          setReceiptNamesData(res.data.results);
          // Extract the name field from each category object
          const receiptNames = res.data.results.map((receiptName: any) => receiptName.name);
          setReceiptNames(receiptNames);
        }
      } catch (err: any) {
        console.error('Error fetching receipt names:', err);
        if (err.response?.status === 401) {
          console.log('Receipt names API returned 401');
        }
      }
    };
    fetchReceiptNames();
  }, [token, isTokenValid]);





  // Reset withholding form when receipt category changes to CRV
  useEffect(() => {
    if (form.receiptCategory === 'Crv') {
      setWithholdingRequired('');
      setWithholdingForm({
        receiptNumber: '',
        receiptDate: '',
        transactionType: '',
        subTotal: 0,
        taxWithholdingAmount: 0,
        salesInvoiceNumber: '',
        document: null,
      });
    }
  }, [form.receiptCategory]);



  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle item changes
  const handleItemChange = (idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const items = [...prev.items];
      
      // Handle string fields
      if (['glAccount', 'nature', 'hsCode', 'itemCode', 'description', 'category', 'reasonOfReceiving', 'taxType', 'unitOfMeasurement', 'declarationNumber'].includes(name)) {
        (items[idx] as any)[name] = value;
      } 
      // Handle numeric fields
      else if (name === 'unitCost') {
        const numericValue = value === '' ? 0 : parseFloat(value) || 0;
        items[idx].unitCost = numericValue;
      } 
      else if (name === 'quantity') {
        const numericValue = value === '' ? 0 : parseInt(value) || 0;
        items[idx].quantity = numericValue;
      }
      
      // Calculate totalCost based on receipt category
      if (prev.receiptCategory === 'Crv') {
        // For CRV, the amount (unitCost) is directly the total cost
        items[idx].totalCost = items[idx].unitCost || 0;
      } else {
        // For other categories, calculate as quantity * unitCost
        items[idx].totalCost = (items[idx].quantity || 0) * (items[idx].unitCost || 0);
      }
      
      return { ...prev, items };
    });
  };

  // Add new item row
  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { glAccount: '', nature: '', hsCode: '', itemCode: '', description: '', quantity: 1, unitCost: 0, totalCost: 0, unitOfMeasurement: '', category: '', reasonOfReceiving: '', taxType: '', declarationNumber: '' }],
    }));
  };

  // Remove item row
  const removeItem = (idx: number) => {
    setForm((prev) => {
      const items = prev.items.filter((_, i) => i !== idx);
      return { ...prev, items };
    });
  };

  // Handle main receipt upload
  const handleMainReceiptChange = useCallback((file: File | null) => {
    setMainReceipt(file);
  }, []);

  // Handle attachment upload
  const handleAttachmentChange = useCallback((file: File | null) => {
    setAttachment(file);
  }, []);

  // Calculate totals with tax logic
  const subTotal = form.items.reduce((sum, item) => sum + item.totalCost, 0);
  
  // Tax calculation based on Receipt Name and item type
  const calculateTax = () => {
    // No tax calculation for CRV
    if (form.receiptCategory === 'Crv') {
      return 0;
    }
    
    if (form.receiptName === 'VAT') {
      return subTotal * 0.15; // 15% VAT
    } else if (form.receiptName === 'EXEMPTED') {
      return 0; // No tax for exempted
    } else if (form.receiptName === 'TOT') {
      if (form.itemType === 'goods') {
        return subTotal * 0.02; // 2% TOT for goods
      } else if (form.itemType === 'service') {
        return subTotal * 0.1; // 10% TOT for services
      }
    } else if (form.receiptName === 'MIXED') {
      // For mixed receipts, calculate tax based on each item's tax type
      return form.items.reduce((totalTax, item) => {
        if (item.taxType === 'VAT') {
          return totalTax + (item.totalCost * 0.15);
        } else if (item.taxType === 'TOT') {
          if (form.itemType === 'goods') {
            return totalTax + (item.totalCost * 0.02);
          } else if (form.itemType === 'service') {
            return totalTax + (item.totalCost * 0.1);
          }
        } else if (item.taxType === 'EXEMPTED') {
          return totalTax; // No tax for exempted items
        }
        return totalTax;
      }, 0);
    }
    return 0; // Default case
  };
  
  const tax = calculateTax();

  // Withholding logic - CRV receipts don't have withholding
  const shouldShowWithholdingDropdown =
    (form.receiptCategory === 'Revenue' || form.receiptCategory === 'Expense' || form.receiptCategory === 'Other' || form.receiptCategory === 'Buyer') &&
    form.receiptName && form.itemType &&
    ((form.itemType === 'goods' && subTotal > 20000) || (form.itemType === 'service' && subTotal > 10000));

  // Check if all required fields are completed (excluding withholding for now)
  const isFormComplete: boolean = useMemo(() => {
   
    
    // Check receipt details
    const receiptDetailsComplete = Boolean(form.receiptCategory && form.receiptType && form.receiptKind && form.receiptName && form.receiptNumber && form.receiptDate && form.calendarType);
     // Check seller info
     const sellerComplete = Boolean(form.seller.name && form.seller.tin && form.seller.address);
    
     // Check buyer info
     const buyerComplete = Boolean(form.buyer.name && form.buyer.tin && form.buyer.address);
    // Check items (only required for certain receipt categories)
    const itemsComplete = (form.receiptCategory === 'Revenue' || form.receiptCategory === 'Expense' || form.receiptCategory === 'Other' || form.receiptCategory === 'Buyer') 
      ? Boolean(form.itemType && form.items.length > 0 && form.items.every(item => Boolean(item.description && item.totalCost > 0)))
      : true;
    
    // Check payment info
    
    const paymentComplete = Boolean(form.paymentMethod && (form.paymentMethod.toLowerCase().includes('bank') ? form.bankName : true));
    
    return sellerComplete && buyerComplete && receiptDetailsComplete && itemsComplete && paymentComplete;
  }, [form]);

  // Check if withholding is complete (if required)
  const isWithholdingComplete: boolean = useMemo(() => {
    if (!shouldShowWithholdingDropdown) return true; // Not applicable
    if (withholdingRequired === 'no') return true; // User selected no
    if (withholdingRequired === 'yes') {
      return Boolean(withholdingForm.receiptNumber && withholdingForm.receiptDate && withholdingForm.transactionType);
    }
    return false; // User hasn't made selection yet
  }, [shouldShowWithholdingDropdown, withholdingRequired, withholdingForm]);

  // Determine when to show submit button
  const shouldShowSubmitButton: boolean = useMemo(() => {
    if (!isFormComplete) return false;
    
    // If withholding is not applicable, show submit button
    if (!shouldShowWithholdingDropdown) return true;
    
    // If withholding is applicable, show after user makes selection
    if (withholdingRequired === 'no') return true; // User selected no
    if (withholdingRequired === 'yes') return true; // User selected yes - show button even if form not complete
    
    return false; // User hasn't made selection yet
  }, [isFormComplete, shouldShowWithholdingDropdown, withholdingRequired]);

  // Update form progress based on form state
  const updateFormProgress = useCallback(() => {
    setFormProgress({
      seller: !!(form.seller.name && form.seller.tin && form.seller.address),
      buyer: !!(form.buyer.name && form.buyer.tin && form.buyer.address),
      receiptDetails: !!(form.receiptCategory && form.receiptType && form.receiptKind && form.receiptName && form.receiptNumber && form.receiptDate && form.calendarType),
      items: (form.receiptCategory === 'Revenue' || form.receiptCategory === 'Expense' || form.receiptCategory === 'Crv' || form.receiptCategory === 'Other' || form.receiptCategory === 'Buyer') 
        ? !!(form.hasImportExport && form.itemType && form.items.length > 0 && form.items.every(item => {
            const basicValidation = item.description && item.totalCost > 0;
            // If import/export is yes, declaration number is required
            if (form.hasImportExport === 'yes') {
              return basicValidation && item.declarationNumber;
            }
            return basicValidation;
          }))
        : true,
      payment: !!(form.paymentMethod && (form.paymentMethod.toLowerCase().includes('bank') ? form.bankName : true)),
      withholding: isWithholdingComplete
    });
  }, [form, isWithholdingComplete]);



  // Manual navigation functions
  const goToNextSection = () => {
    const sectionOrder = ['receipt-details', 'seller-buyer', 'items', 'payment', 'withholding'];
    const currentIndex = sectionOrder.indexOf(activeSection);
    if (currentIndex < sectionOrder.length - 1) {
      setActiveSection(sectionOrder[currentIndex + 1]);
    }
  };

  const goToPreviousSection = () => {
    const sectionOrder = ['receipt-details', 'seller-buyer', 'items', 'payment', 'withholding'];
    const currentIndex = sectionOrder.indexOf(activeSection);
    if (currentIndex > 0) {
      setActiveSection(sectionOrder[currentIndex - 1]);
    }
  };

  // Check if current section is completed
  const isCurrentSectionCompleted = () => {
    switch (activeSection) {
      case 'seller-buyer':
        return formProgress.seller && formProgress.buyer;
      case 'receipt-details':
        return formProgress.receiptDetails;
      case 'items':
        return (form.receiptCategory === 'Revenue' || form.receiptCategory === 'Expense' || form.receiptCategory === 'Crv' || form.receiptCategory === 'Other' || form.receiptCategory === 'Buyer') 
          ? formProgress.items 
          : true;
      case 'payment':
        return formProgress.payment;
      case 'withholding':
        return formProgress.withholding;
      default:
        return false;
    }
  };

  // Update progress whenever form changes
  useEffect(() => {
    updateFormProgress();
  }, [updateFormProgress]);



  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // On desktop, keep sidebar open by default
        setSidebarOpen(true);
      } else {
        // On mobile, close sidebar by default
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Withholding form handlers
  const handleWithholdingChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWithholdingForm((prev) => ({
      ...prev,
      [name]: name === 'subTotal' || name === 'taxWithholdingAmount' ? Number(value) : value,
    }));
  }, []);
  
  const handleWithholdingFile = useCallback((file: File | null) => {
    setWithholdingForm((prev) => ({ ...prev, document: file }));
  }, []);

  // Auto-populate withholding form when it becomes active
  useEffect(() => {
    if (withholdingRequired === 'yes') {
      setWithholdingForm(prev => ({
        ...prev,
        salesInvoiceNumber: form.receiptNumber,
        subTotal: subTotal,
        taxWithholdingAmount: subTotal * 0.03, // 3% withholding
      }));
    }
  }, [withholdingRequired, form.receiptNumber, subTotal]);

  // Helper functions to find IDs by name
  const findIdByName = (dataArray: any[], name: string, fieldName: string = 'name'): number | null => {
    const item = dataArray.find(item => item[fieldName] === name);
    return item ? item.id : null;
  };
  // Handle form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check for required fields
    const missingFields = [];
    if (!form.seller.name) missingFields.push('Seller Name');
    if (!form.seller.tin) missingFields.push('Seller TIN');
    if (!form.seller.address) missingFields.push('Seller Address');
    if (!form.buyer.name) missingFields.push('Buyer Name');
    if (!form.buyer.tin) missingFields.push('Buyer TIN');
    if (!form.buyer.address) missingFields.push('Buyer Address');
    if (!form.receiptCategory) missingFields.push('Receipt Category');
    if (!form.receiptType) missingFields.push('Receipt Type');
    if (!form.receiptKind) missingFields.push('Receipt Kind');
    if (!form.receiptName) missingFields.push('Receipt Name');
    if (!form.receiptNumber) missingFields.push('Receipt Number');
    if (!form.calendarType) missingFields.push('Calendar Type');
    if (!form.receiptDate) missingFields.push('Receipt Date');
    if (!form.paymentMethod) missingFields.push('Payment Method');
    
    // Check if items are required and filled
    if ((form.receiptCategory === 'Revenue' || form.receiptCategory === 'Expense' || form.receiptCategory === 'Other' || form.receiptCategory === 'Buyer') && 
        (!form.itemType || form.items.length === 0 || form.items.some(item => !item.description || item.totalCost === 0))) {
      missingFields.push('Item details (description and amount required)');
    }
    
    // Check if bank name is required for bank payment
    if (form.paymentMethod && form.paymentMethod.toLowerCase().includes('bank') && !form.bankName) {
      missingFields.push('Bank Name (required for bank payment)');
    }
    
    // Check if withholding form is required and filled
    if (shouldShowWithholdingDropdown && withholdingRequired === 'yes') {
      if (!withholdingForm.receiptNumber) missingFields.push('Withholding Receipt Number');
      if (!withholdingForm.receiptDate) missingFields.push('Withholding Receipt Date');
      if (!withholdingForm.transactionType) missingFields.push('Withholding Transaction Type');
    }
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setSubmitting(false);
      return;
    }
    
    setSubmitting(true);
    setError("");
    setSuccess("");
    
    try {
      // Validate that all required IDs are found
      const categoryId = findIdByName(receiptCategoriesData, form.receiptCategory);
      const kindId = findIdByName(receiptKindsData, form.receiptKind);
      const typeId = findIdByName(receiptTypesData, form.receiptType);
      const nameId = findIdByName(receiptNamesData, form.receiptName);


      // Build dynamic error message for missing data
      const missingData = [];
      if (!categoryId) missingData.push(`Receipt Category: "${form.receiptCategory}"`);
      if (!kindId) missingData.push(`Receipt Kind: "${form.receiptKind}"`);
      if (!typeId) missingData.push(`Receipt Type: "${form.receiptType}"`);
      if (!nameId) missingData.push(`Receipt Name: "${form.receiptName}"`);

      if (missingData.length > 0) {
        setError(`The following data could not be found: ${missingData.join(', ')}. Please refresh the page and try again.`);
        setSubmitting(false);
        return;
      }

      // Prepare items data
      let itemsData = null;
      if (form.items && form.items.length > 0) {
        itemsData = form.items.map(item => {
          // Determine tax type based on receipt name if not MIXED
          let taxType = item.taxType;
          if (form.receiptName !== 'MIXED') {
            if (form.receiptName === 'VAT') {
              taxType = 'VAT';
            } else if (form.receiptName === 'TOT') {
              taxType = 'TOT';
            } else if (form.receiptName === 'EXEMPTED') {
              taxType = 'EXEMPTED';
            }
          }
          
          return {
            gl_account: item.glAccount,
            nature: item.nature,
            hs_code: item.hsCode,
            item_code: item.itemCode,
            item_type: form.itemType,
            tax_type: taxType,
            has_import_export: form.hasImportExport,
            declaration_number: item.declarationNumber,
            item_description: item.description,
            unit_of_measurement: item.unitOfMeasurement,
            unit_cost: item.unitCost,
            quantity: item.quantity,
          };
        });
      }
// prepare file upload for main receipt and attachment
     // Use state variables directly
     const mainReceiptFile = MainReceipt;
     const attachmentFile = attachment;
      // Prepare withholding data if applicable
      let withholdingData = null;
      if (shouldShowWithholdingDropdown && withholdingRequired === 'yes') {
        withholdingData = {
          withholding_receipt_number: withholdingForm.receiptNumber,
          withholding_receipt_date: withholdingForm.receiptDate,
          transaction_description: withholdingForm.transactionType,
          sub_total: withholdingForm.subTotal,
          tax_withholding_amount: withholdingForm.taxWithholdingAmount,
          sales_invoice_number: withholdingForm.salesInvoiceNumber,
          buyer_tin: form.buyer.tin,
          seller_tin: form.seller.tin,
          main_receipt_number: form.receiptNumber,
        };
      }

      // Create the complete receipt payload
      const receiptPayload: any = {
        issued_by_details: {
          name: form.seller.name,
          tin_number: form.seller.tin,
          address: form.seller.address
        },
        issued_to_details: {
          name: form.buyer.name,
          tin_number: form.buyer.tin,
          address: form.buyer.address
        },
        receipt_number: form.receiptNumber,
        receipt_date: form.receiptDate,
        calendar_type: form.calendarType,
        receipt_category_id: categoryId,
        receipt_kind_id: kindId,
        receipt_type_id: typeId,
        receipt_name_id: nameId,
        is_withholding_applicable: withholdingRequired || "no",
        payment_method_type: form.paymentMethod,
        bank_name: form.bankName || "",
        items: itemsData || []
      };
    

      // Add withholding data if present
      if (withholdingData) {
        receiptPayload.withholding_data = withholdingData;
      }

      // Make single consolidated API call
      const response = await axios.post(`${DJANGO_BASE_URL}/create-receipt`, receiptPayload, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      
      // Handle file uploads if present
      if (MainReceipt || attachment || withholdingForm.document) {
        try { 
          const fileFormData = new FormData();
          
          if (MainReceipt) {
            fileFormData.append("main_receipt_data.receipt_number", form.receiptNumber);
            fileFormData.append("main_receipt_data.main_receipt", MainReceipt);
            fileFormData.append("main_receipt_data.main_receipt_filename", MainReceipt.name);
            fileFormData.append("main_receipt_data.main_receipt_content_type", MainReceipt.type);
          }
          
          if (attachment) {
            fileFormData.append("main_receipt_data.attachment", attachment);
            fileFormData.append("main_receipt_data.attachment_filename", attachment.name);
            fileFormData.append("main_receipt_data.attachment_content_type", attachment.type);
          }
          if (withholdingForm.document) {
            fileFormData.append("withholding_receipt_data.withholding_receipt_number", withholdingForm.receiptNumber);
            fileFormData.append("withholding_receipt_data.withholding_receipt", withholdingForm.document);
            fileFormData.append("withholding_receipt_data.withholding_receipt_filename", withholdingForm.document.name);
            fileFormData.append("withholding_receipt_data.withholding_receipt_content_type", withholdingForm.document.type);
          }
        
          for (let [key, value] of fileFormData.entries()) {
          }
          
          const uploadResponse = await axios.post(`${DJANGO_BASE_URL}/upload-receipt-documents`, fileFormData, {
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "multipart/form-data"
            },
          });
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          setError("Receipt submitted successfully, but failed to upload documents. Please try again.");
          setSubmitting(false);
          return;
        }
      } else {
        console.log('No files to upload');
      }


      // Handle success
      setSuccess("Receipt submitted successfully!");
      setForm({
        seller: { name: '', tin: '', address: '' },
        buyer: { name: '', tin: '', address: '' },
        receiptKind: '',
        receiptNumber: '',
        receiptDate: '',
        receiptType: '',
        receiptName: '',
        calendarType: '',
        receiptCategory: '',
        paymentMethod: '',
        bankName: '',
        itemType: '',
        hasImportExport: '',
        items: [{ glAccount: '', nature: '', hsCode: '', itemCode: '', description: '', quantity: 1, unitCost: 0, totalCost: 0, unitOfMeasurement: '', category: '', reasonOfReceiving: '', taxType: '', declarationNumber: '' }],
      });
      setMainReceipt(null);
      setAttachment(null);
      setWithholdingRequired('');
      setWithholdingForm({
        receiptNumber: '',
        receiptDate: '',
        transactionType: '',
        subTotal: 0,
        taxWithholdingAmount: 0,
        salesInvoiceNumber: '',
        document: null,
      });

    } catch (err) {
      console.error('Submission error:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        response: (err as any)?.response?.data,
        status: (err as any)?.response?.status,
        statusText: (err as any)?.response?.statusText
      });
      setError("Failed to submit receipt. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };



  return (
   <ProtectedRoute>
    <div className="flex-1 bg-gray-50 flex flex-col w-full">
      {/* Show loading state while auth is initializing */}
      {isLoading && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7faff] to-[#f3f6fd]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading receipt form...</p>
          </div>
        </div>
      )}
      
      {/* Only render the form when not loading */}
      {!isLoading && (
        <>
          {/* <Navigation /> */}
                {/* Main Layout with Sidebar */}
          <div className="flex flex-1 w-full relative">
            {/* Sidebar */}
            <Sidebar
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              formProgress={formProgress}
              isFormComplete={shouldShowSubmitButton}
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
              noReceiptMode={noReceiptMode}
              setNoReceiptMode={setNoReceiptMode}
            />
            {/* Main Content */}
            <div className={`flex-1 p-4 lg:p-6 transition-all duration-300 lg:relative lg:overflow-y-auto ${!sidebarOpen ? 'lg:ml-0' : ''}`}>
              {/* Floating toggle button when sidebar is collapsed on desktop */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="fixed top-20 left-4 z-40 hidden lg:flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                  title="Show Sidebar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              
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
              <form onSubmit={(e) => {
                handleSubmit(e);
              }}>
                <div className="w-full max-w-7xl mx-auto">
                  {/* Header with title */}
                  {/* <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl lg:text-3xl font-bold text-gray-800">Receipt Entry</span>
                    </div>
                    <div className="flex items-center gap-4">
                
                    </div>
                  </div> */}



                  {/* NO RECEIPT MODE: Only show Purchase Voucher and 30% withholding forms */}
                  {noReceiptMode ? (
                    <NoReceiptMode token={token} activeSection={activeSection} />
                  ) : (
                    <>
                    

                      {/* Receipt Details Section */}
                      <FormSection
                        title="Receipt Details"
                        description="Configure receipt type, category, and basic information"
                        isActive={activeSection === 'receipt-details'}
                        isCompleted={formProgress.receiptDetails}
                      >
                        <ReceiptDetailsForm
                          form={form}
                          setForm={setForm}
                          receiptKinds={receiptKinds}
                          receiptNames={receiptNames}
                          receiptCategories={receiptCategories}
                          receiptTypes={receiptTypes}
                        />
                        
                        {/* Navigation Buttons */}
                        <div className="flex justify-end mt-8">
                          <button
                            type="button"
                            onClick={goToNextSection}
                            disabled={!isCurrentSectionCompleted()}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-w-[120px]"
                          >
                            Next →
                          </button>
                        </div>
                      </FormSection>

                      {/* Seller & Buyer Info Section */}
                      <FormSection
                        title="Seller & Buyer Information"
                        description="Enter company details for both seller and buyer"
                        isActive={activeSection === 'seller-buyer'}
                        isCompleted={formProgress.seller && formProgress.buyer}
                      >
                        <div className="flex flex-col md:flex-row gap-8">
                          <SellerForm 
                            seller={form.seller} 
                            setSeller={setSeller} 
                            shouldFetchCompanies={form.receiptCategory === 'Revenue' || form.receiptCategory === 'Crv' || form.receiptCategory === 'Other'}
                            allowOverride={true}
                          />
                          <BuyerForm 
                            buyer={form.buyer} 
                            setBuyer={setBuyer} 
                            shouldFetchCompanies={form.receiptCategory === 'Buyer' || form.receiptCategory === 'Expense'}
                            allowOverride={true}
                          />
                        </div>
                        
                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                          <button
                            type="button"
                            onClick={goToPreviousSection}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors min-w-[120px]"
                          >
                            ← Back
                          </button>
                          <button
                            type="button"
                            onClick={goToNextSection}
                            disabled={!isCurrentSectionCompleted()}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-w-[120px]"
                          >
                            Next →
                          </button>
                        </div>
                      </FormSection>
                      {/* Items Section */}
                      <FormSection
                        title="Items & Services"
                        description="Add items"
                        isActive={activeSection === 'items'}
                        isCompleted={formProgress.items}
                      >
                <div className="grid grid-cols-2 gap-4 mb-4">
                   <div className="flex items-center gap-5">
                     <label className="font-semibold text-gray-700">Does the receipt have import/export related items?</label>
                     <div className="flex items-center gap-4">
                       <label className="flex items-center gap-2 cursor-pointer">
                         <input
                           type="radio"
                           name="hasImportExport"
                           value="yes"
                           checked={form.hasImportExport === 'yes'}
                           onChange={e => setForm(f => ({ ...f, hasImportExport: e.target.value }))}
                           className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                           required
                         />
                         <span className="text-gray-700">Yes</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer">
                         <input
                           type="radio"
                           name="hasImportExport"
                           value="no"
                           checked={form.hasImportExport === 'no'}
                           onChange={e => setForm(f => ({ ...f, hasImportExport: e.target.value }))}
                           className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                           required
                         />
                         <span className="text-gray-700">No</span>
                       </label>
                     </div>
                   </div>
                  {/* Item Type Selection */}
                  {(form.receiptCategory === 'Revenue' || form.receiptCategory === 'Expense' || form.receiptCategory === 'Crv' || form.receiptCategory === 'Other' || form.receiptCategory === 'Buyer') && (
                    <div className="flex items-center gap-4">
                      <label className="font-semibold text-gray-700">Item Type*</label>
                      <select
                        className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 w-40"
                        name="itemType"
                        value={form.itemType}
                        onChange={e => setForm(f => ({ ...f, itemType: e.target.value }))}
                        required
                      >
                        <option value="">Select</option>
                        <option value="goods">Goods</option>
                        <option value="service">Service</option>
                      </select>
                    </div>
                  )}
                </div>

                        {/* Validation Message for Item Table */}
                        {(form.receiptCategory === 'Revenue' || form.receiptCategory === 'Expense' || form.receiptCategory === 'Crv' || form.receiptCategory === 'Other' || form.receiptCategory === 'Buyer') && 
                         (!form.receiptName || !form.itemType || !form.hasImportExport) && (
                          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span className="text-yellow-800 font-medium">
                                {!form.receiptName && !form.itemType && !form.hasImportExport
                                  ? "Please select Receipt Name, Item Type, and Import/Export status to proceed with item entry."
                                  : !form.receiptName && !form.itemType
                                  ? "Please select Receipt Name and Item Type to proceed with item entry."
                                  : !form.receiptName && !form.hasImportExport
                                  ? "Please select Receipt Name and Import/Export status to proceed with item entry."
                                  : !form.itemType && !form.hasImportExport
                                  ? "Please select Item Type and Import/Export status to proceed with item entry."
                                  : !form.receiptName 
                                  ? "Please select Receipt Name to proceed with item entry."
                                  : !form.itemType
                                  ? "Please select Item Type to proceed with item entry."
                                  : "Please select Import/Export status to proceed with item entry."
                                }
                              </span>
                            </div>
                            
                          </div>
                        )}

                        {/* Item Management Table */}
                        {(form.receiptCategory === 'Revenue' || form.receiptCategory === 'Expense' || form.receiptCategory === 'Crv' || form.receiptCategory === 'Other' || form.receiptCategory === 'Buyer') && 
                         form.receiptName && form.itemType && form.hasImportExport && (
                          <ItemTable
                            items={form.items}
                            handleItemChange={handleItemChange}
                            addItem={addItem}
                            removeItem={removeItem}
                            receiptCategory={form.receiptCategory}
                            receiptName={form.receiptName}
                            itemType={form.itemType}
                            hasImportExport={form.hasImportExport}
                            subTotal={subTotal}
                            tax={tax}
                            total={subTotal + tax}
                          />
                        )}
                        
                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                          <button
                            type="button"
                            onClick={goToPreviousSection}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors min-w-[120px]"
                          >
                            ← Back
                          </button>
                          <button
                            type="button"
                            onClick={goToNextSection}
                            disabled={!isCurrentSectionCompleted()}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-w-[120px]"
                          >
                            Next →
                          </button>
                        </div>
                      </FormSection>
                   

                      {/* Payment & Documents Section */}
                      <FormSection
                        title="Payment & Documents"
                        description="Select payment method and upload documents"
                        isActive={activeSection === 'payment'}
                        isCompleted={formProgress.payment}
                      >
                        {/* Payment Method Section */}
                        <div className="flex flex-col md:flex-row gap-6 items-end">
                          <div className="flex flex-col">
                            <label className="mb-1 font-semibold text-gray-700">Payment Method</label>
                            <select className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 w-40" name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
                              <option value="">Select Payment Method</option>
                              {paymentMethods.map((method, index) => (
                                <option key={index} value={method}>{method}</option>
                              ))}
                            </select>
                          </div>
                          {form.paymentMethod && form.paymentMethod.toLowerCase().includes('bank') && (
                            <div className="flex flex-col">
                              <label className="mb-1 font-semibold text-gray-700">Bank Name</label>
                              <select 
                                className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 w-40" 
                                name="bankName" 
                                value={form.bankName} 
                                onChange={handleChange}
                              >
                                <option value="">Select Bank</option>
                                {bankNames.map((bankName, index) => (
                                  <option key={index} value={bankName}>{bankName}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>

                        {/* File Upload Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FileUpload
                            label="Upload Receipt"
                            accept="image/*,.pdf"
                            onChange={handleMainReceiptChange}
                            value={MainReceipt}
                            maxSize={10}
                            required={false}
                          />
                          <FileUpload
                            label="Upload Attachment"
                            accept="image/*,.pdf"
                            onChange={handleAttachmentChange}
                            value={attachment}
                            maxSize={10}
                            required={false}
                          />
                        </div>
                        
                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                          <button
                            type="button"
                            onClick={goToPreviousSection}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors min-w-[120px]"
                          >
                            ← Back
                          </button>
                          <button
                            type="button"
                            onClick={goToNextSection}
                            disabled={!isCurrentSectionCompleted()}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-w-[120px]"
                          >
                            Next →
                          </button>
                        </div>
                      </FormSection>

                      {/* Withholding Section */}
                      <FormSection
                        title="Withholding Details"
                        description="Configure withholding information if applicable"
                        isActive={activeSection === 'withholding'}
                        isCompleted={formProgress.withholding}
                      >
                        {shouldShowWithholdingDropdown && form.receiptName && form.itemType ? (
                          <>
                            <div className="flex items-center gap-4 mb-2">
                              <label className="font-semibold text-gray-700">Does the receipt has Withholding?</label>
                              <select
                                className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 w-32"
                                value={withholdingRequired}
                                onChange={e => setWithholdingRequired(e.target.value)}
                              >
                                <option value="">Select</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                              </select>
                            </div>
                            {withholdingRequired === 'yes' && (
                              <WithholdingFormComponent
                                withholdingForm={withholdingForm}
                                setWithholdingForm={setWithholdingForm}
                                subTotal={subTotal}
                                taxWithholdingAmount={subTotal * 0.03}
                                handleWithholdingChange={handleWithholdingChange}
                                handleWithholdingFile={handleWithholdingFile}
                                buyer={form.buyer}
                                seller={form.seller}
                              />
                            )}
                            
                            {/* Submit Button - Show after withholding selection */}
                            {shouldShowSubmitButton && (
                              <div className="flex justify-between mt-8">
                                <button
                                  type="button"
                                  onClick={goToPreviousSection}
                                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors min-w-[120px]"
                                >
                                  ← Back
                                </button>
                                <button 
                                  type="submit" 
                                  className="btn btn-success px-8 py-3 rounded-lg text-lg font-bold shadow transition hover:scale-105 disabled:opacity-60" 
                                  disabled={submitting}
                                  // onClick={() => console.log('Submit button clicked!')}
                                >
                                  {submitting ? "Submitting..." : "Submit Receipt"}
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-gray-600 text-sm">
                              Withholding is not applicable for this receipt type or the required fields are not filled.
                            </p>
                          </div>
                        )}
                        
                        {/* Submit Button - Show when withholding is not applicable */}
                        {!shouldShowWithholdingDropdown && shouldShowSubmitButton && (
                          <div className="flex justify-between mt-8">
                            <button
                              type="button"
                              onClick={goToPreviousSection}
                              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors min-w-[120px]"
                            >
                              ← Back
                            </button>
                            <button 
                              type="submit" 
                              className="btn btn-success px-8 py-3 rounded-lg text-lg font-bold shadow transition hover:scale-105 disabled:opacity-60" 
                              disabled={submitting}
                              // onClick={() => console.log('Submit button clicked!')}
                            >
                              {submitting ? "Submitting..." : "Submit Receipt"}
                            </button>
                          </div>
                        )}
                      </FormSection>


                      {/* Error and Success Messages */}
                      {error && <div className="text-red-600 bg-red-100 rounded px-3 py-2 text-center mb-2 font-semibold">{error}</div>}
                      {success && <div className="text-green-700 bg-green-100 rounded px-3 py-2 text-center mb-2 font-semibold">{success}</div>}
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>

        </>
      )}
    </div>
    </ProtectedRoute>
  );
}