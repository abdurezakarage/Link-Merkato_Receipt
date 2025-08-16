"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import PreviewModal from "../declaration/preview/PreviewModal";

// --- Type Definitions ---
type TaxDto = {
  name: string;
  value: number | null; // Changed to allow null for empty state
  codename: string;
  percentage?: number | null; // Changed to allow null for empty state
};

type ItemManagementDto = {
  hscode: string;
  itemdescription: string;
  unitofmeasurement: string;
  quantity: number | null; // Changed to allow null for empty state
  unitCost: number | null; // Changed to allow null for empty state
  taxApplicationdto: TaxDto[];
};

type FormData = {
  custombranchname: string;
  declarationnumber: string;
  declarationdispensedate: string;
  fobamountusdt: number | null;
  exchangerate: number | null;
  externalfreight: number | null;
  insuranceCost: number | null;
  inlandfreight1: number | null;
  djibouticost: number | null;
  othercost1: number | null;
  itemManagementdto: ItemManagementDto[];
  taxApplicationdto: TaxDto[];
};

// --- Tax Options --
const TAX_OPTIONS = [
  { name: "DutyTax", value: 0.15, codename: "DutyTax", percentage: 15 },
  { name: "ExciseTax", value: 0.15, codename: "ExciseTax", percentage: 15 },
  { name: "Surtax", value: 0.1, codename: "Surtax", percentage: 10 },
  {
    name: "SocialWelfareTax",
    value: 0.03,
    codename: "SocialWelfareTax",
    percentage: 3,
  },
  { name: "VAT", value: 0.15, codename: "VAT", percentage: 15 },
  {
    name: "WITHHOLDINGTAX",
    value: 0.03,
    codename: "WITHHOLDINGTAX",
    percentage: 3,
  },
  {
    name: "ScanningFee",
    value: 0.0007,
    codename: "ScanningFee",
    percentage: 0.07,
  },
  {
    name: "ScanningFeeVAT",
    value: 0.15,
    codename: "ScanningFeeVAT",
    percentage: 15,
  },
];

// Standard unit of measurement options
const UNIT_OPTIONS = [
  "PCS",
  "KG",
  "L",
  "M",
  "BOX",
  "PAIR",
  "SET",
  "CARTON",
  "OTHER",
];

// --- Helper Components ---
function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = true,
  min,
  placeholder,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  min?: string;
  placeholder?: string;
  step?: string;
}) {
  return (
    <div className="flex flex-col w-full">
      <label htmlFor={name} className="font-medium mb-1 text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value === null ? "" : value}
        onChange={onChange}
        className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
        required={required}
        min={min}
        placeholder={placeholder}
        step={step}
      />
    </div>
  );
}

function UnitOfMeasurementDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
      required
    >
      <option value="">Select Unit</option>
      {UNIT_OPTIONS.map((unit) => (
        <option key={unit} value={unit}>
          {unit}
        </option>
      ))}
    </select>
  );
}

function ItemRow({
  item,
  index,
  handleItemChange,
  handleTaxChange,
  addItemTax,
  removeItemTax,
  removeItem,
}: {
  item: ItemManagementDto;
  index: number;
  handleItemChange: (
    index: number,
    field: keyof Omit<ItemManagementDto, "taxes">,
    value: any
  ) => void;
  handleTaxChange: (
    itemIndex: number,
    taxIndex: number,
    field: keyof TaxDto,
    value: any
  ) => void;
  addItemTax: (itemIndex: number) => void;
  removeItemTax: (itemIndex: number, taxIndex: number) => void;
  removeItem: (index: number) => void;
}) {
  const handleTaxSelect = (
    itemIndex: number,
    taxIndex: number,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedTax = TAX_OPTIONS.find((opt) => opt.name === e.target.value);
    if (selectedTax) {
      handleTaxChange(itemIndex, taxIndex, "name", selectedTax.name);
      handleTaxChange(itemIndex, taxIndex, "value", selectedTax.value);
      handleTaxChange(itemIndex, taxIndex, "codename", selectedTax.codename);
      handleTaxChange(
        itemIndex,
        taxIndex,
        "percentage",
        selectedTax.percentage ?? selectedTax.value * 100
      );
    }
  };

  const handleTaxPercentageChange = (
    itemIndex: number,
    taxIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = e.target.value;
    const percentageValue = inputValue === "" ? null : parseFloat(inputValue);
    const decimalValue =
      percentageValue === null ? null : percentageValue / 100;

    handleTaxChange(itemIndex, taxIndex, "value", decimalValue);
    handleTaxChange(itemIndex, taxIndex, "percentage", percentageValue);
  };

  const handleUnitChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    itemIndex: number
  ) => {
    handleItemChange(itemIndex, "unitofmeasurement", e.target.value);
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-2 py-1 border border-gray-200">
          <input
            type="text"
            value={item.hscode}
            onChange={(e) => handleItemChange(index, "hscode", e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
            required
          />
        </td>
        <td className="px-2 py-1 border border-gray-200">
          <input
            type="text"
            value={item.itemdescription}
            onChange={(e) =>
              handleItemChange(index, "itemdescription", e.target.value)
            }
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
            required
          />
        </td>
        <td className="px-2 py-1 border border-gray-200">
          <UnitOfMeasurementDropdown
            value={item.unitofmeasurement}
            onChange={(e) => handleUnitChange(e, index)}
          />
          {item.unitofmeasurement === "OTHER" && (
            <input
              type="text"
              value={item.unitofmeasurement}
              onChange={(e) =>
                handleItemChange(index, "unitofmeasurement", e.target.value)
              }
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs mt-1"
              placeholder="Specify unit"
              required
            />
          )}
        </td>
        <td className="px-2 py-1 border border-gray-200">
          <input
            type="number"
            value={item.quantity === null ? "" : item.quantity}
            onChange={(e) =>
              handleItemChange(
                index,
                "quantity",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
            required
            min="1"
            step="1"
          />
        </td>
        <td className="px-2 py-1 border border-gray-200">
          <input
            type="number"
            value={item.unitCost === null ? "" : item.unitCost}
            onChange={(e) =>
              handleItemChange(
                index,
                "unitCost",
                e.target.value === "" ? null : parseFloat(e.target.value)
              )
            }
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
            required
            min="0"
            step="0.01"
          />
        </td>
        <td className="px-2 py-1 border border-gray-200">
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="text-red-600 hover:text-red-800 text-xs"
          >
            Remove
          </button>
        </td>
      </tr>

      {item.taxApplicationdto.map((tax, taxIndex) => (
        <tr
          key={`tax-${index}-${taxIndex}`}
          className="hover:bg-gray-50 bg-gray-50"
        >
          <td colSpan={2} className="px-2 py-1 border border-gray-200 text-xs">
            Tax #{taxIndex + 1}
          </td>
          <td className="px-2 py-1 border border-gray-200">
            <select
              value={tax.name}
              onChange={(e) => handleTaxSelect(index, taxIndex, e)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              required
            >
              <option value="">Select Tax</option>
              {TAX_OPTIONS.map((option) => (
                <option key={option.codename} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </td>
          <td className="px-2 py-1 border border-gray-200">
            <div className="flex items-center">
              <input
                type="number"
                value={tax.percentage === null ? "" : tax.percentage}
                onChange={(e) => handleTaxPercentageChange(index, taxIndex, e)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                required
                min="0"
                placeholder="15"
                step="any"
              />
              <span className="ml-1 text-xs">%</span>
            </div>
          </td>
          <td className="px-2 py-1 border border-gray-200">
            <input
              type="text"
              value={tax.codename}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              readOnly
            />
          </td>
          <td className="px-2 py-1 border border-gray-200">
            <button
              type="button"
              onClick={() => removeItemTax(index, taxIndex)}
              className="text-red-600 hover:text-red-800 text-xs"
            >
              Remove
            </button>
          </td>
        </tr>
      ))}

      <tr>
        <td colSpan={6} className="px-2 py-1 border border-gray-200">
          <button
            type="button"
            onClick={() => addItemTax(index)}
            className="text-blue-600 hover:text-blue-800 text-xs"
          >
            + Add Tax to this Item
          </button>
        </td>
      </tr>
    </>
  );
}

// --- Main Form Component ---
export default function DeclarationForm() {
  const router = useRouter();
  const [tinNumber, setTinNumber] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    custombranchname: "",
    declarationnumber: "",
    declarationdispensedate: "",
    fobamountusdt: null,
    exchangerate: null,
    externalfreight: null,
    insuranceCost: null,
    inlandfreight1: null,
    djibouticost: null,
    othercost1: null,
    itemManagementdto: [],
    taxApplicationdto: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handleTinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setTinNumber(value);
    }
  };

  const handlePreview = () => {
    try {
      validateForm(); // Validate before showing preview
      setShowPreview(true);
      setError("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name.includes("amount") ||
        name.includes("Cost") ||
        name.includes("rate")
          ? value === ""
            ? null
            : parseFloat(value)
          : value,
    });
  };

  const handleEditSave = (editedData: FormData) => {
    setFormData(editedData);
    setShowPreview(false); // Optionally close the modal after saving
  };
  const handleItemChange = (
    index: number,
    field: keyof Omit<ItemManagementDto, "taxes">,
    value: any
  ) => {
    const newItems = [...formData.itemManagementdto];
    newItems[index] = {
      ...newItems[index],
      [field]:
        field === "quantity"
          ? value === ""
            ? null
            : Math.max(1, Number(value))
          : field === "unitCost"
          ? value === ""
            ? null
            : parseFloat(value)
          : value,
    };
    setFormData({ ...formData, itemManagementdto: newItems });
  };

  const handleTaxChange = (
    itemIndex: number,
    taxIndex: number,
    field: keyof TaxDto,
    value: any
  ) => {
    const newItems = [...formData.itemManagementdto];
    newItems[itemIndex].taxApplicationdto[taxIndex] = {
      ...newItems[itemIndex].taxApplicationdto[taxIndex],
      [field]:
        field === "value" ? (value === "" ? null : parseFloat(value)) : value,
    };
    setFormData({ ...formData, itemManagementdto: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      itemManagementdto: [
        ...formData.itemManagementdto,
        {
          hscode: "",
          itemdescription: "",
          unitofmeasurement: "",
          quantity: null,
          unitCost: null,
          taxApplicationdto: [
            {
              name: "",
              value: null,
              codename: "",
              percentage: null,
            },
          ],
        },
      ],
    });
  };

  const addItemTax = (itemIndex: number) => {
    const newItems = [...formData.itemManagementdto];
    newItems[itemIndex].taxApplicationdto.push({
      name: "",
      value: null,
      codename: "",
      percentage: null,
    });
    setFormData({ ...formData, itemManagementdto: newItems });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      itemManagementdto: formData.itemManagementdto.filter(
        (_, i) => i !== index
      ),
    });
  };

  const removeItemTax = (itemIndex: number, taxIndex: number) => {
    const newItems = [...formData.itemManagementdto];
    newItems[itemIndex].taxApplicationdto = newItems[
      itemIndex
    ].taxApplicationdto.filter((_, i) => i !== taxIndex);
    setFormData({ ...formData, itemManagementdto: newItems });
  };

  const validateForm = () => {
    if (!tinNumber) {
      throw new Error("TIN number is required");
    }
    if (!/^\d{10}$/.test(tinNumber)) {
      throw new Error("TIN number must be exactly 10 digits");
    }

    if (!formData.custombranchname) {
      throw new Error("Branch name is required");
    }
    if (!formData.declarationnumber) {
      throw new Error("Declaration number is required");
    }
    if (!formData.declarationdispensedate) {
      throw new Error("Declaration date is required");
    }
    if (formData.fobamountusdt === null) {
      throw new Error("FOB amount is required");
    }
    if (formData.fobamountusdt < 0) {
      throw new Error("FOB amount cannot be negative");
    }
    if (formData.exchangerate === null) {
      throw new Error("Exchange rate is required");
    }
    if (formData.exchangerate < 0) {
      throw new Error("Exchange rate cannot be negative");
    }
    if (formData.itemManagementdto.length === 0) {
      throw new Error("At least one item is required");
    }

    formData.itemManagementdto.forEach((item, index) => {
      if (!item.hscode) {
        throw new Error(`HS Code is required for item ${index + 1}`);
      }
      if (!item.itemdescription) {
        throw new Error(`Description is required for item ${index + 1}`);
      }
      if (item.quantity === null) {
        throw new Error(`Quantity is required for item ${index + 1}`);
      }
      if (item.quantity <= 0) {
        throw new Error(
          `Quantity must be greater than 0 for item ${index + 1}`
        );
      }
      if (item.unitCost === null) {
        throw new Error(`Unit cost is required for item ${index + 1}`);
      }
      if (item.unitCost < 0) {
        throw new Error(`Unit cost cannot be negative for item ${index + 1}`);
      }
      if (!item.unitofmeasurement) {
        throw new Error(
          `Unit of measurement is required for item ${index + 1}`
        );
      }

      item.taxApplicationdto.forEach((tax, taxIndex) => {
        if (!tax.name) {
          throw new Error(
            `Tax type is required for tax ${taxIndex + 1} in item ${index + 1}`
          );
        }
        if (tax.value === null) {
          throw new Error(
            `Tax value is required for tax ${taxIndex + 1} in item ${index + 1}`
          );
        }
        if (tax.value < 0) {
          throw new Error(
            `Tax value cannot be negative for tax ${taxIndex + 1} in item ${
              index + 1
            }`
          );
        }
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      validateForm();

      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const roles = JSON.parse(localStorage.getItem("roles") || "[]");

      if (!token || !userId) {
        throw new Error("Session expired. Please log in again.");
      }

      if (!roles.includes("CLERK")) {
        throw new Error("You don't have permission to submit declarations.");
      }

      const allUniqueTaxes = new Map<string, TaxDto>();
      formData.itemManagementdto.forEach((item) => {
        item.taxApplicationdto.forEach((tax) => {
          if (tax.codename && !allUniqueTaxes.has(tax.codename)) {
            allUniqueTaxes.set(tax.codename, {
              ...tax,
              value: tax.value || 0, // Ensure we don't send null to backend
              percentage: tax.percentage || 0,
            });
          }
        });
      });

      const submissionData = {
        ...formData,
        // Convert null values to 0 for backend
        fobamountusdt: formData.fobamountusdt || 0,
        exchangerate: formData.exchangerate || 0,
        externalfreight: formData.externalfreight || 0,
        insuranceCost: formData.insuranceCost || 0,
        inlandfreight1: formData.inlandfreight1 || 0,
        djibouticost: formData.djibouticost || 0,
        othercost1: formData.othercost1 || 0,
        itemManagementdto: formData.itemManagementdto.map((item) => ({
          ...item,
          quantity: item.quantity || 0,
          unitCost: item.unitCost || 0,
          taxApplicationdto: item.taxApplicationdto.map((tax) => ({
            ...tax,
            value: tax.value || 0,
            percentage: tax.percentage || 0,
          })),
        })),
        taxApplicationdto: Array.from(allUniqueTaxes.values()),
      };

      const response = await fetch(
        `https://api.import.linkmerkato.com.et/api/v1/clerk/declarationInfo/${tinNumber}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submissionData),
        }
      );

      // First read the response as text
      const responseText = await response.text();

      // Try to parse it as JSON, fall back to text if it fails
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      if (!response.ok) {
        throw new Error(
          typeof responseData === "object"
            ? responseData.message || "Submission failed"
            : responseData || "Submission failed"
        );
      }

      // Handle success response
      const successMessage =
        typeof responseData === "object"
          ? responseData.message || "Declaration submitted successfully!"
          : responseData || "Declaration submitted successfully!";

      alert(successMessage);

      // Reset form with null values instead of 0
      setFormData({
        custombranchname: "",
        declarationnumber: "",
        declarationdispensedate: "",
        fobamountusdt: null,
        exchangerate: null,
        externalfreight: null,
        insuranceCost: null,
        inlandfreight1: null,
        djibouticost: null,
        othercost1: null,
        itemManagementdto: [],
        taxApplicationdto: [],
      });
      setTinNumber("");
    } catch (err: any) {
      console.error("Submission Error:", err);
      setError(err.message || "Failed to submit declaration");

      if (
        err.message.includes("expired") ||
        err.message.includes("permission")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("roles");
        router.push("/auth/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[100vw] px-2 md:px-4 overflow-hidden">
      <form
        onSubmit={handleSubmit}
        className="w-full mx-auto bg-white rounded-lg p-4 md:p-6 space-y-6"
      >
        <h2 className="text-lg md:text-xl font-semibold text-center">
          Custom Declaration Form
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField
            label="TIN Number (10 digits)"
            name="tinNumber"
            value={tinNumber}
            onChange={handleTinChange}
            placeholder="Enter 10 digit TIN"
          />
          <InputField
            label="Branch Name"
            name="custombranchname"
            value={formData.custombranchname}
            onChange={handleChange}
          />
          <InputField
            label="Declaration Number"
            name="declarationnumber"
            value={formData.declarationnumber}
            onChange={handleChange}
          />
          <InputField
            label="Declaration Date"
            name="declarationdispensedate"
            type="date"
            value={formData.declarationdispensedate}
            onChange={handleChange}
          />
          <InputField
            label="FOB Amount (USD)"
            name="fobamountusdt"
            type="number"
            value={formData.fobamountusdt}
            onChange={handleChange}
            min="0"
            step="any"
          />
          <InputField
            label="Exchange Rate"
            name="exchangerate"
            type="number"
            value={formData.exchangerate}
            onChange={handleChange}
            min="0"
            step="any"
          />
          <InputField
            label="External Freight"
            name="externalfreight"
            type="number"
            value={formData.externalfreight}
            onChange={handleChange}
            min="0"
            step="any"
          />
          <InputField
            label="Insurance Cost"
            name="insuranceCost"
            type="number"
            value={formData.insuranceCost}
            onChange={handleChange}
            min="0"
            step="any"
          />
          <InputField
            label="Inland Freight"
            name="inlandfreight1"
            type="number"
            value={formData.inlandfreight1}
            onChange={handleChange}
            min="0"
            step="any"
          />
          <InputField
            label="Djibouti Cost"
            name="djibouticost"
            type="number"
            value={formData.djibouticost}
            onChange={handleChange}
            min="0"
            step="any"
          />
          <InputField
            label="Other Cost"
            name="othercost1"
            type="number"
            value={formData.othercost1}
            onChange={handleChange}
            min="0"
            step="any"
            required={false}
          />
        </div>

        <div className="mt-4">
          <h3 className="text-md font-semibold mb-2">Items with Taxes</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "HS Code",
                    "Item",
                    "Unit measurement",
                    "Quantity",
                    "Unit Cost",
                    "Action",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.itemManagementdto.map((item, index) => (
                  <ItemRow
                    key={index}
                    item={item}
                    index={index}
                    handleItemChange={handleItemChange}
                    handleTaxChange={handleTaxChange}
                    addItemTax={addItemTax}
                    removeItemTax={removeItemTax}
                    removeItem={removeItem}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded text-sm"
          >
            + Add Item
          </button>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handlePreview}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded text-sm"
          >
            Preview Declaration
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded text-sm ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Submitting..." : "Submit Declaration"}
          </button>
        </div>
      </form>

      {showPreview && (
        <PreviewModal
          tinNumber={tinNumber}
          formData={formData}
          onClose={() => setShowPreview(false)}
          onEdit={handleEditSave} // Pass the new handler function here
        />
      )}
    </div>
  );
}

export type { TaxDto, ItemManagementDto, FormData };
