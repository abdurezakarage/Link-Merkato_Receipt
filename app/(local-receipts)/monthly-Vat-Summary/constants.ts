import { NatureCodeMapping, MonthOption } from './types';

// Nature code mappings based on the VAT form structure
export const natureCodeMappings: NatureCodeMapping = {
  '5': {
    label: 'Taxable sales/Supplies',
    section: 'output',
    lineNumber: 5,
    vatType: 'output',
    vatLineNumber: 10
  },
  '15': {
    label: 'Zero-rated sales/supplies',
    section: 'output',
    lineNumber: 15,
    vatType: 'output',
    vatLineNumber: null
  },
  '20': {
    label: 'Tax-exempt sales/supplies',
    section: 'output',
    lineNumber: 20,
    vatType: 'output',
    vatLineNumber: null
  },
  '25': {
    label: 'Supplies subject to reverse taxation',
    section: 'output',
    lineNumber: 25,
    vatType: 'output',
    vatLineNumber: 30
  },
  '35': {
    label: 'Tax adjustment with debit note for suppliers',
    section: 'output',
    lineNumber: 35,
    vatType: 'output',
    vatLineNumber: 40
  },
  '45': {
    label: 'Tax adjustment with credit note for suppliers',
    section: 'output',
    lineNumber: 45,
    vatType: 'output',
    vatLineNumber: 50
  },
  '65': {
    label: 'Local purchase capital assets',
    section: 'capital',
    lineNumber: 65,
    vatType: 'input',
    vatLineNumber: 70
  },
  '75': {
    label: 'Imported capital assets purchase',
    section: 'capital',
    lineNumber: 75,
    vatType: 'input',
    vatLineNumber: 80
  },
  '85': {
    label: 'Purchase with no VAT or unclaimed inputs',
    section: 'capital',
    lineNumber: 85,
    vatType: 'input',
    vatLineNumber: null
  },
  '100': {
    label: 'Local purchase Inputs',
    section: 'nonCapital',
    lineNumber: 100,
    vatType: 'input',
    vatLineNumber: 105
  },
  '110': {
    label: 'Imported inputs purchase',
    section: 'nonCapital',
    lineNumber: 110,
    vatType: 'input',
    vatLineNumber: 115
  },
  '120': {
    label: 'General Expense Inputs purchase',
    section: 'nonCapital',
    lineNumber: 120,
    vatType: 'input',
    vatLineNumber: 125
  },
  '130': {
    label: 'Purchase with no VAT or unclaimed inputs',
    section: 'nonCapital',
    lineNumber: 130,
    vatType: 'input',
    vatLineNumber: null
  },
  '135': {
    label: 'Deductible on VAT reverse taxation',
    section: 'nonCapital',
    lineNumber: 135,
    vatType: 'input',
    vatLineNumber: 140
  },
  '145': {
    label: 'Tax adjustment with debit note for buyers',
    section: 'nonCapital',
    lineNumber: 145,
    vatType: 'input',
    vatLineNumber: 150
  },
  '155': {
    label: 'Tax adjustment with credit note for buyers',
    section: 'nonCapital',
    lineNumber: 155,
    vatType: 'input',
    vatLineNumber: 160
  }
};

// Month options
export const monthOptions: MonthOption[] = [
  { value: 'january', label: 'January', monthNumber: 1 },
  { value: 'february', label: 'February', monthNumber: 2 },
  { value: 'march', label: 'March', monthNumber: 3 },
  { value: 'april', label: 'April', monthNumber: 4 },
  { value: 'may', label: 'May', monthNumber: 5 },
  { value: 'june', label: 'June', monthNumber: 6 },
  { value: 'july', label: 'July', monthNumber: 7 },
  { value: 'august', label: 'August', monthNumber: 8 },
  { value: 'september', label: 'September', monthNumber: 9 },
  { value: 'october', label: 'October', monthNumber: 10 },
  { value: 'november', label: 'November', monthNumber: 11 },
  { value: 'december', label: 'December', monthNumber: 12 },
];

// Nature codes that should not include VAT in calculations
export const excludeVATCodes = ['15', '20', '85', '130'];

// Generate year options (current year and previous 5 years)
export const generateYearOptions = (): number[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => currentYear - i);
};
