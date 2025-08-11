import React, { useState, useEffect } from 'react';

// Interfaces to type the data from the first API and the full response object
interface ReceiptData {
  claimable_vat: number;
  declaration_number: string;
  is_vat_expired: boolean;
  issued_to: string;
  item_code: string;
  item_description: string;
  non_claimable_vat: number;
  quantity: string;
  receipt_date: string;
  receipt_number: string;
  subtotal: number;
  total_after_tax: number;
  unit_cost: string;
  vat_amount: number;
}

interface ApiResponse {
  count: number;
  data: ReceiptData[];
}

const DataTransferComponent: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready to fetch and send data.');
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  useEffect(() => {
    const fetchAndSendData = async () => {
      setStatus('Fetching data from the source API...');
      const sourceApiUrl = 'https://local-receipt-management-system.onrender.com/api/RetriveImportExportRelatedReceipts/';
      
      // We'll use a public API like Reqres.in for a sample destination
      const destinationApiUrl = 'https://reqres.in/api/users'; 

      try {
        // Step 1: Fetch data from the source API
        const fetchResponse = await fetch(sourceApiUrl);
        if (!fetchResponse.ok) {
          throw new Error('Failed to fetch data from the source API.');
        }
        const apiResponse: ApiResponse = await fetchResponse.json();
        const fetchedReceipt = apiResponse.data[0];
        setReceipt(fetchedReceipt);

        setStatus('Data fetched successfully. Now sending to the destination API...');
        
        // Step 2: Send the fetched data to the destination API
        const sendResponse = await fetch(destinationApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fetchedReceipt),
        });

        if (!sendResponse.ok) {
          throw new Error('Failed to send data to the destination API.');
        }

        const sendResult = await sendResponse.json();
        setStatus(`Data successfully sent! Response from destination API: ${JSON.stringify(sendResult)}`);

      } catch (error) {
        if (error instanceof Error) {
            setStatus(`Error: ${error.message}`);
        } else {
            setStatus('An unknown error occurred.');
        }
      }
    };

    fetchAndSendData();
  }, []); // The empty dependency array ensures this effect runs only once when the component mounts.

  // Conditional rendering based on the status
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '600px', margin: '20px auto' }}>
      <h2>Data Transfer Status</h2>
      <p style={{ fontWeight: 'bold' }}>{status}</p>
      <hr />
      {/* Conditionally display the fetched data after it's available */}
      {receipt && (
        <>
          <h3>Fetched Receipt Details</h3>
          <p><strong>Receipt Number:</strong> {receipt.receipt_number}</p>
          <p><strong>Issued To:</strong> {receipt.issued_to}</p>
          <p><strong>Item:</strong> {receipt.item_description}</p>
          <p><strong>Total After Tax:</strong> ${receipt.total_after_tax.toFixed(2)}</p>
        </>
      )}
    </div>
  );
};

export default DataTransferComponent;