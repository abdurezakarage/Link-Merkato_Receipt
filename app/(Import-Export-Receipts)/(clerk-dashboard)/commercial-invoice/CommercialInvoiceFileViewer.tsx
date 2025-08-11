"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Eye, Download, ChevronDown, ArrowLeft, File } from "lucide-react";
// Removed useRouter as it's not used in this specific component for navigation.

interface CommercialInvoiceFile {
  userId: string;
  tinNumebr: string;
  firstname: string;
  lastname: string;
  companyname: string;
  imageCummercialInvoicefile: string;
}

interface UserDocument {
  userId: string;
  firstname: string;
  lastname: string;
  tinNumebr: string;
  companyname: string;
  commercialInvoiceUrl: string;
}

const BASE_URL = "https://customreceiptmanagement.onrender.com"; // Base URL for the API

/**
 * Converts a base64 string to a data URL, ensuring it has the correct prefix.
 * @param base64String The base64 string of the file.
 * @returns A complete data URL.
 */
function createDataUrl(base64String: string | null | undefined): string {
  if (!base64String) return "";
  // Check if the string already has a data URL prefix
  if (base64String.startsWith("data:")) return base64String;
  // Assume PDF if no specific mime type is provided and add the prefix
  return `data:application/pdf;base64,${base64String}`;
}

/**
 * CommercialInvoiceCard component displays individual commercial invoice documents in a collapsible card.
 * @param user The UserDocument object containing user and commercial invoice details.
 * @param onPreviewClick Callback function to handle opening the preview modal.
 */
function CommercialInvoiceCard({
  user,
  onPreviewClick,
}: {
  user: UserDocument;
  onPreviewClick: (url: string, companyName: string) => void;
}) {
  // State to manage the expanded/collapsed state of the card
  const [isExpanded, setIsExpanded] = useState(false);

  const hasInvoice = !!user.commercialInvoiceUrl;
  const isPdf = user.commercialInvoiceUrl?.startsWith("data:application/pdf");

  // Toggles the expanded state of the card
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Handles the download action for the commercial invoice file
  const handleDownload = () => {
    if (user.commercialInvoiceUrl) {
      const a = document.createElement("a");
      a.href = user.commercialInvoiceUrl;
      // Set download filename based on company TIN and file type
      a.download = `Commercial_Invoice_${user.tinNumebr}.${
        isPdf ? "pdf" : "png"
      }`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Clickable header for the card */}
      <button
        onClick={toggleExpand}
        className="w-full flex justify-between items-center p-6 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <div className="text-left">
          <h3 className="text-lg font-bold text-gray-800">
            {user.companyname}
          </h3>
          <p className="text-gray-600 text-sm">
            {user.firstname} {user.lastname} (TIN: {user.tinNumebr})
          </p>
        </div>
        {/* Chevron icon that rotates based on expanded state */}
        <ChevronDown
          size={24}
          className={`text-gray-600 transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Collapsible content section */}
      {isExpanded && (
        <div className="p-6 pt-0 border-t border-gray-200">
          <div className="bg-gray-50 p-4 rounded-md mt-4">
            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <File className="text-blue-500" size={18} />
              Commercial Invoice
            </h4>

            {hasInvoice ? (
              <>
                <div
                  className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() =>
                    onPreviewClick(user.commercialInvoiceUrl, user.companyname)
                  }
                >
                  {isPdf ? (
                    <div className="text-center p-4">
                      <File size={48} className="mx-auto text-blue-500 mb-2" />
                      <p className="text-blue-600 font-medium">
                        Click to preview PDF
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {user.companyname}'s Commercial Invoice
                      </p>
                    </div>
                  ) : (
                    <img
                      src={user.commercialInvoiceUrl}
                      alt="Commercial Invoice"
                      className="max-h-full max-w-full object-contain"
                    />
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() =>
                      onPreviewClick(
                        user.commercialInvoiceUrl,
                        user.companyname
                      )
                    }
                    className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 px-4 rounded-md flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Eye size={16} />
                    Preview
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 py-2 px-4 rounded-md flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </>
            ) : (
              <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">No Commercial Invoice available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * CommercialInvoiceViewer component fetches and displays a list of commercial invoice documents.
 * It also manages a preview modal for viewing the documents.
 */
export default function CommercialInvoiceViewer() {
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    companyName: string;
  } | null>(null);

  // Effect hook to fetch commercial invoice files when the component mounts
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve token from local storage
        if (!token) {
          setError("Authentication required. Please log in.");
          setLoading(false);
          return;
        }

        // Fetch data from the API
        const response = await axios.get<CommercialInvoiceFile[]>(
          `${BASE_URL}/api/v1/clerk/customfileAll`,
          {
            headers: { Authorization: `Bearer ${token}` }, // Add authorization header
          }
        );

        // Process raw data to create data URLs for commercial invoices
        const processedData = response.data
          .filter((item) => item.imageCummercialInvoicefile) // Filter out items without a commercial invoice file
          .map((item) => ({
            userId: item.userId,
            firstname: item.firstname,
            lastname: item.lastname,
            tinNumebr: item.tinNumebr,
            companyname: item.companyname,
            commercialInvoiceUrl: createDataUrl(
              item.imageCummercialInvoicefile
            ), // Convert base64 to data URL
          }));

        setUserDocuments(processedData);
      } catch (err) {
        console.error("Error fetching commercial invoices:", err);
        setError("Failed to load commercial invoices. Please try again later.");
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure
      }
    };

    fetchFiles(); // Call the fetch function
  }, []); // Empty dependency array means this effect runs once on mount

  // Handles opening the preview modal for a document
  const handleOpenPreview = (url: string, companyName: string) => {
    setPreviewFile({ url, companyName });
  };

  // Handles closing the preview modal
  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  // Display loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Display error message if fetching fails
  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
        <p className="font-semibold mb-2">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  // Display the full-screen preview if a file is selected for preview
  if (previewFile) {
    const isPdf = previewFile.url.startsWith("data:application/pdf");

    return (
      <div className="p-4 bg-gray-100 min-h-screen flex justify-center items-start">
        <div className="w-full max-w-4xl">
          {" "}
          {/* Adjusted max-w for preview to fit 2/3 */}
          <button
            onClick={handleClosePreview}
            className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            Back to all invoices
          </button>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {previewFile.companyName}'s Commercial Invoice
              </h2>
            </div>
            <div className="h-[calc(100vh-200px)] flex items-center justify-center">
              {" "}
              {/* Centering content vertically */}
              {isPdf ? (
                <iframe
                  src={previewFile.url}
                  className="w-full h-full"
                  title="Commercial Invoice PDF Viewer"
                  // Added sandbox for security, allowing only necessary features
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              ) : (
                <img
                  src={previewFile.url}
                  alt="Commercial Invoice"
                  className="max-w-full max-h-full object-contain p-4" // Added p-4 for padding
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main view: display list of commercial invoice cards
  return (
    <div className="p-4 bg-gray-50 min-h-screen flex justify-center items-start">
      <div className="w-full max-w-4xl">
        {" "}
        {/* Set max-w for the main grid to 2/3 */}
        <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Commercial Invoices
        </h1>
        {userDocuments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-200">
            <p className="text-gray-600">No commercial invoices available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {" "}
            {/* Changed to 1 column for accordion style */}
            {userDocuments.map((user) => (
              <CommercialInvoiceCard
                key={user.userId}
                user={user}
                onPreviewClick={handleOpenPreview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
