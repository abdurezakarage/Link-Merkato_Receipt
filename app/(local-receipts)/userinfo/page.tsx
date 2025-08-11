"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '../../Nav/Navigation';
import ProtectedRoute from '../../Context/ProtectedRoute';
import type { CompanyData, ReceiptData, FormReportResponse } from '../../(local-receipts)/local-data-forms/types';
import axios from 'axios';
import { DJANGO_BASE_URL } from '../api/api';

// Dashboard Stats Card Component
const StatsCard: React.FC<{ title: string; value: string | number; icon: string; color: string }> = ({ 
  title, 
  value, 
  icon, 
  color 
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <span className="text-xl">{icon}</span>
      </div>
    </div>
  </div>
);

// Recent Receipt Item Component
const RecentReceiptItem: React.FC<{ 
  receiptNumber: string; 
  date: string; 
  amount: number; 
  status: string; 
  type: string;
  formattedAmount?: string;
}> = ({ receiptNumber, date, amount, status, type, formattedAmount }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <span className="text-blue-600 font-semibold text-sm">R</span>
      </div>
      <div>
        <p className="font-medium text-gray-900">{receiptNumber}</p>
        <p className="text-sm text-gray-500">{date}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-medium text-gray-900">{formattedAmount || amount.toLocaleString()}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className={`px-2 py-1 text-xs rounded-full ${
          status === 'completed' ? 'bg-green-100 text-green-700' : 
          status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
          'bg-gray-100 text-gray-700'
        }`}>
          {status}
        </span>
        <span className="text-xs text-gray-500">{type}</span>
      </div>
    </div>
  </div>
);

// Quick Action Button Component
const QuickActionButton: React.FC<{ 
  title: string; 
  description: string; 
  icon: string; 
  onClick: () => void; 
  color: string 
}> = ({ title, description, icon, onClick, color }) => (
  <button
    onClick={onClick}
    className={`${color} p-4 rounded-lg text-left hover:shadow-md transition-all duration-200 group`}
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
        <span className="text-xl">{icon}</span>
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-white text-opacity-90">{description}</p>
      </div>
    </div>
  </button>
);

// Company Card Component
const CompanyCard: React.FC<{ company: CompanyData }> = ({ company }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-lg mb-1">{company.company_name}</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p><span className="font-medium">TIN:</span> {company.tin_number}</p>
          <p><span className="font-medium">Email:</span> {company.company_email}</p>
          <p><span className="font-medium">Address:</span> {company.company_address}</p>
          <p><span className="font-medium">Created by:</span> {company.created_by_username}</p>
        </div>
      </div>
      <div className="ml-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-blue-600 font-semibold text-lg">🏢</span>
        </div>
      </div>
    </div>
  </div>
);

const UserDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      created_by_username: payload.first_name || ''
    };
  };

  // Get company information from token
  const companyFromToken = getCompanyFromToken();

  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    firstName: companyFromToken?.created_by_username || '',
    email: companyFromToken?.company_email || '',
    companyName: companyFromToken?.company_name || '',
    tinNumber: companyFromToken?.tin_number || '',
    address: companyFromToken?.company_address || ''
  });

  // Fetch receipts data
  const fetchReceipts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<FormReportResponse>(
        `${DJANGO_BASE_URL}/receipts`
      );

      if (response.data.results) {
        setReceipts(response.data.results);
      } else {
        setError('Failed to fetch receipt data');
      }
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError('Error fetching receipt data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate dashboard statistics from real data
  const calculateDashboardStats = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const totalReceipts = receipts.length;
    
    const thisMonthReceipts = receipts.filter(receipt => {
      const receiptDate = new Date(receipt.receipt_date);
      return receiptDate.getMonth() === currentMonth && receiptDate.getFullYear() === currentYear;
    });

    const totalAmount = receipts.reduce((sum, receipt) => sum + Number(receipt.total), 0);
    const thisMonthAmount = thisMonthReceipts.reduce((sum, receipt) => sum + Number(receipt.total), 0);

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-ET', {
        style: 'currency',
        currency: 'ETB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    return [
      { 
        title: 'Total Receipts', 
        value: totalReceipts.toLocaleString(), 
        icon: '📄', 
        color: 'bg-blue-100 text-blue-600' 
      },
      { 
        title: 'This Month', 
        value: thisMonthReceipts.length.toString(), 
        icon: '📅', 
        color: 'bg-green-100 text-green-600' 
      },
      { 
        title: 'Total Amount', 
        value: formatCurrency(totalAmount), 
        icon: '💰', 
        color: 'bg-purple-100 text-purple-600' 
      },
      { 
        title: 'This Month Amount', 
        value: formatCurrency(thisMonthAmount), 
        icon: '📊', 
        color: 'bg-yellow-100 text-yellow-600' 
      }
    ];
  };

  // Get recent receipts from real data
  const getRecentReceipts = () => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-ET', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    const formatCurrency = (amount: string | number) => {
      return new Intl.NumberFormat('en-ET', {
        style: 'currency',
        currency: 'ETB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Number(amount));
    };

    // Sort receipts by date (most recent first) and take the first 4
    return receipts
      .sort((a, b) => new Date(b.receipt_date).getTime() - new Date(a.receipt_date).getTime())
      .slice(0, 4)
      .map(receipt => ({
        receiptNumber: receipt.receipt_number,
        date: formatDate(receipt.receipt_date),
        amount: Number(receipt.total),
        status: 'completed', // Assuming all receipts are completed
        type: receipt.receipt_category || 'Local',
        formattedAmount: formatCurrency(receipt.total)
      }));
  };

  // Calculate activity summary from real data
  const calculateActivitySummary = () => {
    const currentDate = new Date();
    const currentWeek = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-ET', {
        style: 'currency',
        currency: 'ETB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const thisWeekReceipts = receipts.filter(receipt => {
      const receiptDate = new Date(receipt.receipt_date);
      return receiptDate >= currentWeek;
    });

    const thisMonthReceipts = receipts.filter(receipt => {
      const receiptDate = new Date(receipt.receipt_date);
      return receiptDate >= currentMonth;
    });

    const thisWeekAmount = thisWeekReceipts.reduce((sum, receipt) => sum + Number(receipt.total), 0);
    const thisMonthAmount = thisMonthReceipts.reduce((sum, receipt) => sum + Number(receipt.total), 0);

    return {
      thisWeek: {
        receiptsCreated: thisWeekReceipts.length,
        totalAmount: formatCurrency(thisWeekAmount),
        pendingApproval: 0 // Assuming no pending status in current data
      },
      thisMonth: {
        receiptsCreated: thisMonthReceipts.length,
        totalAmount: formatCurrency(thisMonthAmount),
        completed: thisMonthReceipts.length // Assuming all are completed
      }
    };
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const dashboardStats = calculateDashboardStats();
  const recentReceipts = getRecentReceipts();
  const activitySummary = calculateActivitySummary();

  const quickActions = [
    {
      title: 'New Receipt',
      description: 'Create a new receipt entry',
      icon: '➕',
      color: 'bg-blue-500',
                      onClick: () => router.push('/localReceipt')
    },
    {
      title: 'View Reports',
      description: 'Generate and view reports',
      icon: '📊',
      color: 'bg-green-500',
                      onClick: () => router.push('/localReport')
    },
    {
      title: 'VAT report',
      description: 'Manage account settings',
      icon: '💰',
      color: 'bg-purple-500',
      onClick: () => router.push('/monthly-Vat-Summary')
    }
  ];

  const handleProfileUpdate = () => {
    // Here you would typically make an API call to update the profile
    console.log('Updating profile:', profileData);
    setIsEditing(false);
    // Show success message
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {companyFromToken?.created_by_username || user?.username}!</h1>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
                <button
                  onClick={fetchReceipts}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Stats */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Local Receipt Dashboard</h2>
          <button
            onClick={fetchReceipts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="space-y-4">
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{companyFromToken?.created_by_username || user?.username || 'Not available'}</p>
                  )}
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{companyFromToken?.created_by_username || 'Not available'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{companyFromToken?.company_name || 'Not available'}</p>
                  )}
                </div>


                {isEditing && (
                  <button
                    onClick={handleProfileUpdate}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                  >
                    Update Profile
                  </button>
                )}
              </div>
            </div>

            {/* Companies Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Company Information</h2>
                <button
                  onClick={() => router.push('/auth/company_register')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Update Company
                </button>
              </div>

              {companyFromToken ? (
                <div className="space-y-4">
                  <CompanyCard company={companyFromToken} />
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <p className="text-gray-600 mb-4">No company information found in token</p>
                  <button
                    onClick={() => router.push('/auth/company_register')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Register Your Company
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <QuickActionButton key={index} {...action} />
                ))}
              </div>
            </div>

            {/* Recent Receipts */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Receipts</h2>
                <button
                  onClick={() => router.push('/localReport')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2">
                {recentReceipts.length > 0 ? (
                  recentReceipts.map((receipt, index) => (
                    <RecentReceiptItem key={index} {...receipt} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📄</span>
                    </div>
                    <p className="text-gray-600 mb-2">No receipts found</p>
                    <p className="text-sm text-gray-500">Create your first receipt to get started</p>
                    <button
                      onClick={() => router.push('/(local-receipts)/localReceipt')}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Create Receipt
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">This Week</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Receipts Created</span>
                      <span className="font-medium">{activitySummary.thisWeek.receiptsCreated}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-medium">{activitySummary.thisWeek.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pending Approval</span>
                      <span className="font-medium">{activitySummary.thisWeek.pendingApproval}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">This Month</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Receipts Created</span>
                      <span className="font-medium">{activitySummary.thisMonth.receiptsCreated}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-medium">{activitySummary.thisMonth.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-medium">{activitySummary.thisMonth.completed}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserDashboardPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <UserDashboard />
    </ProtectedRoute>
  );
};

export default UserDashboardPage;
