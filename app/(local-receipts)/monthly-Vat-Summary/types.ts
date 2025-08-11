export interface MonthOption {
  value: string;
  label: string;
  monthNumber: number;
}

export interface NatureCodeMapping {
  [key: string]: {
    label: string;
    section: 'output' | 'capital' | 'nonCapital';
    lineNumber: number;
    vatType: 'output' | 'input';
    vatLineNumber?: number | null;
  };
}

export interface EditableValues {
  [natureCode: string]: {
    total: number;
    vat: number;
  };
}

export interface ManualAdjustments {
  vatOnGovernmentVoucher: number;
  otherCredits: number;
  creditCarriedForward: number;
}

export interface VATSummaryData {
  total: number;
  vat: number;
  count: number;
  receipts: import('../local-data-forms/types').ReceiptData[];
}

export interface SectionTotals {
  output: { total: number; vat: number; count: number };
  capital: { total: number; vat: number; count: number };
  nonCapital: { total: number; vat: number; count: number };
}
