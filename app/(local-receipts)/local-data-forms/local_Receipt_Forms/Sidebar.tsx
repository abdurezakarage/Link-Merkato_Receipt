import React from 'react';
import ModeSelector from './ModeSelector';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  formProgress: {
    seller: boolean;
    buyer: boolean;
    receiptDetails: boolean;
    items: boolean;
    payment: boolean;
    withholding: boolean;
  };
  isFormComplete?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  noReceiptMode: boolean;
  setNoReceiptMode: (mode: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  formProgress, 
  isFormComplete = false, 
  isOpen, 
  onToggle,
  noReceiptMode,
  setNoReceiptMode
}) => {
  // Receipt mode sections
  const receiptSections = [
    {
      id: 'receipt-details',
      title: 'Receipt Details',
      description: 'Receipt information',
      completed: formProgress.receiptDetails
    },
    {
      id: 'seller-buyer',
      title: 'Seller & Buyer Info',
      description: 'Company information',
      completed: formProgress.seller && formProgress.buyer
    },
    {
      id: 'items',
      title: 'Items & Services',
      description: 'Item details',
      completed: formProgress.items
    },
    {
      id: 'payment',
      title: 'Payment & Documents',
      description: 'Payment method & files',
      completed: formProgress.payment
    },
    {
      id: 'withholding',
      title: 'Withholding',
      description: 'Withholding details',
      completed: formProgress.withholding
    }
  ];

  // Purchase voucher mode sections
  const purchaseVoucherSections = [
    {
      id: 'purchase-voucher',
      title: 'Purchase Voucher',
      description: 'Purchase voucher details',
      completed: formProgress.receiptDetails // Reusing receiptDetails for purchase voucher
    },
    {
      id: 'withholding-30',
      title: '30% Withholding',
      description: '30% withholding calculation',
      completed: formProgress.withholding
    }
  ];

  // Use appropriate sections based on mode
  const sections = noReceiptMode ? purchaseVoucherSections : receiptSections;

  // Calculate progress based on current mode
  const getProgressCount = () => {
    if (noReceiptMode) {
      return [formProgress.receiptDetails, formProgress.withholding].filter(Boolean).length;
    }
    return Object.values(formProgress).filter(Boolean).length;
  };

  const getTotalSections = () => {
    return noReceiptMode ? 2 : Object.keys(formProgress).length;
  };

  const progressCount = getProgressCount();
  const totalSections = getTotalSections();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative
        top-0 left-0 h-full
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-80 bg-white border-r border-gray-200 p-6
        transition-transform duration-300 ease-in-out z-50
        lg:z-30
        flex flex-col
        ${!isOpen ? 'lg:hidden' : ''}
      `}>
        {/* Header with Close Button and Toggle */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800">
              {noReceiptMode ? 'Purchase Voucher' : 'Receipt Entry'}
            </h2>
            {/* Desktop toggle button */}
            <button
              onClick={onToggle}
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
              title={isOpen ? 'Hide Sidebar' : 'Show Sidebar'}
            >
              {isOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode Selector */}
        {/* <div className="mb-6 flex-shrink-0">
          <ModeSelector 
            noReceiptMode={noReceiptMode} 
            setNoReceiptMode={setNoReceiptMode} 
            variant="toggle" 
          />
        </div> */}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Progress Overview */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">
                {progressCount}/{totalSections}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isFormComplete ? 'bg-green-600' : 'bg-blue-600'
                }`}
                style={{ 
                  width: `${(progressCount / totalSections) * 100}%` 
                }}
              ></div>
            </div>
            {isFormComplete && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-green-800">Ready to Submit</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Sections */}
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  onSectionChange(section.id);
                  // Close sidebar on mobile after selection
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  activeSection === section.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{section.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{section.description}</p>
                  </div>
                  {section.completed && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 