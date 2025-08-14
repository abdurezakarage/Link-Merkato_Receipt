import React, { useEffect, useState } from "react";
import axios from "axios";
import type { BuyerInfo, CompanyData } from "../types";
import { useAuth } from "../../../Context/AuthContext";
import { SPRING_BASE_URL } from "../../api/api";

interface BuyerFormProps {
  buyer: BuyerInfo;
  setBuyer: (buyer: BuyerInfo) => void;
  shouldFetchCompanies?: boolean; // Whether this form should fetch companies
  allowOverride?: boolean; // Allow manual override of buyer info
}

const BuyerForm: React.FC<BuyerFormProps> = ({ 
  buyer, 
  setBuyer, 
  shouldFetchCompanies = false,
  allowOverride = true 
}) => {
  const { user, token } = useAuth();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse JWT token to extract company information
  const parseJwt = (token: string): any => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  // Extract company information from token when shouldFetchCompanies is true
  useEffect(() => {
    const extractCompanyFromToken = () => {
      if (!token || !shouldFetchCompanies) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const payload = parseJwt(token);
        
        
        // Check for alternative field names and nested structures
        const tinNumber = payload?.tin_number || payload?.tin || payload?.company?.tin_number;
        const companyName = payload?.company_name || payload?.company?.company_name || payload?.company?.name;
        const address = payload?.Region || payload?.region || payload?.address || payload?.company?.Region || payload?.company?.region || payload?.company?.address || payload?.company?.company_address || "";
        
        
        if (payload && tinNumber && companyName) {
          // Create company data from token
          const companyData: CompanyData = {
            tin_number: tinNumber,
            company_name: companyName,
            company_address: address,
            company_email: payload.email || payload.company?.email || "",
            created_by_username: payload.username || payload.user_id || "",
          };
          
          setCompanies([companyData]);
          
          // Auto-fill buyer info from token
          setBuyer({
            name: companyData.company_name,
            tin: companyData.tin_number,
            address: companyData.company_address,
          });
        } else {
          setError('Company information not found in token. Required: TIN and Company Name');
        }
      } catch (err) {
        console.error('Error extracting company from token (BuyerForm):', err);
        setError(err instanceof Error ? err.message : 'Failed to extract company information');
      } finally {
        setLoading(false);
      }
    };

    extractCompanyFromToken();
  }, [token, shouldFetchCompanies, allowOverride, setBuyer]);

  const handleInputChange = (field: keyof BuyerInfo, value: string) => {
    if (allowOverride || !shouldFetchCompanies) {
      setBuyer({ ...buyer, [field]: value });
    }
  };

  return (
    <div className="flex-1 bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-green-700">Buyer</h2>
        {user && shouldFetchCompanies && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              {user.username}
            </span>
          </div>
        )}
      </div>

      {loading && shouldFetchCompanies && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">Extracting company information from token...</p>
        </div>
      )}

      {error && shouldFetchCompanies && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">Error: {error}</p>
        </div>
      )}
      
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Name
          </label>
          <input 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-black"
            name="buyerName"
            value={buyer.name}
            onChange={e => handleInputChange('name', e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            TIN
          </label>
          <input 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-black"
            name="buyerTin"
            value={buyer.tin}
            onChange={e => handleInputChange('tin', e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Address
          </label>
          <input 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-black"
            name="buyerAddress"
            value={buyer.address}
            onChange={e => handleInputChange('address', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default BuyerForm; 