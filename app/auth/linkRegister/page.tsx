"use client";
import React, { useState } from "react";
import { Card } from "../../../components/ui/card";
import { useRouter } from "next/navigation";
import axios from "axios";
import { register_api } from "../../api/api";

interface RegisterForm {
  first_name: string;
  last_name: string;
  company_name: string;
  tin_number: string;
  email: string;
  phone_number: string;
  username: string;
  password: string;
  role: string;


  confirmPassword?: string;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  tin_number?: string;
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

export default function Register() {
  const [form, setForm] = useState<RegisterForm>({
    first_name: "",
    last_name: "",
    company_name: "",
    tin_number: "",
    email: "",
    phone_number: "",
    username: "",
    password: "",
    role: "USER",
    confirmPassword: ""
  
   
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [generalError, setGeneralError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError((prevErrors) => ({
      ...prevErrors,
      [e.target.name]: "",
    }));
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email);
  };
  
  const isStrongPassword = (password: string): boolean => {
  const passwordRegex = /^.{6,12}$/;
    return passwordRegex.test(password);
  };
  const isValidTIN = (TIN: string): boolean => {
    const TINRegex = /^[0-9]{9,15}$/;
    return TINRegex.test(TIN);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setIsSubmitting(true);

    const NewErrors: FormErrors = {};
    if (!form.first_name) {
      NewErrors.first_name = "First name is required";
    }
    if (!form.last_name) {
      NewErrors.last_name = "Last name is required";
    }
    if (!form.company_name) {
      NewErrors.company_name = "Company name is required";
    }
    if (!form.email) {
      NewErrors.email = "Email is required";
    }
    if (!isValidEmail(form.email)) {
      NewErrors.email = "Please enter a valid email address";}
    if (!form.username) {
      NewErrors.username = "Username is required";
    }
    if (!form.password) {
      NewErrors.password = "Password is required";
    }
    if (!isStrongPassword(form.password)) { 
      NewErrors.password = "Password must be at least 8 characters long and contain at least one uppercase and one lowercase letter";
    }
    if (form.password !== form.confirmPassword) {
      NewErrors.confirmPassword = "Passwords do not match";
    }
    if (!isValidTIN(form.tin_number)) {
      NewErrors.tin_number = "Company TIN must be greater than 9 digits";
    }
    if (Object.keys(NewErrors).length > 0) {
        setError(NewErrors);
        setIsSubmitting(false);
        return;
      }

try {
  // Omit confirmPassword by creating a new object without it
  const dataToSend = { ...form };
  delete dataToSend.confirmPassword;
  const response = await axios.post(register_api, dataToSend);
  if (response.status === 200) {
    setSuccess(true);
    setTimeout(() => {
      router.push("/auth/login");
    }, 2000); // 2 seconds delay
    return;
  }
} catch (error: unknown) {
  // console.error("Registration failed:", error);
  if (axios.isAxiosError(error)) {
    let backendMessage = "Registration failed. Please try again.";
    if (error.response?.data) {
      if (typeof error.response.data === "string") {
        backendMessage = error.response.data;
      } else if (error.response.data.message) {
        backendMessage = error.response.data.message;
      }
    }
    setGeneralError(backendMessage);
  } else {
    setGeneralError("Registration failed. Please try again.");
  }
  setError((prevErrors) => ({
    ...prevErrors,
    submit: "Registration failed. Please try again later.",
  }));
} finally {
  setIsSubmitting(false);
}
}

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-400 via-blue-200 to-pink-200 overflow-hidden">
      {/* Overlay pattern for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.3)_0,transparent_70%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.2)_0,transparent_70%)] pointer-events-none z-0" />
      <Card className="relative z-10 w-full max-w-4xl shadow-2xl rounded-3xl border-0 bg-white/90 backdrop-blur-md">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-indigo-700 tracking-tight">Register</h2>
        {success ? (
          <div className="text-green-600 text-center font-semibold py-8">Registration successful!</div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 pb-8 pt-2">
            {/* General error message */}
            {generalError && (
              <div className="text-red-600 text-center font-semibold mb-4">{generalError}</div>
            )}
            
            {/* Flex container for form fields */}
            <div className="flex flex-wrap gap-6">
              {/* Left column */}
              <div className="flex-1 min-w-[300px] space-y-4">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-black placeholder-gray-500 bg-white"
                  />
                  {error.first_name && <div className="text-red-500 text-sm">{error.first_name}</div>}
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Lat Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-black placeholder-gray-500 bg-white"
                  />
                  {error.first_name && <div className="text-red-500 text-sm">{error.first_name}</div>}
                </div>
                
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-black placeholder-gray-500 bg-white"
                  />
                  {error.email && <div className="text-red-500 text-sm">{error.email}</div>}
                </div>
                
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">User Name</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-black placeholder-gray-500 bg-white"
                  />
                  {error.username && <div className="text-red-500 text-sm">{error.username}</div>}
                </div>
              </div>
              
              {/* Right column */}
              <div className="flex-1 min-w-[300px] space-y-4">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-black placeholder-gray-500 bg-white pr-10"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        // Eye-off SVG
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M6.343 6.343A7.963 7.963 0 004 9c0 4.418 3.582 8 8 8 1.657 0 3.22-.403 4.575-1.125M17.657 17.657A7.963 7.963 0 0020 15c0-4.418-3.582-8-8-8-1.657 0-3.22.403-4.575 1.125M3 3l18 18" /></svg>
                      ) : (
                        // Eye SVG
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                  {error.password && <div className="text-red-500 text-sm">{error.password}</div>}
                </div>
                
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-black placeholder-gray-500 bg-white pr-10"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? (
                        // Eye-off SVG
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M6.343 6.343A7.963 7.963 0 004 9c0 4.418 3.582 8 8 8 1.657 0 3.22-.403 4.575-1.125M17.657 17.657A7.963 7.963 0 0020 15c0-4.418-3.582-8-8-8-1.657 0-3.22.403-4.575 1.125M3 3l18 18" /></svg>
                      ) : (
                        // Eye SVG
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                  {error.confirmPassword && <div className="text-red-500 text-sm">{error.confirmPassword}</div>}
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Company Name</label>
                  <input
                    type="text"
                    name="company_name"
                    value={form.company_name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-black placeholder-gray-500 bg-white"
                  />
                  {error.company_name && <div className="text-red-500 text-sm">{error.company_name}</div>}
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">TIN Number</label>
                  <input
                    type="text"
                    name="tin_number"
                    value={form.tin_number}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-black placeholder-gray-500 bg-white"
                    placeholder="Enter your company TIN"
                  />
                  {error.tin_number && <div className="text-red-500 text-sm">{error.tin_number}</div>}
                </div>
              </div>
            </div>
            
            {/* Submit button - full width below the flex container */}
            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 text-white py-2.5 px-8 rounded-lg font-bold shadow-md hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Registering...</span>
                  </>
                ) : (
                  <span>Register</span>
                )}
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
} 