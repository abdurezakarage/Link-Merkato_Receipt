// Simple JWT auth utility for localStorage
"use client";
import { jwtDecode } from 'jwt-decode';

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function removeToken() {
  localStorage.removeItem('token');
}

export function isLoggedIn(): boolean {
  return !!getToken();
} 
// decode token
export function decodeToken<T = unknown>(): T | null {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode<T>(token);
  } catch {
    return null;
  }
}


// Store login time (timestamp in ms)
export function setLoginTime() {
  const timestamp = Date.now();
  localStorage.setItem('login_time', timestamp.toString());
}

export function getLoginTime(): number | null {
  const time = localStorage.getItem('login_time');
  return time ? parseInt(time, 10) : null;
}

export function removeLoginTime() {
  localStorage.removeItem('login_time');
}

// Check if login is expired (over 5 hours = 18000000 ms)
export function isLoginExpired(): boolean {
  const loginTime = getLoginTime();
  if (!loginTime) return true;
  return Date.now() - loginTime > 5 * 60 * 60 * 1000;
}
  
// Global logout function
export function logout(): void {
  try {
    // Remove token
    removeToken();
    // Remove login time
    removeLoginTime();
    
    // Double-check removal
    if (localStorage.getItem('token')) {
      localStorage.removeItem('token');
    }
    if (localStorage.getItem('login_time')) {
      localStorage.removeItem('login_time');
    }
    
    // Dispatch auth change event for multi-tab synchronization
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('authchange'));
    }
    
  } catch (error) {
    console.error('Error during logout:', error);
    // Force remove token and login time even if there's an error
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('login_time');
    } catch (e) {
       console.error('Failed to force remove token/login time:', e);
    }
  }
}
