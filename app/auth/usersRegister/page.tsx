"use client";
import React, { useState } from "react";
import { Card } from "../../../components/ui/card";
import { useRouter } from "next/navigation";
import axios from "axios";
import { SPRING_BASE_URL } from "@/app/(local-receipts)/api/api";

interface RegisterForm {
  firstname: string;
  lastname: string;
  email: string
  role: string;
  username: string,
  password: string;
}

interface FormErrors {
  firstname?: string;
  lastname?: string;
  email?: string;
  role?: string;
  username?: string;
  password?: string;
}

export default function Register() {
  const [form, setForm] = useState<RegisterForm>({
    firstname: "",
    lastname: "",
    email: "",
    role: "CLERK", // Set default role to CLERK
    username: "",
    password: "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [generalError, setGeneralError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    if (!form.firstname) {
      NewErrors.firstname = "First name is required";
    }
    if (!form.lastname) {
      NewErrors.lastname = "Last name is required";
    }
    if (!form.email) {
      NewErrors.email = "Email is required";
    }
    if (!isValidEmail(form.email)) {
      NewErrors.email = "Please enter a valid email address";
    }
    if (!form.role) {
      NewErrors.role = "Role is required";
    }
    if (Object.keys(NewErrors).length > 0) {
        setError(NewErrors);
        setIsSubmitting(false);
        return;
      }
      const userId = localStorage.getItem("userId");
      
      // Check if userId exists
      if (!userId) {
        setGeneralError("User ID not found. Please log in again.");
        setIsSubmitting(false);
        return;
      }
      
    
      try {
        // Omit confirmPassword by creating a new object without it
        const dataToSend = { ...form };
        const response = await axios.post(`${SPRING_BASE_URL}/user/superroleRegister/${userId}`, dataToSend);
  if (response.status === 200) {
    setSuccess(true);
    setTimeout(() => {
      router.push("/userinfo");
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
                    name="firstname"
                    value={form.firstname}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-black placeholder-gray-500 bg-white"
                  />
                  {error.firstname && <div className="text-red-500 text-sm">{error.firstname}</div>}
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Lat Name</label>
                  <input
                    type="text"
                    name="lastname"
                    value={form.lastname}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-black placeholder-gray-500 bg-white"
                  />
                  {error.lastname && <div className="text-red-500 text-sm">{error.lastname}</div>}
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
<div>
  <label className="block mb-2 font-semibold text-gray-700">Role</label>
  <select 
    name="role" 
    value={form.role} 
    onChange={handleChange} 
    required 
    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-black placeholder-gray-500 bg-white"
  >
    <option value="CLERK">Clerk</option>
    <option value="ACCOUNTANT">Accountant</option> 
  </select>
  {error.role && <div className="text-red-500 text-sm">{error.role}</div>}
</div>


                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-black placeholder-gray-500 bg-white"
                  />
                  {error.password && <div className="text-red-500 text-sm">{error.password}</div>}
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