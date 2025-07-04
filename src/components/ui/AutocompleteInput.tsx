'use client';

import React, { useState } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

/**
 * Very small autocomplete component.
 * - Shows a dropdown of `options` filtered by the current input.
 * - Fires `onSelect(option)` when an option is clicked.
 */
export default function AutocompleteInput({
  value,
  onChange,
  options,
  onSelect,
  placeholder = 'Search…',
  leftIcon = <FaMapMarkerAlt className="text-gray-400" />,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  onSelect: (v: string) => void;
  placeholder?: string;
  leftIcon?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);

  const filtered = options.filter((o) => o.toLowerCase().includes(value.toLowerCase()));

  return (
    <div className="relative w-full">
      {/* input + icon */}
      <div className="flex items-center gap-2 border rounded px-3 py-2">
        {leftIcon}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 100)} // small delay so click can register
          placeholder={placeholder}
          className="flex-1 outline-none text-sm"
        />
      </div>

      {/* dropdown */}
      {focused && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white shadow border rounded max-h-40 overflow-auto">
          {filtered.map((opt, idx) => (
            <li
              key={`${opt}-${idx}`}
              onMouseDown={() => onSelect(opt)} // onMouseDown to avoid blur
              className="px-3 py-1 text-sm hover:bg-gray-100 cursor-pointer"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
