"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import axios from "axios";
import { SPRING_BASE_URL } from "../../../(local-receipts)/api/api";
import { useAuth } from "../../../Context/AuthContext";

export default function RegisterPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    companyname: "",
    email: "",
    phone_number: "",
    wereda: "",
    kebele: "",
    region: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(true);
// Parse JWT token function
const parseJwt = (token: string): any => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  // Prefill form by fetching user info from backend instead of decoding token
  useEffect(() => {
    const fetchUser = async () => {
      setPrefillLoading(true);
      setError("");
      const currentToken = localStorage.getItem('token');
      const decodedToken = parseJwt(currentToken);
      const userId = decodedToken.user_id;
      try {
        const currentToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const response = await axios.get(`${SPRING_BASE_URL}/user/getuser/${userId}`, {
          headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : undefined,
        });

        const data = response?.data;
        const user = (data && (data.user || data)) || {};
        const company = user.company || user.company_info || {};
        const address = user.address || company.address || {};

        setFormData(prev => ({
          ...prev,
          firstname: user.first_name || user.firstname || user.firstName || "",
          lastname: user.last_name || user.lastname || user.lastName || user.surname || user.family_name || "",
          companyname: user.companyname || company.company_name || company.companyname || user.company_name || "",
          email: user.email || company.email || "",
          phone_number: user.phone_number || user.phone || user.PhoneNumber || company.phone_number || "",
          wereda: user.wereda || company.wereda || address.wereda || "",
          kebele: user.kebele || company.kebele || address.kebele || "",
          region: user.region || company.region || address.region || "",
        }));
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load user data');
      } finally {
        setPrefillLoading(false);
      }
    };

    fetchUser();
  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextValue = name === "tinnumber" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setFormData(prev => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");


    try {
         // Get the token from localStorage since the state might not be updated yet
      const currentToken = localStorage.getItem('token');

        const decodedToken = parseJwt(currentToken);
        const userId = decodedToken.user_id;
      const response = await axios.put(
        `${SPRING_BASE_URL}/user/updateuser/${userId}`,
        formData,
        {
          headers: currentToken
            ? { "Content-Type": "application/json", Authorization: `Bearer ${currentToken}` }
            : { "Content-Type": "application/json" },
        }
      );

      const data = await response.data;
      if (response.status !== 200) throw new Error(data || "Update failed");

      // After successful update, logout and navigate to login page
      logout();
      router.push("/auth/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4 text-black">
      <div className="w-full max-w-4xl">
        <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6 border border-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Update Your Company
            </h1>
            <p className="text-gray-500 font-medium">
              Update your company information
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black"
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
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                type="text"
                disabled={prefillLoading}
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
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                type="text"
                disabled={prefillLoading}
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
              
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                type="text"
                disabled={prefillLoading}
                
              />
            </div>


            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">
                Email
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
               
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                type="email"
                disabled={prefillLoading}
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
              
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition duration-200 placeholder-gray-400"
                type="tel"
                disabled={prefillLoading}
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
                disabled={prefillLoading}
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
                disabled={prefillLoading}

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
                disabled={prefillLoading}
               
              />
            </div>
            <div className="col-span-full pt-4">
              <button
                type="submit"
                disabled={loading || prefillLoading}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 transition duration-200 shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Updating Company...</span>
                  </>
                ) : prefillLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Loading User...</span>
                  </>
                ) : (
                  "Update Company"
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
