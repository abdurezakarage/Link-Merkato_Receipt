
import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-2xl font-bold mb-4">Link Merkato</h3>
            <p className="text-gray-400">Your trusted partner for professional <br />business  services in Ethiopia.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Tax & Accounting</li>
              <li>Customs Services</li>
              <li>Import/Export</li>
              <li>Business Advisory</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Addis Ababa, Ethiopia</li>
              <li>+251 929 078 786</li>
              <li>linkmerkatobs@gmail.com</li>
            </ul>
          </div>
          {/* <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">📘</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">📷</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">💼</a>
            </div>
          </div> */}
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Link Merkato. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};