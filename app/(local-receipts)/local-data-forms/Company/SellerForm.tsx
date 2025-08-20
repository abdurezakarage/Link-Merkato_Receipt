import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import type { SellerInfo, CompanyData } from "../types";
import { useAuth } from "../../../Context/AuthContext";
import { DJANGO_BASE_URL } from "../../api/api";

interface SellerFormProps {
  seller: SellerInfo;
  setSeller: (seller: SellerInfo) => void;
  shouldFetchCompanies?: boolean; // Whether this form should fetch companies
  allowOverride?: boolean; // Allow manual override of seller info
  errors?: Partial<Record<'tin'|'name'|'address', string>>;
}

const SellerForm: React.FC<SellerFormProps> = ({ 
  seller, 
  setSeller, 
  shouldFetchCompanies = true,
  allowOverride = true,
  errors = {}
}) => {
  const { user, token } = useAuth();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // TIN lookup state (for manual entry mode)
  const [tinQuery, setTinQuery] = useState("");
  const [tinResults, setTinResults] = useState<Array<{ tin_number: string; name: string; address: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

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
          
          // Auto-fill seller info from token
          setSeller({
            name: companyData.company_name,
            tin: companyData.tin_number,
            address: companyData.company_address,
          });
        } else {
          setError('Company information not found in token. Required: TIN and Company Name');
        }
      } catch (err) {
        console.error('Error extracting company from token:', err);
        setError(err instanceof Error ? err.message : 'Failed to extract company information');
      } finally {
        setLoading(false);
      }
    };

    extractCompanyFromToken();
  }, [token, shouldFetchCompanies, allowOverride, setSeller]);

  const handleInputChange = (field: keyof SellerInfo, value: string) => {
    if (allowOverride || !shouldFetchCompanies) {
      setSeller({ ...seller, [field]: value });
    }
  };

  // Debounced TIN prefix search (only when this form is in manual mode)
  useEffect(() => {
    if (shouldFetchCompanies) return; // skip lookup when auto-filled from token
    if (!token) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (tinQuery && tinQuery.trim().length >= 1) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await axios.get(`${DJANGO_BASE_URL}/contacts/lookup/?tin_prefix=${encodeURIComponent(tinQuery.trim())}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const results = Array.isArray(res.data?.results) ? res.data.results : (Array.isArray(res.data) ? res.data : []);
          const mapped = results.map((r: any) => ({
            tin_number: r?.tin_number || r?.tin || "",
            name: r?.company_name || r?.name || "",
            address: r?.company_address || r?.address || "",
          })).filter((r: any) => r.tin_number);
          setTinResults(mapped);
        } catch (e) {
          setTinResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 400);
    } else {
      setTinResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [tinQuery, shouldFetchCompanies, token]);

  const handleTinChange = (value: string) => {
    handleInputChange('tin', value);
    setTinQuery(value);
  };

  const selectTinResult = (result: { tin_number: string; name: string; address: string }) => {
    setSeller({ name: result.name || seller.name, tin: result.tin_number, address: result.address || seller.address });
    setTinQuery(result.tin_number);
    setTinResults([]);
  };

  return (
    <div className="flex-1 bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-blue-700">Seller</h2>
        {user && shouldFetchCompanies && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {user.username}
            </span>
          </div>
        )}
      </div>

      {loading && shouldFetchCompanies && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">Extracting company information from token...</p>
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
            TIN
          </label>
          <div className="relative" ref={resultsRef}>
            <input 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
              name="sellerTin"
              value={seller.tin}
              onChange={e => handleTinChange(e.target.value)}
              required
              autoComplete="off"
            />
            {errors.tin && (<p className="mt-1 text-xs text-red-600">{errors.tin}</p>)}
            {!shouldFetchCompanies && tinQuery.trim().length >= 1 && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto">
                {isSearching && (
                  <div className="px-3 py-2 text-sm text-gray-600">Searching...</div>
                )}
                {/* {!isSearching && tinResults.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
                )} */}
                {!isSearching && tinResults.map((r) => (
                  <button
                    type="button"
                    key={r.tin_number + r.name}
                    onClick={() => selectTinResult(r)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50"
                  >
                    <div className="text-sm font-medium text-gray-800">{r.tin_number}</div>
                    <div className="text-xs text-gray-600">{r.name}{r.address ? ` · ${r.address}` : ''}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Name
          </label>
          <input 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
            name="sellerName"
            value={seller.name}
            onChange={e => handleInputChange('name', e.target.value)}
            required
          />
          {errors.name && (<p className="mt-1 text-xs text-red-600">{errors.name}</p>)}
        </div>
     
        
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Address
          </label>
          <input 
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
            name="sellerAddress"
            value={seller.address}
            onChange={e => handleInputChange('address', e.target.value)}
            required
          />
          {errors.address && (<p className="mt-1 text-xs text-red-600">{errors.address}</p>)}
        </div>
      </div>
    </div>
  );
};

export default SellerForm; 