"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../app/Context/AuthContext";
import { CompanyData } from "../app/(local-receipts)/local-data-forms/types";


export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Scroll behavior logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show navigation at the top of the page
      if (currentScrollY <= 100) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }
      
      // Hide navigation when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && isVisible) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY && !isVisible) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible, lastScrollY]);

  // Determine button label and target based on login state and current path
  let authButtonLabel = "Sign up";
  let authButtonTarget = "/auth/register";
  let showLogout = false;
  
  if (user) {
    showLogout = true;
  } else if (pathname === "/") {
    authButtonLabel = "Sign in";
    authButtonTarget = "/auth/login";
  } else if (pathname === "/auth/login") {
    authButtonLabel = "Sign up";
    authButtonTarget = "/auth/register";
  } else if (pathname === "/auth/register") {
    authButtonLabel = "Sign in";
    authButtonTarget = "/auth/login";
  }

  const handleAuthClick = () => {
    router.push(authButtonTarget);
  };

  // Utility to check if user is admin
  const isAdmin = user?.company?.company_name ? false : true; // Simplified admin check

  // Role-based access control functions
  const hasRole = (role: string) => {
    return user?.roles?.includes(role) || false;
  };

  const isUser = hasRole("USER");
  const isClerk = hasRole("CLERK");
  const isAccountant = hasRole("ACCOUNTANT");
  const isAdminRole = hasRole("ADMIN");

  // Handle navigation to sections
  const handleSectionNavigation = (sectionId: string) => {
    if (pathname === '/') {
      // If we're on the home page, scroll to the section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If we're on another page, navigate to home first, then scroll
      router.push(`/#${sectionId}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  // Handle hash navigation when page loads
  useEffect(() => {
    if (pathname === '/' && typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        // Remove the # from the hash
        const sectionId = hash.substring(1);
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, [pathname]);

//
  // Parse JWT token to get company information
  const parseJwt = (token: string): any => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  // Get company data from token
  const getCompanyFromToken = (): CompanyData | null => {
    if (!token) return null;
    
    const payload = parseJwt(token);
    if (!payload) return null;

    return {
      tin_number: payload.tin_number || '',
      company_name: payload.company_name || '',
      company_email: payload.email || '',
      company_address: payload.address || '',
      created_by_username: payload.username || ''
    };
  };

  // Get company data from token for display
  const companyFromToken = getCompanyFromToken();

  return (
    <nav className="bg-white/98 backdrop-blur-md shadow-xl border-b border-gray-200 fixed w-full z-[9999] top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
              <Link href="/">
                <Image src="/logo.jpg" alt="Link Merkato" width={32} height={32} className="h-8 w-auto" />
              </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleSectionNavigation('home')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => handleSectionNavigation('services')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Services
            </button>
            <button 
              onClick={() => handleSectionNavigation('testimonials')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Testimonials
            </button>
           
            {isUser && (
              <button 
                onClick={() => router.push('/auth/owner-dashboard')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                title="Go to Clerk Dashboard"
              >
               Owner Dashboard
              </button>
            )}
              {/* {isUser && (
              <button 
                onClick={() => router.push('/dataupload/history')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                title="Go to user history"
              >
               History
              </button>
            )} */}
            {isClerk && (
              <button 
                onClick={() => router.push('/local-Import')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                title="Go to Clerk Dashboard"
              >
                Receipt
              </button>
            )}
            {isAccountant && (
              <button 
                onClick={() => router.push('/accountant-dashboard')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                title="Go to Accountant Dashboard"
              >
                Accountant
              </button>
            )}
             {/* {isAdminRole && (
              <button 
                onClick={() => router.push('/')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                title="Go to Admin Page"
              >
                Admin
              </button>
            )} */}
            <button 
              onClick={() => handleSectionNavigation('contact')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Contact
            </button>
            
            {/* User Information */}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="hidden lg:block">
                    <button
                      className={`font-medium text-gray-900 focus:outline-none ${isAdmin ? 'hover:underline cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                    
                      disabled={!isAdmin}
                      title={isAdmin ? 'Go to Admin Page' : 'Only admin can access'}
                    >
                      {user.username}
                    </button>
                 
                  </div>
                  {companyFromToken && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <span className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21V7a2 2 0 012-2h2a2 2 0 012 2v14M13 21V3a2 2 0 012-2h2a2 2 0 012 2v18M9 21h6" />
                        </svg>
                      </span>
                      <button
                        onClick={() => router.push('/dataupload/history')}
                        className="hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                        title="View Upload History"
                      >
                        {companyFromToken.company_name}
                      </button>
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleLogout} 
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={handleAuthClick}
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
              >
                {authButtonLabel}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {/* User Info for Mobile */}
              {user && (
                <div className="px-3 py-2 border-b border-gray-200 mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <button
                        className={`font-medium text-gray-900 focus:outline-none ${isAdmin ? 'hover:underline cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                        onClick={() => {
                          if (isAdmin) {
                            router.push('/auth/admin');
                          }
                        }}
                        disabled={!isAdmin}
                        title={isAdmin ? 'Go to Admin Page' : 'Only admin can access'}
                      >
                        {user.username}
                      </button>
                     
                    </div>
                    {companyFromToken && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <span className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21V7a2 2 0 012-2h2a2 2 0 012 2v14M13 21V3a2 2 0 012-2h2a2 2 0 012 2v18M9 21h6" />
                          </svg>
                        </span>
                        <button
                          onClick={() => { router.push('/dataupload/history'); setIsMenuOpen(false); }}
                          className="hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                          title="View Upload History"
                        >
                          {companyFromToken.company_name}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => { handleSectionNavigation('home'); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => { handleSectionNavigation('services'); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Services
              </button>
              <button
                onClick={() => { handleSectionNavigation('testimonials'); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Testimonials
              </button>
              {isUser && (
                <button 
                  onClick={() => { router.push('/dataupload'); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  title="Go to Data Upload"
                >
                  Upload Data
                </button>
              )}
              {isUser && (
                <button 
                  onClick={() => { router.push('/dataupload/history'); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  title="Go to user history"
                >
                  History
                </button>
              )}
              {isClerk && (
                <button 
                  onClick={() => { router.push('/local-Import'); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  title="Go to Receipt Management"
                >
                  Receipt Management
                </button>
              )}
          
              {isAccountant && (
                <button 
                  onClick={() => { router.push('/accountant-dashboard'); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 font-medium transition-colors"
                  title="Go to Accountant Dashboard"
                >
                  Accountant Dashboard
                </button>
              )}
              {isAdminRole && (
                <button 
                  onClick={() => { router.push('/auth/admin'); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  title="Go to Admin Page"
                >
                  Admin
                </button>
              )}
              <button
                onClick={() => { handleSectionNavigation('contact'); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Contact
              </button>
              {showLogout ? (
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block text-left px-3 py-2 text-red-600 hover:text-white hover:bg-red-600 font-medium rounded-lg transition-colors">
                  Logout
                </button>
              ) : (
                <button 
                  onClick={() => { handleAuthClick(); setIsMenuOpen(false); }}
                  className="block text-left px-3 py-2 text-blue-600 hover:text-white hover:bg-blue-600 font-medium rounded-full transition-colors"
                >
                  {authButtonLabel}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 
