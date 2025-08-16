"use client";

import React, { useState } from "react";
import Modal from "react-modal";
import {
  FormData,
  TaxDto,
  ItemManagementDto,
} from "../../components/DeclarationForm";

// Make sure to set the app element for react-modal
if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}

const formatCurrency = (value: number | null) => {
  if (value === null || isNaN(Number(value))) {
    return ""; // Return empty string instead of "N/A"
  }
  // Format with all decimal places but remove trailing .00 if whole number
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 20, // Allow up to 20 decimal places
  }).format(value);

  return formatted;
};

const formatTaxValue = (value: number | string | null) => {
  // Convert to number if it's a string
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (numValue === null || isNaN(numValue)) {
    return ""; // Return empty string instead of "N/A"
  }

  // Format with up to 8 decimal places but remove unnecessary trailing zeros
  return numValue.toString().replace(/(\.\d*?[1-9])0+$|\.0+$/, "$1");
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <div className="flex justify-between py-1 border-b border-gray-200">
      <span className="font-medium text-gray-600">{label}:</span>
      <span className="text-gray-900">
        {value !== null && value !== "" ? value.toString() : "-"}
      </span>
    </div>
  );
}

function ItemTaxDisplay({ taxes }: { taxes: TaxDto[] }) {
  if (taxes.length === 0) {
    return (
      <span className="text-gray-500 italic text-sm">
        No taxes applied to this item.
      </span>
    );
  }
  return (
    <ul className="list-disc list-inside space-y-1 mt-1 text-sm">
      {taxes.map((tax, taxIndex) => (
        <li key={taxIndex} className="text-gray-700">
          <strong>{tax.name}</strong>: {tax.percentage ?? "-"}% (Value:{" "}
          {formatTaxValue(tax.value)})
        </li>
      ))}
    </ul>
  );
}

interface PreviewModalProps {
  formData: FormData;
  tinNumber: string;
  onClose: () => void;
  onEdit: (editedData: FormData) => void;
}

export default function PreviewModal({
  formData,
  tinNumber,
  onClose,
  onEdit,
}: PreviewModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFormData, setEditedFormData] = useState<FormData>(formData);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isNumberField = [
      "fobamountusdt",
      "exchangerate",
      "externalfreight",
      "insuranceCost",
      "inlandfreight1",
      "djibouticost",
      "othercost1",
    ].includes(name);

    setEditedFormData((prev) => ({
      ...prev,
      [name]: isNumberField ? (value === "" ? null : parseFloat(value)) : value,
    }));
  };

  const handleEditItemChange = (
    index: number,
    field: keyof Omit<ItemManagementDto, "taxApplicationdto">,
    value: any
  ) => {
    setEditedFormData((prev) => {
      const newItems = [...prev.itemManagementdto];
      const updatedItem = { ...newItems[index] };
      if (field === "quantity") {
        updatedItem.quantity = value === "" ? null : Number(value);
      } else if (field === "unitCost") {
        updatedItem.unitCost = value === "" ? null : parseFloat(value);
      } else {
        updatedItem[field] = value;
      }
      newItems[index] = updatedItem;
      return { ...prev, itemManagementdto: newItems };
    });
  };

  const handleEditItemTaxChange = (
    itemIndex: number,
    taxIndex: number,
    field: keyof TaxDto,
    value: any
  ) => {
    setEditedFormData((prev) => {
      const newItems = [...prev.itemManagementdto];
      const newTaxes = [...newItems[itemIndex].taxApplicationdto];

      const updatedTax = { ...newTaxes[taxIndex] };

      // Type assertion to bypass the warning
      (updatedTax as any)[field] = value;

      newTaxes[taxIndex] = updatedTax;

      newItems[itemIndex] = {
        ...newItems[itemIndex],
        taxApplicationdto: newTaxes,
      };

      return { ...prev, itemManagementdto: newItems };
    });
  };

  const onEditSave = () => {
    onEdit(editedFormData);
    setIsEditing(false);
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      className="Modal"
      overlayClassName="Overlay"
      contentLabel="Declaration Preview"
    >
      <div className="p-4 md:p-6 bg-white rounded-lg shadow-xl max-w-4xl mx-auto my-8 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-6">
          Declaration Preview
        </h2>

        {isEditing ? (
          // --- Edit View ---
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">
              General Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col">
                TIN Number:
                <input
                  type="text"
                  value={tinNumber}
                  readOnly
                  className="bg-gray-100 p-2 rounded"
                />
              </label>
              <label className="flex flex-col">
                Branch Name:
                <input
                  type="text"
                  name="custombranchname"
                  value={editedFormData.custombranchname}
                  onChange={handleEditChange}
                  className="border p-2 rounded"
                />
              </label>
              <label className="flex flex-col">
                Declaration Number:
                <input
                  type="text"
                  name="declarationnumber"
                  value={editedFormData.declarationnumber}
                  onChange={handleEditChange}
                  className="border p-2 rounded"
                />
              </label>
              <label className="flex flex-col">
                Declaration Date:
                <input
                  type="date"
                  name="declarationdispensedate"
                  value={editedFormData.declarationdispensedate}
                  onChange={handleEditChange}
                  className="border p-2 rounded"
                />
              </label>
              <label className="flex flex-col">
                FOB Amount (USD):
                <input
                  type="number"
                  name="fobamountusdt"
                  value={editedFormData.fobamountusdt ?? ""}
                  onChange={handleEditChange}
                  className="border p-2 rounded"
                  step="any"
                />
              </label>
              <label className="flex flex-col">
                Exchange Rate:
                <input
                  type="number"
                  name="exchangerate"
                  value={editedFormData.exchangerate ?? ""}
                  onChange={handleEditChange}
                  className="border p-2 rounded"
                  step="any"
                />
              </label>
              <label className="flex flex-col">
                External Freight:
                <input
                  type="number"
                  name="externalfreight"
                  value={editedFormData.externalfreight ?? ""}
                  onChange={handleEditChange}
                  className="border p-2 rounded"
                  step="any"
                />
              </label>
              <label className="flex flex-col">
                Insurance Cost:
                <input
                  type="number"
                  name="insuranceCost"
                  value={editedFormData.insuranceCost ?? ""}
                  onChange={handleEditChange}
                  className="border p-2 rounded"
                  step="any"
                />
              </label>
              <label className="flex flex-col">
                Inland Freight:
                <input
                  type="number"
                  name="inlandfreight1"
                  value={editedFormData.inlandfreight1 ?? ""}
                  onChange={handleEditChange}
                  className="border p-2 rounded"
                  step="any"
                />
              </label>
              <label className="flex flex-col">
                Djibouti Cost:
                <input
                  type="number"
                  name="djibouticost"
                  value={editedFormData.djibouticost ?? ""}
                  onChange={handleEditChange}
                  className="border p-2 rounded"
                  step="any"
                />
              </label>
              <label className="flex flex-col">
                Other Cost:
                <input
                  type="number"
                  name="othercost1"
                  value={editedFormData.othercost1 ?? ""}
                  onChange={handleEditChange}
                  className="border p-2 rounded"
                  step="any"
                />
              </label>
            </div>

            <h3 className="text-lg font-semibold border-b pb-2 mt-8">
              Items and Taxes
            </h3>
            {editedFormData.itemManagementdto.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-3"
              >
                <h4 className="font-bold text-gray-700">
                  Item #{itemIndex + 1}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col">
                    HS Code:
                    <input
                      type="text"
                      value={item.hscode}
                      onChange={(e) =>
                        handleEditItemChange(
                          itemIndex,
                          "hscode",
                          e.target.value
                        )
                      }
                      className="border p-2 rounded"
                    />
                  </label>
                  <label className="flex flex-col">
                    Description:
                    <input
                      type="text"
                      value={item.itemdescription}
                      onChange={(e) =>
                        handleEditItemChange(
                          itemIndex,
                          "itemdescription",
                          e.target.value
                        )
                      }
                      className="border p-2 rounded"
                    />
                  </label>
                  <label className="flex flex-col">
                    Quantity:
                    <input
                      type="number"
                      value={item.quantity ?? ""}
                      onChange={(e) =>
                        handleEditItemChange(
                          itemIndex,
                          "quantity",
                          e.target.value
                        )
                      }
                      className="border p-2 rounded"
                      min="1"
                      step="1"
                    />
                  </label>
                  <label className="flex flex-col">
                    Unit Cost:
                    <input
                      type="number"
                      value={item.unitCost ?? ""}
                      onChange={(e) =>
                        handleEditItemChange(
                          itemIndex,
                          "unitCost",
                          e.target.value
                        )
                      }
                      className="border p-2 rounded"
                      min="0"
                      step="any"
                    />
                  </label>
                </div>
                <div className="mt-4">
                  <h5 className="font-semibold text-gray-600">Applied Taxes</h5>
                  {item.taxApplicationdto.map((tax, taxIndex) => (
                    <div
                      key={taxIndex}
                      className="flex items-center space-x-2 mt-2"
                    >
                      <label>
                        Tax Name:
                        <input
                          type="text"
                          value={tax.name}
                          onChange={(e) =>
                            handleEditItemTaxChange(
                              itemIndex,
                              taxIndex,
                              "name",
                              e.target.value
                            )
                          }
                          className="border p-1 rounded w-32"
                        />
                      </label>
                      <label>
                        Percentage:
                        <input
                          type="number"
                          value={tax.percentage ?? ""}
                          onChange={(e) =>
                            handleEditItemTaxChange(
                              itemIndex,
                              taxIndex,
                              "percentage",
                              e.target.value === ""
                                ? null
                                : parseFloat(e.target.value)
                            )
                          }
                          className="border p-1 rounded w-20"
                          step="any"
                        />
                      </label>
                      <label>
                        Value:
                        <input
                          type="number"
                          value={tax.value ?? ""}
                          onChange={(e) =>
                            handleEditItemTaxChange(
                              itemIndex,
                              taxIndex,
                              "value",
                              e.target.value === ""
                                ? null
                                : parseFloat(e.target.value)
                            )
                          }
                          className="border p-1 rounded w-20"
                          step="any"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // --- Read-only View ---
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">
              General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow label="TIN Number" value={tinNumber} />
              <DetailRow
                label="Branch Name"
                value={formData.custombranchname}
              />
              <DetailRow
                label="Declaration Number"
                value={formData.declarationnumber}
              />
              <DetailRow
                label="Declaration Date"
                value={formData.declarationdispensedate}
              />
              <DetailRow
                label="FOB Amount (USD)"
                value={formatCurrency(formData.fobamountusdt)}
              />
              <DetailRow
                label="Exchange Rate"
                value={formData.exchangerate?.toString() ?? "-"}
              />
              <DetailRow
                label="External Freight"
                value={formatCurrency(formData.externalfreight)}
              />
              <DetailRow
                label="Insurance Cost"
                value={formatCurrency(formData.insuranceCost)}
              />
              <DetailRow
                label="Inland Freight"
                value={formatCurrency(formData.inlandfreight1)}
              />
              <DetailRow
                label="Djibouti Cost"
                value={formatCurrency(formData.djibouticost)}
              />
              <DetailRow
                label="Other Cost"
                value={formatCurrency(formData.othercost1)}
              />
            </div>

            <h3 className="text-lg font-semibold border-b pb-2 mt-8">
              Items and Taxes
            </h3>
            {formData.itemManagementdto.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-3"
              >
                <h4 className="font-bold text-gray-700">Item #{index + 1}</h4>
                <DetailRow label="HS Code" value={item.hscode} />
                <DetailRow label="Description" value={item.itemdescription} />
                <DetailRow
                  label="Unit of Measurement"
                  value={item.unitofmeasurement}
                />
                <DetailRow
                  label="Quantity"
                  value={item.quantity?.toString() ?? "-"}
                />
                <DetailRow
                  label="Unit Cost"
                  value={formatCurrency(item.unitCost)}
                />
                <div className="pt-2">
                  <h5 className="font-semibold text-gray-600">Applied Taxes</h5>
                  <ItemTaxDisplay taxes={item.taxApplicationdto} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-4 mt-6">
          {isEditing ? (
            <button
              onClick={onEditSave}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Save Changes
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
            >
              Edit
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

const modalStyles = `
  .Modal {
    position: absolute;
    top: 50%;
    left: 50%;
    right: auto;
    bottom: auto;
    margin-right: -50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    outline: none;
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .Overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.75);
    z-index: 1000;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = modalStyles;
  document.head.appendChild(styleSheet);
}
