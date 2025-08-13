"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// --- Type Definitions ---
type TaxDto = {
  name: string;
  value: number; // Stores decimal value (e.g., 0.15 for 15%)
  codename: string;
  percentage?: number; // Optional field for display purposes
};

type ItemManagementDto = {
  hscode: string;
  itemdescription: string;
  unitofmeasurement: string;
  quantity: number;
  unitCost: number;
  taxApplicationdto: TaxDto[];
};

type FormData = {
  custombranchname: string;
  declarationnumber: string;
  declarationdispensedate: string;
  fobamountusdt: number;
  exchangerate: number;
  externalfreight: number;
  insuranceCost: number;
  inlandfreight1: number;
  djibouticost: number;
  othercost1: number;
  itemManagementdto: ItemManagementDto[];
  taxApplicationdto: TaxDto[];
};

// --- Tax Options ---
const TAX_OPTIONS = [
  { name: "DutyTax", value: 0.10, codename: "DutyTax", percentage: 10 },
  { name: "ExciseTax", value: 0.10, codename: "ExciseTax", percentage: 10 },
  { name: "Surtax", value: 0.02, codename: "Surtax", percentage: 2 },
  { name: "SocialWelfareTax", value: 0.01, codename: "SocialWelfareTax", percentage: 1 },
  { name: "VAT", value: 0.15, codename: "VAT", percentage: 15 },
  { name: "WITHHOLDINGTAX", value: 0.02, codename: "WITHHOLDINGTAX", percentage: 2 },
  { name: "ScanningFee", value: 100.0, codename: "ScanningFee" },
  { name: "ScanningFeeVAT", value: 0.15, codename: "ScanningFeeVAT", percentage: 15 },
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
        value={value}
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
    const percentageValue = inputValue === '' ? 0 : parseFloat(inputValue);
    const decimalValue = percentageValue / 100;

    handleTaxChange(itemIndex, taxIndex, "value", decimalValue);
    handleTaxChange(itemIndex, taxIndex, "percentage", percentageValue);
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
          <input
            type="text"
            value={item.unitofmeasurement}
            onChange={(e) =>
              handleItemChange(index, "unitofmeasurement", e.target.value)
            }
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
            required
          />
        </td>
        <td className="px-2 py-1 border border-gray-200">
          <input
            type="number"
            value={item.quantity}
            onChange={(e) =>
              handleItemChange(index, "quantity", Number(e.target.value))
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
            value={item.unitCost}
            onChange={(e) =>
              handleItemChange(index, "unitCost", parseFloat(e.target.value) || 0)
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
                value={tax.percentage ?? ''}
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
    fobamountusdt: 0,
    exchangerate: 0,
    externalfreight: 0,
    insuranceCost: 0,
    inlandfreight1: 0,
    djibouticost: 0,
    othercost1: 0,
    itemManagementdto: [],
    taxApplicationdto: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,15}$/.test(value)) {
      setTinNumber(value);
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
          ? parseFloat(value) || 0
          : value,
    });
  };

  const handleItemChange = (
    index: number,
    field: keyof Omit<ItemManagementDto, "taxes">,
    value: any
  ) => {
    const newItems = [...formData.itemManagementdto];
    newItems[index] = { 
      ...newItems[index], 
      [field]: field === 'quantity' 
        ? Math.max(1, Number(value))
        : field === 'unitCost'
          ? parseFloat(value) || 0
          : value 
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
      [field]: field === 'value' 
        ? parseFloat(value) || 0
        : value
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
          quantity: 1,
          unitCost: 0,
          taxApplicationdto: [{ 
            name: "", 
            value: 0, 
            codename: "",
            percentage: 0 
          }],
        },
      ],
    });
  };

  const addItemTax = (itemIndex: number) => {
    const newItems = [...formData.itemManagementdto];
    newItems[itemIndex].taxApplicationdto.push({
      name: "",
      value: 0,
      codename: "",
      percentage: 0
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
    if (!/^\d{9,15}$/.test(tinNumber)) {
      throw new Error("TIN number must be 9-15 digits");
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
    if (formData.fobamountusdt < 0) {
      throw new Error("FOB amount cannot be negative");
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
      if (item.quantity <= 0) {
        throw new Error(`Quantity must be greater than 0 for item ${index + 1}`);
      }
      if (item.unitCost < 0) {
        throw new Error(`Unit cost cannot be negative for item ${index + 1}`);
      }

      item.taxApplicationdto.forEach((tax, taxIndex) => {
        if (!tax.name) {
          throw new Error(`Tax type is required for tax ${taxIndex + 1} in item ${index + 1}`);
        }
        if (tax.value < 0) {
          throw new Error(`Tax value cannot be negative for tax ${taxIndex + 1} in item ${index + 1}`);
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
            allUniqueTaxes.set(tax.codename, tax);
          }
        });
      });

      const submissionData = {
        ...formData,
        itemManagementdto: formData.itemManagementdto.map((item) => ({
          ...item,
          taxApplicationdto: item.taxApplicationdto,
        })),
        taxApplicationdto: Array.from(allUniqueTaxes.values()),
      };

      const response = await fetch(
        `http://38.242.221.21:9090/api/v1/clerk/declarationInfo/${tinNumber}`,
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
          typeof responseData === 'object' 
            ? responseData.message || "Submission failed"
            : responseData || "Submission failed"
        );
      }

      // Handle success response
      const successMessage = typeof responseData === 'object'
        ? responseData.message || "Declaration submitted successfully!"
        : responseData || "Declaration submitted successfully!";
      
      alert(successMessage);

      // Reset form
      setFormData({
        custombranchname: "",
        declarationnumber: "",
        declarationdispensedate: "",
        fobamountusdt: 0,
        exchangerate: 0,
        externalfreight: 0,
        insuranceCost: 0,
        inlandfreight1: 0,
        djibouticost: 0,
        othercost1: 0,
        itemManagementdto: [],
        taxApplicationdto: [],
      });
      setTinNumber("");

    } catch (err: any) {
      console.error("Submission Error:", err);
      setError(err.message || "Failed to submit declaration");

      if (err.message.includes("expired") || err.message.includes("permission")) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("roles");
        router.push("/companies");
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
            label="TIN Number"
            name="tinNumber"
            value={tinNumber}
            onChange={handleTinChange}
            //pattern="\d{9,15}"
            //title="TIN must be 9-15 digits"
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
            step="0.01"
          />
          <InputField
            label="Exchange Rate"
            name="exchangerate"
            type="number"
            value={formData.exchangerate}
            onChange={handleChange}
            min="0"
            step="0.0001"
          />
          <InputField
            label="External Freight"
            name="externalfreight"
            type="number"
            value={formData.externalfreight}
            onChange={handleChange}
            min="0"
            step="0.01"
          />
          <InputField
            label="Insurance Cost"
            name="insuranceCost"
            type="number"
            value={formData.insuranceCost}
            onChange={handleChange}
            min="0"
            step="0.01"
          />
          <InputField
            label="Inland Freight"
            name="inlandfreight1"
            type="number"
            value={formData.inlandfreight1}
            onChange={handleChange}
            min="0"
            step="0.01"
          />
          <InputField
            label="Djibouti Cost"
            name="djibouticost"
            type="number"
            value={formData.djibouticost}
            onChange={handleChange}
            min="0"
            step="0.01"
          />
          <InputField
            label="Other Cost"
            name="othercost1"
            type="number"
            value={formData.othercost1}
            onChange={handleChange}
            min="0"
            step="0.01"
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
                    "Description",
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

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded text-sm ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Submitting..." : "Submit Declaration"}
        </button>
      </form>
    </div>
  );
}