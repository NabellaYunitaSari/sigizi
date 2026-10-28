import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Check, ChevronDown } from 'lucide-react';

export interface SearchOption {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
}

interface SearchableSelectProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchOption[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

export default function SearchableSelect({
  label,
  placeholder = 'Ketik untuk mencari...',
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  error,
  helperText,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.id === value) || null;
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter((opt) => {
      const matchTitle = opt.title.toLowerCase().includes(q);
      const matchSub = opt.subtitle ? opt.subtitle.toLowerCase().includes(q) : false;
      const matchBadge = opt.badge ? opt.badge.toLowerCase().includes(q) : false;
      return matchTitle || matchSub || matchBadge;
    });
  }, [options, searchQuery]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: SearchOption) => {
    onChange(option.id);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      {/* Selected Item Preview (if selected & dropdown is closed) */}
      {selectedOption && !isOpen ? (
        <div
          onClick={() => {
            if (!disabled) {
              setIsOpen(true);
              setSearchQuery('');
              setTimeout(() => inputRef.current?.focus(), 50);
            }
          }}
          className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-200 bg-teal-50/50 hover:bg-teal-50 border-teal-200 text-slate-800 flex items-center justify-between gap-2 cursor-pointer transition ${
            disabled ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 truncate">{selectedOption.title}</span>
              {selectedOption.badge && (
                <span className="shrink-0 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-teal-100 text-teal-800">
                  {selectedOption.badge}
                </span>
              )}
            </div>
            {selectedOption.subtitle && (
              <p className="text-xs text-slate-500 truncate mt-0.5">{selectedOption.subtitle}</p>
            )}
          </div>
          {!disabled && (
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                type="button"
                onClick={handleClear}
                title="Ganti / Hapus pilihan"
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          )}
        </div>
      ) : (
        /* Search Input when no item selected or when open */
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            disabled={disabled}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-sm min-h-[44px] bg-white transition focus:ring-2 focus:ring-teal-500 focus:outline-none ${
              error ? 'border-rose-300 ring-rose-200' : 'border-slate-200 hover:border-slate-300'
            }`}
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <ChevronDown className="w-4 h-4 absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
          )}
        </div>
      )}

      {/* Hidden native input for form validation if required */}
      {required && (
        <input
          type="text"
          required
          readOnly
          value={value}
          className="sr-only"
          tabIndex={-1}
        />
      )}

      {/* Dropdown Options Popup */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-xl divide-y divide-slate-100 animate-in fade-in duration-100">
          <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-semibold text-slate-500 flex justify-between">
            <span>Ditemukan: {filteredOptions.length} pilihan</span>
            {searchQuery && <span className="text-teal-600 font-normal">Filter: "{searchQuery}"</span>}
          </div>

          {filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              Tidak ada data yang cocok dengan "{searchQuery}".
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = opt.id === value;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  className={`px-3.5 py-2.5 cursor-pointer flex items-center justify-between gap-2 transition hover:bg-teal-50/70 ${
                    isSelected ? 'bg-teal-50 text-teal-900 font-semibold' : 'text-slate-800'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">{opt.title}</span>
                      {opt.badge && (
                        <span className="shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-700">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {opt.subtitle && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{opt.subtitle}</p>
                    )}
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0 ml-2" />}
                </div>
              );
            })
          )}
        </div>
      )}

      {helperText && !error && (
        <p className="mt-1 text-[11px] text-slate-400">{helperText}</p>
      )}
      {error && <p className="mt-1 text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  );
}
