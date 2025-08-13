"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { AuthContextType, User, LoginResponse } from '../(local-receipts)/local-data-forms/types';
import { SPRING_BASE_URL, } from '../(local-receipts)/api/api';
import { LinkBASE_URL } from '../(local-receipts)/api/api';
import { setLoginTime, logout as globalLogout } from '../../components/auth';
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add axios interceptor for 401 responses
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Only logout for authentication-related endpoints or if it's a token validation issue
          const url = error.config?.url || '';
          const isAuthEndpoint = url.includes('/auth/') || url.includes('/login') || url.includes('/token');
          
          if (isAuthEndpoint) {
            //console.log('Authentication endpoint returned 401, logging out');
            logout();
          } else {
            //console.log('Non-auth endpoint returned 401, but not logging out automatically');
            // You might want to handle this differently, like showing an error message
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        // console.log('Initializing auth:', { 
        //   hasToken: !!storedToken, 
        //   hasUser: !!storedUser,
        //   tokenExpired: storedToken ? isTokenExpired(storedToken) : 'no token'
        // });
        
        if (storedToken && storedUser && !isTokenExpired(storedToken)) {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          
          // Update user data with current token information
          const payload = parseJwt(storedToken);
          // Convert string "true"/"false" to boolean, or use false as default
          const isCompanyCreated = payload?.is_company_created === "true" || payload?.is_company_created === true || false;
          // Extract roles from JWT token
          const roles = payload?.roles || [];
          
          // Update the user object with the current is_company_created flag and roles
          const updatedUser = {
            ...parsedUser,
            is_company_created: isCompanyCreated,
            roles: roles
          };
          
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Set default axios authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          // console.log('Auth initialized successfully');
        } else if (storedToken && isTokenExpired(storedToken)) {
          // Token is expired, clear it
          // console.log('Token expired, logging out');
          logout();
        } else {
          // console.log('No valid auth data found');
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  function parseJwt(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

  function isTokenExpired(token: string): boolean {
    try {
      const payload = parseJwt(token);
      if (!payload || !payload.exp) return true;
      
      // Check if token is expired (with 1 minute buffer instead of 5 minutes)
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < (currentTime - 60);
    } catch (e) {
      return true;
    }
  }

  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    // Try first API (SPRING_BASE_URL)
    try {
      //console.log('Attempting login with first API:', `${SPRING_BASE_URL}/auth/login`);
      const response = await axios.post<LoginResponse>(`${SPRING_BASE_URL}/auth/login`, {
        username,
        password,
      });

      let token: string;
      let userData: User;
      
      if (response.data.access_token) {
        token = response.data.access_token;
      } else if (response.data.token) {
        token = response.data.token;
      } else if (response.data.token && typeof response.data.token === 'string') {
        token = response.data.token;
      } else {
        throw new Error('Invalid response structure from first API. Please check the console for the full response.');
      }

      // Decode JWT to get user_id and is_company_created flag
      const payload = parseJwt(token);
      const userId = payload?.user_id || "";
      // Convert string "true"/"false" to boolean, or use false as default
      const isCompanyCreated = payload?.is_company_created === "true" || payload?.is_company_created === true || false;
      // Extract roles from JWT token
      const roles = payload?.roles || [];
      
      // Construct minimal user object
      userData = {
        id: userId,
        username: username, // We only have username from login form
        company: {
          tin_number: "",
          company_name: "",
          email: "",
          address: ""
        },
        is_company_created: isCompanyCreated,
        roles: roles
      };

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      // Set login time for session management
      setLoginTime();
      // Update state
      setToken(token);
      setUser(userData);
      // Set default axios authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      //console.log('Login successful with first API');
      return userData
    } catch (firstApiError: any) {
      //console.log('First API login failed, trying second API:', firstApiError.message);
      
      // If first API fails, try second API (LinkBASE_URL)
      try {
        //console.log('Attempting login with second API:', `${LinkBASE_URL}/auth/login`);
        const secondResponse = await axios.post<LoginResponse>(`${LinkBASE_URL}/auth/login`, {
          username,
          password,
        });

        let token: string;
        let userData: User;
        
        if (secondResponse.data.access_token) {
          token = secondResponse.data.access_token;
        } else if (secondResponse.data.token) {
          token = secondResponse.data.token;
        } else if (secondResponse.data.token && typeof secondResponse.data.token === 'string') {
          token = secondResponse.data.token;
        } else {
          throw new Error('Invalid response structure from second API. Please check the console for the full response.');
        }

        // Decode JWT to get user_id and is_company_created flag
        const payload = parseJwt(token);
        const userId = payload?.user_id || "";
        // Convert string "true"/"false" to boolean, or use false as default
        const isCompanyCreated = payload?.is_company_created === "true" || payload?.is_company_created === true || false;
        // Extract roles from JWT token
        const roles = payload?.roles || [];
        
        // Construct minimal user object
        userData = {
          id: userId,
          username: username, // We only have username from login form
          company: {
            tin_number: "",
            company_name: "",
            email: "",
            address: ""
          },
          is_company_created: isCompanyCreated,
          roles: roles
        };

        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        // Set login time for session management
        setLoginTime();
        // Update state
        setToken(token);
        setUser(userData);
        // Set default axios authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        //console.log('Login successful with second API');
        return userData
      } catch (secondApiError: any) {
        // Both APIs failed
        const firstErrorMessage = firstApiError.response?.data?.message || 'login failed';
        const secondErrorMessage = secondApiError.response?.data?.message || 'login failed';
        
        //const combinedErrorMessage = `Login failed on both APIs. First API: ${firstErrorMessage}. Second API: ${secondErrorMessage}`;
        setError("Login failed");
        throw new Error("Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Call global logout to ensure consistency
    globalLogout();
    
    // Clear state
    setToken(null);
    setUser(null);
    
    // Clear axios authorization header
    delete axios.defaults.headers.common['Authorization'];
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 