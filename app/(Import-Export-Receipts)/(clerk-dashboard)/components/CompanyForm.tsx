"use client";
import React, { useState } from "react";
import type { CompanyFormData } from "@/lib/types"; // adjust the path as needed

export default function CompanyForm({
  initialData,
  onSubmit,
}: {
  initialData?: Partial<CompanyFormData>;
  onSubmit: (data: CompanyFormData) => void;
}) {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: initialData?.name || "",
    tinNumber: initialData?.tinNumber || "",
    address: initialData?.address || "",
    phone: initialData?.phone || "",
    status: initialData?.status || "active",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-6">
        {/* Company Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
            required
          />
        </div>

        {/* TIN Number Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            TIN Number
          </label>
          <input
            type="text"
            value={formData.tinNumber}
            onChange={(e) =>
              setFormData({ ...formData, tinNumber: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
            required
            maxLength={10}
            pattern="\d{10}"
            title="10 digit number"
          />
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as any })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Additional Fields (Address/Phone) */}
        {formData.address !== undefined && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
            />
          </div>
        )}

        {formData.phone !== undefined && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Company
        </button>
      </div>
    </form>
  );
}
