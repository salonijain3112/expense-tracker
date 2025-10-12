"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

export interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: DropdownOption | null;
  onChange: (option: DropdownOption | null) => void;
  onCreateOption?: (inputValue: string) => Promise<DropdownOption | null>;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  clearable?: boolean;
  className?: string;
  id?: string;
}

const CustomDropdown = ({
  options,
  value,
  onChange,
  onCreateOption,
  placeholder = "Select an option...",
  disabled = false,
  loading = false,
  clearable = false,
  className = "",
  id
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if we can create a new option
  const canCreateNew = onCreateOption && 
    searchTerm.trim() && 
    !filteredOptions.some(option => 
      option.label.toLowerCase() === searchTerm.toLowerCase()
    );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      const totalItems = filteredOptions.length + (canCreateNew ? 1 : 0);

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev < totalItems - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : totalItems - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0) {
            if (highlightedIndex < filteredOptions.length) {
              handleSelectOption(filteredOptions[highlightedIndex]);
            } else if (canCreateNew) {
              handleCreateOption();
            }
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          setHighlightedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, filteredOptions, canCreateNew, searchTerm]);

  const handleSelectOption = (option: DropdownOption) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleCreateOption = async () => {
    if (!onCreateOption || !searchTerm.trim()) return;

    try {
      const newOption = await onCreateOption(searchTerm.trim());
      if (newOption) {
        onChange(newOption);
      }
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
    } catch (error) {
      console.error('Failed to create option:', error);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const handleToggleDropdown = () => {
    if (disabled || loading) return;
    
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Focus the input when opening
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Control */}
      <div
        className={`
          w-full px-3 py-2 bg-brand-secondary dark:bg-dark-card 
          border border-gray-300 dark:border-gray-700 rounded-lg 
          shadow-sm cursor-pointer transition-colors
          ${isOpen ? 'ring-2 ring-brand-accent border-brand-accent' : 'hover:border-brand-accent'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={handleToggleDropdown}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {isOpen ? (
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-900 dark:text-dark-text placeholder-gray-500 dark:placeholder-gray-400"
                placeholder={value ? value.label : placeholder}
                onClick={(e) => e.stopPropagation()}
                id={id}
              />
            ) : (
              <span className={`block truncate ${value ? 'text-gray-900 dark:text-dark-text' : 'text-gray-500 dark:text-gray-400'}`}>
                {value ? value.label : placeholder}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {clearable && value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                <XMarkIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            )}
            
            <ChevronDownIcon 
              className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : (
            <>
              {filteredOptions.length === 0 && !canCreateNew ? (
                <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                  No options found
                </div>
              ) : (
                <>
                  {filteredOptions.map((option, index) => (
                    <div
                      key={option.value}
                      className={`
                        px-3 py-2 cursor-pointer transition-colors
                        ${highlightedIndex === index 
                          ? 'bg-brand-accent text-white' 
                          : 'text-gray-900 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                      onClick={() => handleSelectOption(option)}
                    >
                      {option.label}
                    </div>
                  ))}
                  
                  {canCreateNew && (
                    <div
                      className={`
                        px-3 py-2 cursor-pointer transition-colors flex items-center space-x-2
                        ${highlightedIndex === filteredOptions.length
                          ? 'bg-brand-accent text-white' 
                          : 'text-brand-accent hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                      onClick={handleCreateOption}
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Create &quot;{searchTerm}&quot;</span>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
