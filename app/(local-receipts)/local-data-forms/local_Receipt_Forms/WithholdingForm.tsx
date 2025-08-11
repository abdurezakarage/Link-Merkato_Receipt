import React from "react";
import type { WithholdingForm, SellerInfo, BuyerInfo } from "../types";
import FileUpload from "./FileUpload";

interface WithholdingFormComponentProps {
  withholdingForm: WithholdingForm;
  setWithholdingForm: (form: WithholdingForm) => void;
  subTotal: number;
  taxWithholdingAmount: number;
  handleWithholdingChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleWithholdingFile: (file: File | null) => void;
  buyer: BuyerInfo;
  seller: SellerInfo;
}

const WithholdingFormComponent: React.FC<WithholdingFormComponentProps> = React.memo(({
  withholdingForm,
  setWithholdingForm,
  subTotal,
  taxWithholdingAmount,
  handleWithholdingChange,
  handleWithholdingFile,
  buyer,
  seller,
}) => (
  <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl shadow flex flex-col gap-4 mt-4">
    <div className="text-lg font-bold text-blue-700 mb-2">Withholding Receipt Form</div>
    <div className="flex flex-col md:flex-row gap-6 mt-4">
      <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="font-semibold text-green-700 mb-1">Buyer</div>
        <div className="text-sm text-gray-700">
          <div>Name: {buyer.name}</div>
          <div>TIN: {buyer.tin}</div>
          <div>Address: {buyer.address}</div>
        </div>
      </div>
      <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="font-semibold text-blue-700 mb-1">Seller </div>
        <div className="text-sm text-gray-700">
          <div>Name: {seller.name}</div>
          <div>TIN: {seller.tin}</div>
          <div>Address: {seller.address}</div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-gray-700">Withholding Receipt Number*</label>
        <input
          className="input input-bordered px-3 py-2 rounded-lg border border-gray-300"
          name="receiptNumber"
          value={withholdingForm.receiptNumber}
          onChange={handleWithholdingChange}
          required
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-gray-700">Withholding Receipt Date*</label>
        <input
          className="input input-bordered px-3 py-2 rounded-lg border border-gray-300"
          type="date"
          name="receiptDate"
          value={withholdingForm.receiptDate}
          onChange={handleWithholdingChange}
          required
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-gray-700">Description*</label>
        <input
          className="input input-bordered px-3 py-2 rounded-lg border border-gray-300"
          name="transactionType"
          value={withholdingForm.transactionType}
          onChange={handleWithholdingChange}
          required
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-gray-700">Sales Invoice (Receipt) Number of Seller*</label>
        <input
          className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 bg-gray-50"
          name="salesInvoiceNumber"
          value={withholdingForm.salesInvoiceNumber}
          onChange={handleWithholdingChange}
          required
          placeholder="Auto-populated from main receipt"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-gray-700">Sub Total Amount*</label>
        <input
          className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 bg-gray-50"
          name="subTotal"
          type="number"
          value={withholdingForm.subTotal || subTotal}
          onChange={handleWithholdingChange}
          required
          placeholder="Auto-calculated from main receipt"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-gray-700">Tax Withholding Amount (3%)</label>
        <input
          className="input input-bordered px-3 py-2 rounded-lg border border-gray-300 bg-gray-50"
          name="taxWithholdingAmount"
          type="number"
          value={withholdingForm.taxWithholdingAmount || taxWithholdingAmount}
          onChange={handleWithholdingChange}
          required
          placeholder="Auto-calculated (3% of sub-total)"
        />
      </div>
      <div className="flex flex-col">
        <FileUpload
          label="Attach Withholding Document"
          accept="image/*,.pdf"
          onChange={handleWithholdingFile}
          value={withholdingForm.document}
          maxSize={10}
          required={false}
        />
      </div>
    </div>
  </div>
));

WithholdingFormComponent.displayName = 'WithholdingFormComponent';

export default WithholdingFormComponent; 