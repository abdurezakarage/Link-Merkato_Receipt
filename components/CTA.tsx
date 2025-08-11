import React from "react";

interface CTAProps {
  title: string;
  description: string;
  primaryButton: {
    text: string;
    onClick?: () => void;
  };
  secondaryButton?: {
    text: string;
    onClick?: () => void;
  };
}

export function CTA({ title, description, primaryButton, secondaryButton }: CTAProps) {
  return (
    <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold mb-6">{title}</h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">{description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={primaryButton.onClick}
            className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
          >
            {primaryButton.text}
          </button>
          {secondaryButton && (
            <button
              onClick={secondaryButton.onClick}
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              {secondaryButton.text}
            </button>
          )}
        </div>
      </div>
    </section>
  );
} 