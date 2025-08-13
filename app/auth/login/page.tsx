"use client";
import React, { useState, useEffect } from "react";
import { Card} from "../../../components/ui/card";
import { useRouter } from "next/navigation";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import { useAuth } from "../../Context/AuthContext";

interface LoginForm {
  username: string;
  password: string;
}
interface FormErrors {
  username?: string;
  password?: string;
  serverError?: string;
}
interface loginresponse{
  token: string;
  email: string;
}

interface DecodedToken {
  roles: string;
}

export default function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isLoading, error, clearError, user, token } = useAuth();
  const router = useRouter();

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Parse JWT token function
  const parseJwt = (token: string): any => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
    }
    // Clear specific field error
    if (errors[e.target.name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!form.username || form.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters.";
    }
    if (!form.password || form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setIsSubmitting(true);
    
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const userData = await login(form.username, form.password);
      setForm({ username: "", password: "" });
      
      // Add a small delay to ensure token is stored
      await new Promise(resolve => setTimeout(resolve, 5));
      
      // Get the token from localStorage since the state might not be updated yet
      const currentToken = localStorage.getItem('token');
      //console.log('Login successful, checking token:', !!currentToken);
      
      if (currentToken) {
        try {
          const decodedToken = parseJwt(currentToken);
          //console.log('Decoded token:', decodedToken);
          const roles = decodedToken.roles;
          const userId = decodedToken.user_id;
          localStorage.setItem("userId", userId);
          //console.log('User roles:', roles); // Debug log
          
          if (roles && Array.isArray(roles)) {
            if (roles.includes("ACCOUNTANT")) {
              router.push("/accountant-dashboard");
            } else if (roles.includes("CLERK")) {
              router.push("/local-Import");
            } else if (roles.includes("ADMIN")) {
              router.push("/auth/admin");
            } else if (roles.includes("USER")) {
              router.push("/owner");
            }
          } else {
      
            router.push("/");
          }
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          //console.log('Token content:', currentToken);
          // Fallback navigation
          router.push("/(local-receipts)/userinfo");
        }
      } else {
        console.error('No token found after login');
        // Fallback navigation
        router.push("/(local-receipts)/userinfo");
      }

    } catch (err) {
      console.error('Login error:', err);
      // Set server error if available
      if (error) {
        setErrors(prev => ({ ...prev, serverError: error }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while authentication context is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f7faff] to-[#f3f6fd] px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100">
      <Card className="w-full max-w-md shadow-xl rounded-2xl border-0 bg-white/90 backdrop-blur-md">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-indigo-700 tracking-tight drop-shadow">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-8 pt-2">
          {/* Server Error Display */}
          {errors.serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errors.serverError}
            </div>
          )}
          
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition shadow-sm bg-white text-black placeholder-gray-500 ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your username"
              disabled={isSubmitting}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>
          
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition shadow-sm bg-white text-black placeholder-gray-500 pr-10 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isSubmitting}
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
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            <div className="flex justify-end mt-2">
              <Link
                href="/auth/forgetPassword"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-150 focus:underline focus:outline-none"
                tabIndex={0}
              >
                Forgot password?
              </Link>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-2.5 px-8 rounded-lg font-bold shadow-md hover:from-indigo-600 hover:to-blue-700 transition-all text-lg tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-400 flex items-center space-x-2 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}