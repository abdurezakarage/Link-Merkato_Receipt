"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
// Assuming DatePicker and format/parse functions are available from your setup
// For demonstration, I'm providing dummy implementations if you don't have them
// If you're using 'react-datepicker' and 'date-fns', ensure they are installed.
import PreviewModal from "../declaration/preview/PreviewModal"; // Keep your existing modal import

// Dummy DatePicker and date-fns functions if not installed. Replace with actual imports if you have them.
const DatePicker = (props: any) => (
  <input
    type="date"
    {...props}
    value={
      props.selected ? new Date(props.selected).toISOString().split("T")[0] : ""
    }
    onChange={(e) =>
      props.onChange(e.target.value ? new Date(e.target.value) : null)
    }
  />
);
const format = (date: Date, fmt: string) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  if (fmt === "dd-MM-yyyy") return `${day}-${month}-${year}`;
  if (fmt === "dd/MM/yyyy") return `${day}/${month}/${year}`;
  return date.toISOString().split("T")[0]; // Default for simplicity
};
const parse = (dateString: string, fmt: string, baseDate: Date) => {
  if (!dateString) return null;
  const parts = dateString.split(fmt.includes("-") ? "-" : "/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateString); // Fallback for other formats
};

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// --- Type Definitions ---
type TaxDto = {
  name: string;
  value: number | null;
  codename: string;
  percentage?: number | null;
};

type ItemManagementDto = {
  hscode: string;
  itemdescription: string;
  unitofmeasurement: string;
  quantity: number | null;
  unitCost: number | null;
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

// --- Tax Options ---
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
      <label htmlFor={name} className="font-medium mb-1 text-sm text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value === null ? "" : value}
        onChange={onChange}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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

// ItemPage component now renders as a standalone form section
function ItemFormPage({
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
    field: keyof ItemManagementDto,
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
    taxIndex: number,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedTax = TAX_OPTIONS.find((opt) => opt.name === e.target.value);
    if (selectedTax) {
      handleTaxChange(index, taxIndex, "name", selectedTax.name);
      handleTaxChange(index, taxIndex, "value", selectedTax.value);
      handleTaxChange(index, taxIndex, "codename", selectedTax.codename);
      handleTaxChange(
        index,
        taxIndex,
        "percentage",
        selectedTax.percentage ?? selectedTax.value * 100
      );
    }
  };

  const handleTaxPercentageChange = (
    taxIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = e.target.value;
    const percentageValue = inputValue === "" ? null : parseFloat(inputValue);
    const decimalValue =
      percentageValue === null ? null : percentageValue / 100;

    handleTaxChange(index, taxIndex, "value", decimalValue);
    handleTaxChange(index, taxIndex, "percentage", percentageValue);
  };

  return (
    <div className="space-y-6 border p-6 rounded-lg bg-gray-50 shadow-sm">
      <h4 className="font-bold text-lg text-gray-800">
        Item #{index + 1} Details
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="HS Code"
          name="hscode"
          value={item.hscode}
          onChange={(e) => handleItemChange(index, "hscode", e.target.value)}
        />
        <InputField
          label="Item Description"
          name="itemdescription"
          value={item.itemdescription}
          onChange={(e) =>
            handleItemChange(index, "itemdescription", e.target.value)
          }
          // placeholder="e.g., Smartphone"
        />
        <div className="flex flex-col w-full">
          <label className="font-medium mb-1 text-sm text-gray-700">
            Unit of Measurement <span className="text-red-500">*</span>
          </label>
          <UnitOfMeasurementDropdown
            value={item.unitofmeasurement}
            onChange={(e) =>
              handleItemChange(index, "unitofmeasurement", e.target.value)
            }
          />
          {item.unitofmeasurement === "OTHER" && (
            <input
              type="text"
              value={item.unitofmeasurement}
              onChange={(e) =>
                handleItemChange(index, "unitofmeasurement", e.target.value)
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Specify unit"
              required
            />
          )}
        </div>
        <InputField
          label="Quantity"
          name="quantity"
          type="number"
          value={item.quantity}
          onChange={(e) =>
            handleItemChange(
              index,
              "quantity",
              e.target.value === "" ? null : Number(e.target.value)
            )
          }
          min="1"
          step="any"
          placeholder="e.g., 10"
        />
        <InputField
          label="Unit Cost"
          name="unitCost"
          type="number"
          value={item.unitCost}
          onChange={(e) =>
            handleItemChange(
              index,
              "unitCost",
              e.target.value === "" ? null : parseFloat(e.target.value)
            )
          }
          min="0"
          step="any"
          placeholder="e.g., 150.00"
        />
      </div>

      <h5 className="font-bold text-md mt-6 text-gray-800">
        Taxes for Item #{index + 1}
      </h5>
      <div className="space-y-4">
        {item.taxApplicationdto.length === 0 && (
          <p className="text-sm text-gray-600 italic">
            No taxes added for this item yet.
          </p>
        )}
        {item.taxApplicationdto.map((tax, taxIndex) => (
          <div
            key={taxIndex}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t pt-4 border-gray-200"
          >
            <div className="flex flex-col">
              <label className="font-medium mb-1 text-xs text-gray-700">
                Tax Type <span className="text-red-500">*</span>
              </label>
              <select
                value={tax.name}
                onChange={(e) => handleTaxSelect(taxIndex, e)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              >
                <option value="">Select Tax</option>
                {TAX_OPTIONS.map((option) => (
                  <option key={option.codename} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-1 text-xs text-gray-700">
                Percentage (%) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={tax.percentage === null ? "" : tax.percentage}
                  onChange={(e) => handleTaxPercentageChange(taxIndex, e)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                  min="0"
                  placeholder="15"
                  step="any"
                />
                <span className="ml-2 text-sm text-gray-600">%</span>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-1 text-xs text-gray-700">
                Codename
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={tax.codename}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => removeItemTax(index, taxIndex)}
                  className="text-red-600 hover:text-red-800 text-sm flex-shrink-0 px-2 py-1 rounded-md"
                  title="Remove this tax"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addItemTax(index)}
          className="mt-4 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-md text-sm transition-colors flex items-center justify-center space-x-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Add Tax to Item #{index + 1}</span>
        </button>
      </div>
      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={() => removeItem(index)}
          className="text-red-600 hover:text-red-800 text-sm px-3 py-1 rounded-md transition-colors"
        >
          Remove This Item
        </button>
      </div>
    </div>
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
    taxApplicationdto: [], // This will be used for the final submission only
  });
  // page: 1 = General Info, 2 to (N+1) = Item pages, (N+2) = Summary Page
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // General form field change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("amount") ||
        name.includes("Cost") ||
        name.includes("rate")
          ? value === ""
            ? null
            : parseFloat(value)
          : value,
    }));
  };

  // TIN number specific change handler (with validation pattern)
  const handleTinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setTinNumber(value);
    }
  };

  // Handler for changes within a specific item's fields
  const handleItemChange = (
    index: number,
    field: keyof ItemManagementDto,
    value: any
  ) => {
    const newItems = [...formData.itemManagementdto];
    newItems[index] = {
      ...newItems[index],
      [field]:
        field === "quantity"
          ? value === ""
            ? null
            : Math.max(1, Number(value)) // Ensure quantity is at least 1
          : field === "unitCost"
          ? value === ""
            ? null
            : parseFloat(value)
          : value,
    };
    setFormData({ ...formData, itemManagementdto: newItems });
  };

  // Handler for changes within a specific tax of a specific item
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

  // Adds a new, empty item to the formData
  const addNewItem = () => {
    setFormData((prev) => ({
      ...prev,
      itemManagementdto: [
        ...prev.itemManagementdto,
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
          ], // Start with one empty tax field for convenience
        },
      ],
    }));
  };

  // Adds a new, empty tax field to a specific item
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

  // Removes a specific item from the formData
  const removeItem = (index: number) => {
    const newItems = formData.itemManagementdto.filter((_, i) => i !== index);
    setFormData({ ...formData, itemManagementdto: newItems });

    // Adjust page navigation after item removal
    if (page > index + 2) {
      // If currently on a page after the removed item
      setPage(page - 1);
    } else if (page === index + 2 && newItems.length > 0) {
      // If removed current item and there are still items
      setPage(index + 2); // Stay on current "item page number" (which will now be the next item)
    } else if (newItems.length === 0 && page > 1) {
      // If last item removed and not on general info page
      setPage(1); // Go back to general info page
    } else if (page === newItems.length + 2 && newItems.length > 0) {
      // If removed an item and we're currently on the summary page
      // and there are still items, stay on summary (its page index changes)
      setPage(newItems.length + 2);
    } else {
      setPage(1); // Default to page 1 if all items removed
    }
  };

  // Removes a specific tax from a specific item
  const removeItemTax = (itemIndex: number, taxIndex: number) => {
    const newItems = [...formData.itemManagementdto];
    newItems[itemIndex].taxApplicationdto = newItems[
      itemIndex
    ].taxApplicationdto.filter((_, i) => i !== taxIndex);
    setFormData({ ...formData, itemManagementdto: newItems });
  };

  // --- Validation Functions ---
  const validatePage1 = () => {
    if (!tinNumber) {
      setError("TIN number is required.");
      return false;
    }
    if (!/^\d{10}$/.test(tinNumber)) {
      setError("TIN number must be exactly 10 digits.");
      return false;
    }
    if (!formData.custombranchname) {
      setError("Branch name is required.");
      return false;
    }
    if (!formData.declarationnumber) {
      setError("Declaration number is required.");
      return false;
    }
    if (!formData.declarationdispensedate) {
      setError("Declaration date is required.");
      return false;
    }
    if (formData.fobamountusdt === null || formData.fobamountusdt < 0) {
      setError("FOB amount (USD) is required and cannot be negative.");
      return false;
    }
    if (formData.exchangerate === null || formData.exchangerate < 0) {
      setError("Exchange rate is required and cannot be negative.");
      return false;
    }
    setError(""); // Clear error if validation passes
    return true;
  };

  const validateItemPage = (item: ItemManagementDto, index: number) => {
    if (!item.hscode) {
      setError(`HS Code is required for Item ${index + 1}.`);
      return false;
    }
    if (!item.itemdescription) {
      setError(`Description is required for Item ${index + 1}.`);
      return false;
    }
    if (item.quantity === null || item.quantity <= 0) {
      setError(
        `Quantity is required and must be greater than 0 for Item ${index + 1}.`
      );
      return false;
    }
    if (item.unitCost === null || item.unitCost < 0) {
      setError(
        `Unit cost is required and cannot be negative for Item ${index + 1}.`
      );
      return false;
    }
    if (!item.unitofmeasurement) {
      setError(`Unit of measurement is required for Item ${index + 1}.`);
      return false;
    }

    if (item.taxApplicationdto.length === 0) {
      setError(`At least one tax is required for Item ${index + 1}.`);
      return false;
    }

    // Validate each tax for the current item
    for (const tax of item.taxApplicationdto) {
      if (!tax.name) {
        setError(`Tax type is required for a tax in Item ${index + 1}.`);
        return false;
      }
      if (tax.value === null || tax.value < 0) {
        setError(
          `Tax value (percentage) is required and cannot be negative for a tax in Item ${
            index + 1
          }.`
        );
        return false;
      }
    }
    setError(""); // Clear error if validation passes
    return true;
  };

  const validateAllItems = () => {
    if (formData.itemManagementdto.length === 0) {
      setError("At least one item is required for submission.");
      return false;
    }
    for (let i = 0; i < formData.itemManagementdto.length; i++) {
      if (!validateItemPage(formData.itemManagementdto[i], i)) {
        return false; // Stop and show specific item error
      }
    }
    setError("");
    return true;
  };

  // --- Navigation Logic ---
  const handleGoNext = () => {
    setError(""); // Clear previous errors

    if (page === 1) {
      // Validate general info page
      if (validatePage1()) {
        // If no items exist, add the first one when moving from page 1
        if (formData.itemManagementdto.length === 0) {
          addNewItem(); // Adds a new item to state
          setPage(2); // Move to the first item page (page 2)
        } else {
          // If items already exist, go to the first item page
          setPage(2);
        }
      }
    } else if (page >= 2 && page <= formData.itemManagementdto.length + 1) {
      // On an item page, clicking next means validate current and add new
      const currentItemIndex = page - 2;
      if (
        validateItemPage(
          formData.itemManagementdto[currentItemIndex],
          currentItemIndex
        )
      ) {
        addNewItem(); // Add a new empty item
        setPage(page + 1); // Go to the newly added item's page
      }
    }
  };

  const handleGoToSummary = () => {
    setError("");
    // Validate the current item before going to summary
    if (page >= 2 && page <= formData.itemManagementdto.length + 1) {
      const currentItemIndex = page - 2;
      if (
        validateItemPage(
          formData.itemManagementdto[currentItemIndex],
          currentItemIndex
        )
      ) {
        setPage(formData.itemManagementdto.length + 2); // Go to summary page
      }
    } else {
      // This case handles if "Go to Summary" is clicked from page 1 without items,
      // or just to ensure we always land on summary correctly.
      setPage(formData.itemManagementdto.length + 2);
    }
  };

  const handleGoBack = () => {
    setError("");
    setPage(page - 1);
  };

  // --- Form Submission and Preview ---
  const handlePreview = () => {
    try {
      if (!validatePage1()) return; // Validate general info first
      if (!validateAllItems()) return; // Validate all items before preview
      setShowPreview(true);
      setError("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditSave = (editedData: FormData) => {
    setFormData(editedData);
    setShowPreview(false); // Optionally close the modal after saving
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!validatePage1()) {
        setPage(1); // Go back to page 1 if general info is invalid
        return;
      }
      if (!validateAllItems()) {
        setPage(2); // Go back to first item if items are invalid
        return;
      }

      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const roles = JSON.parse(localStorage.getItem("roles") || "[]");

      if (!token || !userId) {
        throw new Error("Session expired. Please log in again.");
      }

      if (!roles.includes("CLERK")) {
        throw new Error("You don't have permission to submit declarations.");
      }

      // Aggregate all unique taxes from all items for the main form submission
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
        // Convert null values to 0 for backend where applicable
        fobamountusdt: formData.fobamountusdt || 0,
        exchangerate: formData.exchangerate || 0,
        externalfreight: formData.externalfreight || 0,
        insuranceCost: formData.insuranceCost || 0,
        inlandfreight1: formData.inlandfreight1 || 0,
        djibouticost: formData.djibouticost || 0,
        othercost1: formData.othercost1 || 0,
        // Map item data, ensuring quantity/unitCost are not null
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
        `${BASE_API_URL}/api/v1/clerk/declarationInfo/${tinNumber}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submissionData),
        }
      );

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      if (!response.ok) {
        alert(
          typeof responseData === "object"
            ? responseData.message || "Submission failed"
            : responseData || "Submission failed"
        );
        return;
      }

      const successMessage =
        typeof responseData === "object"
          ? responseData.message || "Declaration submitted successfully!"
          : responseData || "Declaration submitted successfully!";

      alert(successMessage);

      // Reset form after successful submission
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
      setPage(1); // Go back to the first page
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
        router.push("/companies");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Render Content based on Page State ---
  const renderContent = () => {
    if (page === 1) {
      return (
        <>
          <h3 className="text-md font-bold mb-4 text-gray-800">
            Step 1: General Declaration Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="TIN Number (10 digits)"
              name="tinNumber"
              value={tinNumber}
              onChange={handleTinChange}
              placeholder="Enter 10 digit TIN"
            />
            <InputField
              label="Custom Branch Name"
              name="custombranchname"
              value={formData.custombranchname}
              onChange={handleChange}
              placeholder="e.g., Addis Ababa Customs"
            />
            <InputField
              label="Declaration Number"
              name="declarationnumber"
              value={formData.declarationnumber}
              onChange={handleChange}
              // placeholder="e.g., DECL12345"
            />
            <InputField
              label="Declaration Dispense Date"
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
              placeholder="e.g., 5000.00"
            />
            <InputField
              label="Exchange Rate"
              name="exchangerate"
              type="number"
              value={formData.exchangerate}
              onChange={handleChange}
              min="0"
              step="any"
              // placeholder="e.g., 55.00"
            />
            <InputField
              label="External Freight"
              name="externalfreight"
              type="number"
              value={formData.externalfreight}
              onChange={handleChange}
              min="0"
              step="any"
              // placeholder="e.g., 200.00"
            />
            <InputField
              label="Insurance Cost"
              name="insuranceCost"
              type="number"
              value={formData.insuranceCost}
              onChange={handleChange}
              min="0"
              step="any"
              required={false}

              // placeholder="e.g., 50.00"
            />
            <InputField
              label="Inland Freight"
              name="inlandfreight1"
              type="number"
              value={formData.inlandfreight1}
              onChange={handleChange}
              min="0"
              step="any"
              required={false}
              // placeholder="e.g., 100.00"
            />
            <InputField
              label="Djibouti Cost"
              name="djibouticost"
              type="number"
              value={formData.djibouticost}
              onChange={handleChange}
              min="0"
              step="any"
              required={false}

              // placeholder="e.g., 30.00"
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
              // placeholder="e.g., 20.00 (Optional)"
            />
          </div>
          <div className="flex justify-end mt-8">
            <button
              type="button"
              onClick={handleGoNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-md text-lg shadow-md transition-colors"
            >
              Add First Item
            </button>
          </div>
        </>
      );
    }

    // Dynamic item pages
    if (page >= 2 && page <= formData.itemManagementdto.length + 1) {
      const currentItemIndex = page - 2;
      return (
        <>
          <h3 className="text-md font-bold mb-4 text-gray-800">
            Step {page - 1}: Item Details and Taxes
          </h3>
          <ItemFormPage
            item={formData.itemManagementdto[currentItemIndex]}
            index={currentItemIndex}
            handleItemChange={handleItemChange}
            handleTaxChange={handleTaxChange}
            addItemTax={addItemTax}
            removeItemTax={removeItemTax}
            removeItem={removeItem}
          />
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={handleGoBack}
              className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-md text-sm transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleGoNext}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md text-sm transition-colors"
            >
              Save & Add Another Item
            </button>
            <button
              type="button"
              onClick={handleGoToSummary}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md text-sm transition-colors"
            >
              Go to Summary
            </button>
          </div>
        </>
      );
    }

    // Summary Page
    if (page === formData.itemManagementdto.length + 2) {
      return (
        <>
          <h3 className="text-md font-bold mb-4 text-gray-800">
            Step {formData.itemManagementdto.length + 1}: Review and Submit
          </h3>
          <p className="text-sm text-gray-700 mb-6 bg-blue-50 p-4 rounded-md border border-blue-200">
            You have finished adding all your items. Review the complete
            declaration below. You can still go back to edit, or add more items
            if needed.
          </p>

          <h4 className="font-semibold text-lg text-gray-800 mb-4">
            Summary of Items
          </h4>
          {formData.itemManagementdto.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Item #",
                      "HS Code",
                      "Description",
                      "Unit",
                      "Qty",
                      "Unit Cost",
                      "Total Item Cost",
                      "Taxes Applied",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.itemManagementdto.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        {item.hscode}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {item.itemdescription}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        {item.unitofmeasurement}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        {item.unitCost?.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 font-semibold">
                        {item.quantity && item.unitCost
                          ? (item.quantity * item.unitCost).toFixed(2)
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {item.taxApplicationdto.length > 0 ? (
                          <ul className="list-disc list-inside text-xs">
                            {item.taxApplicationdto.map((tax, taxIdx) => (
                              <li key={taxIdx}>
                                {tax.name}: {tax.percentage}%
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "No Taxes"
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => setPage(idx + 2)} // Go to this item's edit page
                          className="text-indigo-600 hover:text-indigo-900 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 italic mb-6">
              No items added yet. Please add an item to proceed.
            </p>
          )}

          {/* Action buttons on the Summary page */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={handleGoBack}
              className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-md text-sm transition-colors"
            >
              Back
            </button>
            {/* New button to add more items from summary */}
            <button
              type="button"
              onClick={() => {
                addNewItem(); // Add a new item
                setPage(formData.itemManagementdto.length + 2); // Go to the page of the newly added item
              }}
              className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-6 rounded-md text-sm transition-colors"
            >
              Add More Items
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md text-sm transition-colors"
            >
              Preview Declaration
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md text-sm transition-colors ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Submitting..." : "Submit Declaration"}
            </button>
          </div>
        </>
      );
    }
  };

  return (
    <div className="w-full max-w-[100vw] px-2 md:px-4 overflow-hidden">
      <form
        onSubmit={handleSubmit}
        className="w-full mx-auto bg-white rounded-lg p-4 md:p-6 space-y-6 shadow-xl"
      >
        <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-6">
          Customs Declaration Form
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md animate-fade-in">
            {error}
          </div>
        )}

        {renderContent()}
      </form>

      {showPreview && (
        <PreviewModal
          tinNumber={tinNumber}
          formData={formData}
          onClose={() => setShowPreview(false)}
          onEdit={handleEditSave}
        />
      )}
    </div>
  );
}

export type { TaxDto, ItemManagementDto, FormData };
