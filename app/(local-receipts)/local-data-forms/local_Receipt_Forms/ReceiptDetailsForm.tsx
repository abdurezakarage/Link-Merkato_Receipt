import React from "react";
import { ReceiptKind } from "../types";

interface ReceiptDetailsFormProps {
  form: any; // Replace 'any' with the correct FormState type
  setForm: (updater: (prev: any) => any) => void;
  receiptKinds: string[];
  receiptNames: string[];
  receiptCategories: string[];
  receiptTypes: string[];
}

const ReceiptDetailsForm: React.FC<ReceiptDetailsFormProps> = ({ form, setForm, receiptKinds, receiptNames, receiptCategories, receiptTypes }) => (
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
      </div>
      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-black">Receipt Type*</label>
        <select className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black" name="receiptType" value={form.receiptType} onChange={e => setForm(f => ({ ...f, receiptType: e.target.value }))} required>
          <option value="">Select</option>
          {receiptTypes.map((type, index) => (
            <option key={type || index} value={type}>{type ? type.charAt(0).toUpperCase() + type.slice(1) : ''}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-black">Receipt Kind*</label>
        <select className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black" name="receiptKind" value={form.receiptKind} onChange={e => setForm(f => ({ ...f, receiptKind: e.target.value }))} required>
          <option value="">Select</option>
          {receiptKinds.map((kind, index) => (
            <option key={kind || index} value={kind}>{kind ? kind.charAt(0).toUpperCase() + kind.slice(1) : ''}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-black">Receipt Name*</label>
        <select className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black" name="receiptName" value={form.receiptName} onChange={e => setForm(f => ({ ...f, receiptName: e.target.value }))} required>
          <option value="">Select</option>
          {receiptNames.map((name, index) => (
            <option key={name || index} value={name}>{name ? name.charAt(0).toUpperCase() + name.slice(1) : ''}</option>
          ))}
        </select>
      </div>
    </div>
    {/* Row 2: 3 columns */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-black">Receipt Number*</label>
        <input className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black" name="receiptNumber" value={form.receiptNumber} onChange={e => setForm(f => ({ ...f, receiptNumber: e.target.value }))} required />
      </div>
      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-black">Calendar Type*</label>
        <select className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black" name="calendarType" value={form.calendarType} onChange={e => setForm(f => ({ ...f, calendarType: e.target.value }))} required>
          <option value="">Select</option>
          <option value="ethiopian">Ethiopian</option>
          <option value="gregorian">Gregorian</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-black">Receipt Date*</label>
        <input className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black" type="date" name="receiptDate" value={form.receiptDate} onChange={e => setForm(f => ({ ...f, receiptDate: e.target.value }))} required />
      </div>
    </div>
  </>
);

export default ReceiptDetailsForm; 