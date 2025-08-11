"use client";
import React, { useState } from "react";
import axios from "axios";
import { request_otp_api, verify_otp_api, forgot_password_api, resend_otp_api } from "@/app/api/api";
import { useRouter } from "next/navigation";

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-12 h-12 text-blue-500 mx-auto mb-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V7.5A4.5 4.5 0 008 7.5v3m8.25 0h-8.5A2.25 2.25 0 005.5 12.75v6A2.25 2.25 0 007.75 21h8.5A2.25 2.25 0 0018.5 18.75v-6A2.25 2.25 0 0016.25 10.5z"
    />
  </svg>
);

const ForgetPasswordPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newpassword, setNewPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await axios.post(`${request_otp_api}`, { email });
      const data = res.data;
      if (res.status === 200) {
        setMessage("OTP sent to your email. Please check your inbox.");
        setStep(2);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error || "Network error. Please try again."
        );
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await axios.post(`${verify_otp_api}`, { email, otp });
      const data = res.data;
      if (res.status === 200) {
        setMessage("OTP verified. Please enter your new password.");
        setStep(3);
      } else {
        setError(data.error || "Invalid OTP. Please try again.");
      }
    } catch (error: unknown) {
      // console.error("Verify OTP failed:", error);
      let backendMessage = "Could not verify OTP. Please try again.";
      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          if (typeof error.response.data === "string") {
            backendMessage = error.response.data;
          } else if (error.response.data.error) {
            backendMessage = error.response.data.error;
          } else if (error.response.data.message) {
            backendMessage = error.response.data.message;
          }
        }
      }
      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    if (newpassword !== confirmpassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.put(`${forgot_password_api}`, {
        email,
        newpassword,
      });
      const data = res.data;
      if (res.status === 200) {
        setMessage(
          "Password reset successful! You can now log in with your new password."
        );
        setStep(1);
        setEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          router.push("/auth/login");
        });
      } else {
        setError(data.error || "Could not reset password. Please try again.");
      }
    } catch (error: unknown) {
      // console.error("Resend OTP failed:", error);
      let backendMessage = "Could not resend OTP. Please try again.";
      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          if (typeof error.response.data === "string") {
            backendMessage = error.response.data;
          } else if (error.response.data.error) {
            backendMessage = error.response.data.error;
          } else if (error.response.data.message) {
            backendMessage = error.response.data.message;
          }
        }
      }
      setError(backendMessage);
    }
    finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setResendLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await axios.post(`${resend_otp_api}`, email, {
        headers: { "Content-Type": "text/plain" }
      });
      if (res.status === 200) {
        setMessage("OTP resent to your email. Please check your inbox.");
        setResendCooldown(30);
      } else {
        setError(res.data?.error || "Could not resend OTP. Please try again.");
      }
    } catch (error: unknown) {
      // console.error("Resend OTP failed:", error);
      let backendMessage = "Could not resend OTP. Please try again.";
      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          if (typeof error.response.data === "string") {
            backendMessage = error.response.data;
          } else if (error.response.data.error) {
            backendMessage = error.response.data.error;
          } else if (error.response.data.message) {
            backendMessage = error.response.data.message;
          }
        }
      }
      setError(backendMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl flex flex-col items-center animate-fade-in">
        <LockIcon />
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">
          Forgot Password
        </h1>
        <p className="text-gray-500 mb-6 text-center">
          {step === 1
            ? "Enter your email to receive OTP."
            : step === 2
            ? "Enter the OTP sent to your email."
            : "Enter your new password."}
        </p>
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="w-full space-y-4">
            <div>
              <label
                className="block text-gray-700 text-sm font-semibold mb-1"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-gray-900 bg-white"
                placeholder="Enter your email"
              />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-auto py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? "Sending OTP..." : "Request OTP"}
              </button>
            </div>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="w-full space-y-4">
            <div>
              <label
                className="block text-gray-700 text-sm font-semibold mb-1"
                htmlFor="otp"
              >
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-gray-900 bg-white"
                placeholder="Enter the OTP sent to your email"
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <button
                type="submit"
                disabled={loading}
                className="w-auto py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading || loading || resendCooldown > 0}
                className="w-auto py-2 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
              >
                {resendLoading
                  ? "Resending..."
                  : resendCooldown > 0
                    ? `Resend OTP (${resendCooldown}s)`
                    : "Resend OTP"}
              </button>
            </div>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="w-full space-y-4">
            <div>
              <label
                className="block text-gray-700 text-sm font-semibold mb-1"
                htmlFor="new-password"
              >
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newpassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-gray-900 bg-white"
                placeholder="Enter your new password"
              />
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-semibold mb-1"
                htmlFor="confirm-password"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmpassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-gray-900 bg-white"
                placeholder="Confirm your new password"
              />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-auto py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}
        <div className="h-6 mt-4 w-full">
          {message && (
            <p className="text-green-600 text-center animate-fade-in-down transition-all duration-300">
              {message}
            </p>
          )}
          {error && (
            <p className="text-red-600 text-center animate-fade-in-down transition-all duration-300">
              {error}
            </p>
          )}
        </div>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
};

export default ForgetPasswordPage;
