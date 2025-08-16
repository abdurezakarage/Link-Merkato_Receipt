"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaSpinner } from "react-icons/fa";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    companyname: "",
    tinnumber: "",
    email: "",
    phone_number: "",
    wereda: "",
    kebele: "",
    region: "",
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Special handling for TIN number
    if (name === "tinnumber") {
      // Only allow numbers and limit to 10 digits
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate TIN number is exactly 10 digits
    if (formData.tinnumber.length !== 10) {
      setError("TIN number must be exactly 10 digits");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://api.import.linkmerkato.com.et/api/v1/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.text();
      if (!response.ok) throw new Error(data || "Registration failed");

      router.push("auth/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6 border border-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-500 font-medium">
              Join us to get started with your business management
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center col-span-full border border-red-100">
                {error}
              </div>
            )}

            <div className="col-span-full">
              <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center before:content-[''] before:block before:w-1 before:h-6 before:bg-blue-500 before:mr-2 before:rounded-full">
                Personal Information
              </h2>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">
                First Name
              </label>
              <input
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                type="text"
                placeholder="Enter your first name"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">
                Last Name
              </label>
              <input
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                type="text"
                placeholder="Enter your last name"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">
                Company Name
              </label>
              <input
                name="companyname"
                value={formData.companyname}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                type="text"
                placeholder="Enter company name"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">
                TIN Number <span className="text-gray-400">(10 digits)</span>
              </label>
              <input
                name="tinnumber"
                value={formData.tinnumber}
                onChange={handleChange}
                required
                pattern="\d{10}"
                title="TIN number must be 10 digits"
                maxLength={10}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                type="text"
                inputMode="numeric"
                placeholder="Enter 10-digit TIN"
              />
              {formData.tinnumber && formData.tinnumber.length !== 10 && (
                <p className="text-red-500 text-xs mt-1">
                  TIN number must be exactly 10 digits
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">
                Email
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                type="email"
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">
                Phone Number
              </label>
              <input
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                type="tel"
                placeholder="Enter phone number"
              />
            </div>

            <div className="col-span-full mt-2">
              <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center before:content-[''] before:block before:w-1 before:h-6 before:bg-blue-500 before:mr-2 before:rounded-full">
                Address Information
              </h2>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">
                Wereda
              </label>
              <input
                name="wereda"
                value={formData.wereda}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                type="text"
                placeholder="Enter wereda"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">
                Kebele
              </label>
              <input
                name="kebele"
                value={formData.kebele}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                type="text"
                placeholder="Enter kebele"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">
                Region
              </label>
              <input
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                type="text"
                placeholder="Enter region"
              />
            </div>

            <div className="col-span-full mt-2">
              <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center before:content-[''] before:block before:w-1 before:h-6 before:bg-blue-500 before:mr-2 before:rounded-full">
                Account Details
              </h2>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">
                Username
              </label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                type="text"
                placeholder="Choose a username"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">
                Password
              </label>
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                type="password"
                placeholder="Create a password"
              />
            </div>

            <div className="col-span-full pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 transition duration-200 shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          <div className="text-center text-sm pt-2">
            <p className="text-gray-500">
              Already have an account?{" "}
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 font-medium transition duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
