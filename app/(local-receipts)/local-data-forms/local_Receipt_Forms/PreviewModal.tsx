import React from 'react';
import { FormState, WithholdingForm } from '../types';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: FormState;
  withholdingForm: WithholdingForm | null;
  withholdingRequired: string;
  subTotal: number;
  tax: number;
  mainReceipt: File | null;
  attachment: File | null;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  form,
  withholdingForm,
  withholdingRequired,
  subTotal,
  tax,
  mainReceipt,
  attachment
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 bg-opacity-50 z-50 flex items-center justify-center p-4 text-black ">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Receipt Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Receipt Details */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Receipt Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Receipt Category</p>
                <p className="font-medium">{form.receiptCategory}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Receipt Type</p>
                <p className="font-medium">{form.receiptType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Receipt Kind</p>
                <p className="font-medium">{form.receiptKind}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Receipt Name</p>
                <p className="font-medium">{form.receiptName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Receipt Number</p>
                <p className="font-medium">{form.receiptNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Receipt Date</p>
                <p className="font-medium">{form.receiptDate}</p>
              </div>
            </div>
          </section>

          {/* Seller & Buyer Information */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Seller & Buyer Information</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">Seller</h4>
                <div className="space-y-2">
                  <p><span className="text-gray-600">Name:</span> {form.seller.name}</p>
                  <p><span className="text-gray-600">TIN:</span> {form.seller.tin}</p>
                  <p><span className="text-gray-600">Address:</span> {form.seller.address}</p>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">Buyer</h4>
                <div className="space-y-2">
                  <p><span className="text-gray-600">Name:</span> {form.buyer.name}</p>
                  <p><span className="text-gray-600">TIN:</span> {form.buyer.tin}</p>
                  <p><span className="text-gray-600">Address:</span> {form.buyer.address}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Items */}
          {form.items.length > 0 && (
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GL Account</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nature</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Measurement</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {form.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.glAccount}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.itemCode}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.nature}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.unitOfMeasurement}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.unitCost.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.totalCost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 ">
                    <tr>
                      <td colSpan={7} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Subtotal:</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right whitespace-nowrap">{subTotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={7} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Tax:</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right whitespace-nowrap">{tax.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={7} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Total:</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right whitespace-nowrap">{(subTotal + tax).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          )}

                     {/* Documents Information
           <section className="mb-8">
             <h3 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Documents</h3>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <p className="text-sm text-gray-600">Main Receipt</p>
                 <p className="font-medium">
                   {mainReceipt ? (
                     <span className="flex items-center gap-2 text-green-600">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                       </svg>
                       {mainReceipt.name}
                     </span>
                   ) : (
                     <span className="text-gray-500">No file uploaded</span>
                   )}
                 </p>
               </div>
               <div>
                 <p className="text-sm text-gray-600">Attachment</p>
                 <p className="font-medium">
                   {attachment ? (
                     <span className="flex items-center gap-2 text-green-600">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                       </svg>
                       {attachment.name}
                     </span>
                   ) : (
                     <span className="text-gray-500">No file uploaded</span>
                   )}
                 </p>
               </div>
             </div>
           </section> */}

           {/* Payment Information */}
           <section className="mb-8">
             <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h3>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <p className="text-sm text-gray-600">Payment Method</p>
                 <p className="font-medium">{form.paymentMethod}</p>
               </div>
               {form.paymentMethod?.toLowerCase().includes('bank') && (
                 <div>
                   <p className="text-sm text-gray-600">Bank Name</p>
                   <p className="font-medium">{form.bankName}</p>
                 </div>
               )}
             </div>
           </section>

          {/* Withholding Information */}
          {withholdingRequired === 'yes' && withholdingForm && (
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Withholding Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Withholding Receipt Number</p>
                  <p className="font-medium">{withholdingForm.receiptNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Withholding Receipt Date</p>
                  <p className="font-medium">{withholdingForm.receiptDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transaction Type</p>
                  <p className="font-medium">{withholdingForm.transactionType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Withholding Amount</p>
                  <p className="font-medium">{withholdingForm.taxWithholdingAmount.toFixed(2)}</p>
                </div>
              </div>
                         {/* Withholding Documents Information */}
           {/* <section className="mb-8">
             <h3 className="text-lg font-semibold text-gray-800 mb-4">Withholding Documents</h3>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <p className="text-sm text-gray-600">Withholding Receipt</p>
                 <p className="font-medium">
                   {withholdingForm.document ? (
                     <span className="flex items-center gap-2 text-green-600">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                       </svg>
                       {withholdingForm.document.name}
                     </span>
                   ) : (
                     <span className="text-gray-500">No file uploaded</span>
                   )}
                 </p>
               </div>
             </div>
           </section> */}
            </section>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Confirm & Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
