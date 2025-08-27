'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '../utils';

interface EditableFieldProps {
  value: number;
  onChange: (value: string) => void;
  isEditable: boolean;
  className?: string;
  type?: 'currency' | 'number';
}

const EditableField: React.FC<EditableFieldProps> = ({ 
  value, 
  onChange, 
  isEditable, 
  className = '', 
  type = 'currency' 
}) => {
  const [localValue, setLocalValue] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize local value when component mounts or value changes from outside
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value.toString());
    }
  }, [value, isEditing]);

  if (!isEditable) {
    return (
      <span className={className}>
        {type === 'currency' ? formatCurrency(value) : value.toString()}
      </span>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  };

  const handleFocus = () => {
    setIsEditing(true);
    setLocalValue(value.toString());
  };

  const handleBlur = () => {
    setIsEditing(false);
    const numericValue = parseFloat(localValue) || 0;
    onChange(numericValue.toString());
    setLocalValue(numericValue.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="number"
        value={isEditing ? localValue : value.toString()}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        step="0.01"
        min="0"
        placeholder=""
        className={`border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors w-32 bg-white text-black ${className}`}
      />
      {!isEditing && type === 'currency' && value > 0 && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
          ETB
        </div>
      )}
      {isEditing && (
        <div className="absolute -top-1 -right-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default EditableField;
