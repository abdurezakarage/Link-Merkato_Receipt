export interface Item {
  glAccount: string;
  nature: string;
  hsCode: string;
  itemCode: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  unitOfMeasurement: string; // Unit of measurement (e.g., kg, pcs, etc.)
  category?: string; // Goods or Service
  reasonOfReceiving?: string; // New field for CRV and Other
  taxType?: string; // vat, tot, exempted for mixed receipts
  declarationNumber?: string; // Declaration number for import/export items
}

export interface SellerInfo {
  name: string;
  tin: string;
  address: string;
}

export interface BuyerInfo {
  name: string;
  tin: string;
  address: string;
}

export interface FormState {
  seller: SellerInfo;
  buyer: BuyerInfo;
  receiptKind: string;
  receiptNumber: string;
  // Present only for Electronic/Digital receipts
  machineNumber: string;
  receiptDate: string;
  receiptType: string;
  receiptName: string;
  calendarType: string;
  receiptCategory: string;
  paymentMethod: string;
  bankName?: string;
  itemType: string; // good or service
  hasImportExport: string; // yes or no for import/export related items
  items: Item[];
}

export interface WithholdingForm {
  receiptNumber: string;
  receiptDate: string;
  transactionType: string;
  subTotal: number;
  taxWithholdingAmount: number;
  salesInvoiceNumber: string;
  document: File | null;
}

export interface UserRegistration {
  username: string;
  password: string;
}

export interface CompanyRegistration {
  tin_number: string;
  company_name: string;
  email: string;
  address: string;
}

export interface RegisterFormState extends UserRegistration, CompanyRegistration {}

// types for authentication context
export interface User {
  id: string;
  username: string;
  company: {
    tin_number: string;
    company_name: string;
    email: string;
    address: string;
  };
  is_company_created?: boolean;
  roles?: string[]; // Array of user roles for access control
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export interface LoginResponse {
  token?: string;
  access_token?: string;
  access?: string;
  refresh?: string;
  user?: User;
}

export interface JWTToken {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: string;
  is_company_created?: boolean;
}

// Receipt Kinds API Response Types
export interface ReceiptKind {
  id: number;
  name: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ReceiptKindsResponse extends PaginatedResponse<ReceiptKind> {}

// Company API Response Types
export interface CompanyData {
  tin_number: string;
  company_name: string;
  company_email: string;
  company_address: string;
  created_by_username: string;
}

export interface CompaniesResponse extends PaginatedResponse<CompanyData> {}

// Receipt API Response Types
export interface ReceiptItem {
  id: number;
  item: {
    item_code: string;
    item_description: string;
    unit_of_measurement: string;
    gl_account: string;
    nature: string;
    tax_type: string;
    unit_cost: string;
  };
  quantity: string;
  unit_cost: string;
  tax_type: string;
  tax_amount: string;
  discount_amount: string;
  subtotal: number;
  total_after_tax: number;
}

export interface IssuedByDetails {
  id: number;
  name: string;
  tin_number: string;
  address: string;
}

export interface IssuedToDetails {
  id: number;
  name: string;
  tin_number: string;
  address: string;
}

export interface DocumentInfo {
  file: string;
  filename: string;
  content_type: string;
  uploaded_at: string;
  receipt_number: string;
}

export interface ReceiptDocuments {
  main_receipt?: DocumentInfo;
  withholding_receipt?: DocumentInfo;
}

export interface ReceiptData {
  id: number;
  receipt_number: string;
  receipt_date: string;
  calendar_type: string;
  issued_by_details: IssuedByDetails;
  issued_to_details: IssuedToDetails;
  receipt_category_id: number;
  receipt_kind_id: number;
  receipt_type_id: number;
  receipt_name_id: number;
  receipt_category?: string;
  receipt_kind?: string;
  receipt_type?: string;
  receipt_name?: string;
  is_withholding_applicable: boolean;
  payment_method_type: string;
  bank_name: string;
  items: ReceiptItem[];
  purchase_recipt_number: string | null;
  withholding_receipt_number: string | null;
  reason_of_receiving: string | null;
  created_at: string;
  updated_at: string;
  subtotal: string;
  tax: string;
  total: string;
  withholding_amount: string;
  net_payable_to_supplier: string;
  documents?: ReceiptDocuments;
}

export interface ReceiptResponse {
  success: boolean;
  data: ReceiptData;
}

// Form Report API Response Types (for multiple receipts)
export interface FormReportResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ReceiptData[];
}
