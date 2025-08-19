import React from "react";
import { ReceiptKind } from "../types";

interface ReceiptDetailsFormProps {
  form: any; // Replace 'any' with the correct FormState type
  setForm: (updater: (prev: any) => any) => void;
  receiptKinds: string[];
  receiptNames: string[];
  receiptCategories: string[];
  receiptTypes: string[];
  receiptNumberExists: boolean | null;
  checkingReceiptNumber: boolean;
  errors?: Partial<Record<'receiptCategory'|'receiptType'|'receiptKind'|'receiptName'|'receiptNumber'|'calendarType'|'receiptDate', string>>;
}

const ReceiptDetailsForm: React.FC<ReceiptDetailsFormProps> = ({ 
  form, 
  setForm, 
  receiptKinds, 
  receiptNames, 
  receiptCategories, 
  receiptTypes,
  receiptNumberExists,
  checkingReceiptNumber,
  errors = {}
}) => {
  
  // Function to get prefix based on receipt kind
  const getReceiptNumberPrefix = (receiptKind: string) => {
    switch (receiptKind.toLowerCase()) {
      case 'manual':
        return 'M';
      case 'electronic':
        return 'FS';
      case 'digital':
        return 'POS';
      default:
        return '';
    }
  };

  // Function to handle receipt kind change
  const handleReceiptKindChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newReceiptKind = e.target.value;
    const prefix = getReceiptNumberPrefix(newReceiptKind);
    
    // If there's an existing receipt number, preserve the user input part
    let userInput = '';
    if (form.receiptNumber) {
      // Remove existing prefix if present
      const existingPrefixes = ['M', 'FS', 'POS'];
      const hasPrefix = existingPrefixes.some(p => form.receiptNumber.startsWith(p));
      userInput = hasPrefix ? form.receiptNumber.slice(prefix.length) : form.receiptNumber;
    }
    
    const newReceiptNumber = prefix + userInput;
    
    setForm(f => ({ 
      ...f, 
      receiptKind: newReceiptKind,
      receiptNumber: newReceiptNumber
    }));
  };

  // Function to handle receipt number change
  const handleReceiptNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = e.target.value;
    const prefix = getReceiptNumberPrefix(form.receiptKind);
    
    // If receipt kind is selected, ensure prefix is always present
    if (form.receiptKind && prefix) {
      // If user input doesn't start with the prefix, add it
      if (!userInput.startsWith(prefix)) {
        // If user is trying to type a number, add the prefix
        if (userInput.match(/^[0-9]*$/)) {
          setForm(f => ({ ...f, receiptNumber: prefix + userInput }));
        } else {
          // If user input is empty or doesn't match expected format, just set the prefix
          setForm(f => ({ ...f, receiptNumber: prefix }));
        }
      } else {
        // User input already has the correct prefix
        setForm(f => ({ ...f, receiptNumber: userInput }));
      }
    } else {
      // If no receipt kind selected, allow free input
      setForm(f => ({ ...f, receiptNumber: userInput }));
    }
  };

  return (
    <>
      {/* Row 1: 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-black">Receipt Category*</label>
          <select className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black" name="receiptCategory" value={form.receiptCategory} onChange={e => setForm(f => ({ ...f, receiptCategory: e.target.value }))} required>
            <option value="">Select</option>
            {receiptCategories.map((category, index) => (
              <option key={category || index} value={category}>{category ? category.charAt(0).toUpperCase() + category.slice(1) : ''}</option>
            ))}
          </select>
          {errors.receiptCategory && (<p className="mt-1 text-sm text-red-600">{errors.receiptCategory}</p>)}
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-black">Receipt Type*</label>
          <select className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black" name="receiptType" value={form.receiptType} onChange={e => setForm(f => ({ ...f, receiptType: e.target.value }))} required>
            <option value="">Select</option>
            {receiptTypes.map((type, index) => (
              <option key={type || index} value={type}>{type ? type.charAt(0).toUpperCase() + type.slice(1) : ''}</option>
            ))}
          </select>
          {errors.receiptType && (<p className="mt-1 text-sm text-red-600">{errors.receiptType}</p>)}
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-black">Receipt Kind*</label>
          <select className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black" name="receiptKind" value={form.receiptKind} onChange={handleReceiptKindChange} required>
            <option value="">Select</option>
            {receiptKinds.map((kind, index) => (
              <option key={kind || index} value={kind}>{kind ? kind.charAt(0).toUpperCase() + kind.slice(1) : ''}</option>
            ))}
          </select>
          {errors.receiptKind && (<p className="mt-1 text-sm text-red-600">{errors.receiptKind}</p>)}
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-black">Receipt Name*</label>
          <select className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black" name="receiptName" value={form.receiptName} onChange={e => setForm(f => ({ ...f, receiptName: e.target.value }))} required>
            <option value="">Select</option>
            {receiptNames.map((name, index) => (
              <option key={name || index} value={name}>{name ? name.charAt(0).toUpperCase() + name.slice(1) : ''}</option>
            ))}
          </select>
          {errors.receiptName && (<p className="mt-1 text-sm text-red-600">{errors.receiptName}</p>)}
        </div>
      </div>
      {/* Row 2: 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-black">Receipt Number*</label>
          <div className="relative">
            <input 
              className={`input input-bordered px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 w-full ${
                checkingReceiptNumber ? 'border-yellow-300 bg-yellow-50' :
                receiptNumberExists === true ? 'border-red-300 bg-red-50 focus:ring-red-400' :
                receiptNumberExists === false ? 'border-green-300 bg-green-50 focus:ring-green-400' :
                'border-gray-300 focus:ring-blue-400'
              } text-black`}
              name="receiptNumber" 
              value={form.receiptNumber} 
              onChange={handleReceiptNumberChange}
              placeholder={form.receiptKind ? `Enter number after ${getReceiptNumberPrefix(form.receiptKind)}` : "Enter receipt number"}
              required 
            />
            {checkingReceiptNumber && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
              </div>
            )}
            {!checkingReceiptNumber && receiptNumberExists === true && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            {!checkingReceiptNumber && receiptNumberExists === false && form.receiptNumber && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          {!checkingReceiptNumber && receiptNumberExists === true && (
            <p className="mt-1 text-sm text-red-600">This receipt number is already submitted</p>
          )}
          {errors.receiptNumber && (<p className="mt-1 text-sm text-red-600">{errors.receiptNumber}</p>)}
          {/* {!checkingReceiptNumber && receiptNumberExists === false && form.receiptNumber && (
            <p className="mt-1 text-sm text-green-600">Receipt number is available</p>
          )} */}
        </div>
          
          {/* here add MAchine number input */}
          {['electronic', 'digital'].includes((form?.receiptKind || '').toLowerCase()) && (
          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-black">Machine Number</label>
            <input className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black" type="text" name="machineNumber" value={form.machineNumber} onChange={e => setForm(f => ({ ...f, machineNumber: e.target.value }))} />
          </div>
          )}

        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-black">Calendar Type*</label>
          <select className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black" name="calendarType" value={form.calendarType} onChange={e => setForm(f => ({ ...f, calendarType: e.target.value }))} required>
            <option value="">Select</option>
            <option value="ethiopian">Ethiopian</option>
            <option value="gregorian">Gregorian</option>
          </select>
          {errors.calendarType && (<p className="mt-1 text-sm text-red-600">{errors.calendarType}</p>)}
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-black">Receipt Date*</label>
          <input className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black" type="date" name="receiptDate" value={form.receiptDate} onChange={e => setForm(f => ({ ...f, receiptDate: e.target.value }))} required />
          {errors.receiptDate && (<p className="mt-1 text-sm text-red-600">{errors.receiptDate}</p>)}
        </div>
      </div>
    </>
  );
};

export default ReceiptDetailsForm; 