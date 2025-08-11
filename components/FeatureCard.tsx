import React from "react";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  color?: "blue" | "green" | "purple" | "orange";
}

export function FeatureCard({ icon, title, description, color = "blue" }: FeatureCardProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4 ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
} 