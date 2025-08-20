"use client";

import { useState, useEffect } from "react";
import { BASE_API_URL } from "../../import-api/ImportApi";

type Item = {
  id: string;
  description: string;
  glAccount: string;
  uom: string;
  unit: string;
};

export default function ItemDetailsForm() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [formData, setFormData] = useState({
    glAccount: "",
    description: "",
    uom: "",
    unit: "",
    quantity: "",
    unitCost: "",
    dpvAmount: "",
  });

  // Mock fetch from item management
  useEffect(() => {
    const mockItems: Item[] = [
      {
        id: "1",
        description: "Laptop",
        glAccount: "1100",
        uom: "Pieces",
        unit: "Unit-A",
      },
      {
        id: "2",
        description: "Desktop",
        glAccount: "1101",
        uom: "Pieces",
        unit: "Unit-B",
      },
      {
        id: "3",
        description: "Printer",
        glAccount: "1102",
        uom: "Pieces",
        unit: "Unit-C",
      },
    ];
    setItems(mockItems);
  }, []);

  useEffect(() => {
    const item = items.find((i) => i.id === selectedItemId);
    if (item) {
      setFormData((prev) => ({
        ...prev,
        description: item.description,
        glAccount: item.glAccount,
        uom: item.uom,
        unit: item.unit,
      }));
    }
  }, [selectedItemId, items]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "quantity" || name === "unitCost") {
      const qty =
        name === "quantity" ? Number(value) : Number(formData.quantity);
      const cost =
        name === "unitCost" ? Number(value) : Number(formData.unitCost);
      setFormData((prev) => ({
        ...prev,
        dpvAmount: (qty * cost).toFixed(2),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Item Detail Submitted:", formData);
    // TODO: Submit to backend or localStorage
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-8 mt-10 space-y-6"
    >
      <h2 className="text-2xl font-bold text-center">Item Detail Form</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Item Description
          </label>
          <select
            name="description"
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="">Select an item</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.description}
              </option>
            ))}
          </select>
        </div>

        <InputField
          label="GL Account"
          name="glAccount"
          value={formData.glAccount}
          disabled
        />
        <InputField
          label="Unit of Measurement"
          name="uom"
          value={formData.uom}
          disabled
        />
        <InputField label="Units" name="unit" value={formData.unit} disabled />
        <InputField
          label="Quantity"
          name="quantity"
          value={formData.quantity}
          type="number"
          onChange={handleChange}
        />
        <InputField
          label="Unit Cost"
          name="unitCost"
          value={formData.unitCost}
          type="number"
          onChange={handleChange}
        />
        <InputField
          label="DPV Amount"
          name="dpvAmount"
          value={formData.dpvAmount}
          disabled
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
      >
        Submit Item
      </button>
    </form>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full border border-gray-300 rounded px-3 py-2 bg-white disabled:bg-gray-100"
        required={!disabled}
      />
    </div>
  );
}
