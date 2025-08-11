"use client";
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isLoginExpired, logout, getToken } from "./auth";
import { useAuth } from "../app/Context/AuthContext";

interface SessionGuardProps {
  children: React.ReactNode;
}

const CHECK_INTERVAL = 1 * 60 * 1000; // 1 minute

const protectedRoutes = [
  "/dataupload",
  "/accountant-dashboard",
  "/local-Import",
  "/auth/admin",
];

const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgetPassword",
];

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

function isAuthRoute(pathname: string) {
  // More precise auth route detection
  return pathname === "/auth/login" || 
         pathname === "/auth/register" || 
         pathname === "/auth/forgetPassword" ||
         pathname.startsWith("/auth/login") ||
         pathname.startsWith("/auth/register") ||
         pathname.startsWith("/auth/forgetPassword");
}

export default function SessionGuard({ children }: SessionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth context to be ready
    if (isLoading) {
      return;
    }

    // Add a small delay to prevent interference with login process
    const timeoutId = setTimeout(() => {
      // Don't check authentication for auth routes
      if (isAuthRoute(pathname)) {
        console.log('SessionGuard: Auth route detected, skipping check:', pathname);
        return;
      }

      // Only check authentication for protected routes
      if (!isProtectedRoute(pathname)) {
        console.log('SessionGuard: Non-protected route, skipping check:', pathname);
        return;
      }

      // Check if user has a token first
      const token = getToken();
      if (!token) {
        console.log('SessionGuard: No token found, redirecting to login');
        router.push("/auth/login");
        return;
      }

      // For now, just check if token exists and is not expired
      // We'll rely on the AuthContext's JWT expiration check
      console.log('SessionGuard: Token found, allowing access to:', pathname);

      // Set up interval to check periodically (simplified)
      const interval = setInterval(() => {
        const currentToken = getToken();
        if (!currentToken) {
          console.log('SessionGuard: Periodic check - no token, logging out');
          logout();
          router.push("/auth/login");
        }
      }, CHECK_INTERVAL);

      return () => clearInterval(interval);
    }, 1000); // Increased delay to 1 second

    return () => clearTimeout(timeoutId);
  }, [router, pathname, isLoading]);

  return <>{children}</>;
} 