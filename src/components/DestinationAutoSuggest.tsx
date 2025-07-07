// src/components/DestinationAutoSuggest.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fetchCitySuggestions, CitySuggestion } from '@/services/nominatim';

export interface Suggestion {
  xid: string;
  name: string;
}

// callback quando o usuário seleciona uma sugestão
interface Props {
  onSelect: (item: Suggestion) => void;
}

export default function DestinationAutoSuggest({ onSelect }: Props) {
  const [inputValue, setInputValue] = useState<string>(''); // input value state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]); // suggestions list
  const [isLoading, setIsLoading] = useState<boolean>(false); // loading state
  const [showList, setShowList] = useState<boolean>(false); // control dropdown visibility
  const debounceRef = useRef<number | undefined>(undefined); // initial undefined

  // Debouncing API calls to avoid excessive requests
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  const wrapperRef = useRef<HTMLDivElement>(null); // Wrapper to detect outside clicks
  const inputRef = useRef<HTMLInputElement>(null); // Control input focus
  const [shouldFetch, setShouldFetch] = useState<boolean>(true); // Control whether fetch should occur

  // Click outside handler to close list
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowList(false);
        setHighlightedIndex(0);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!shouldFetch) return; // Prevent fetch if not allowed
    // Define term before the comma
    const term = inputValue.split(',')[0].trim();
    // Only fetch when user typed at least 3 characters (min length requirement)
    if (inputValue.trim().length < 3) {
      setShowList(false);
      return;
    }

    setIsLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        // Call Nominatim service for city suggestions
        const cities: CitySuggestion[] = await fetchCitySuggestions(term);
        // Map Nominatim result to our Suggestion type
        const items: Suggestion[] = cities.map((c) => {
          // Pick the best city field
          const cityName =
            c.address.city || c.address.town || c.address.village || c.display_name.split(',')[0]; // Fallback to first segment

          const country = c.address.country; // Country from addressdetails

          return {
            xid: `${c.lat},${c.lon}`, // Unique ID
            name: `${cityName}, ${country}`, // Only city + country
          };
        });

        setSuggestions(items);
        setShowList(true);
        setHighlightedIndex(0); // focus first suggestion
      } catch {
        setShowList(false);
      } finally {
        setIsLoading(false);
      }
    }, 300); // Debounce delay: 300 ms

    return () => window.clearTimeout(debounceRef.current);
  }, [inputValue, shouldFetch]); // Add shouldFetch as dependency

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const item = suggestions[highlightedIndex];
      if (item) {
        handleSelect(item); // Fill input with selected name
        setShowList(false); // Hide dropdown
        setHighlightedIndex(0);
        setShouldFetch(false); // Stop fetching until user types again
      }
    }
  };

  const handleSelect = (item: Suggestion) => {
    setInputValue(item.name); // Fill input with selected name
    setShowList(false); // Hide dropdown
    onSelect(item); // Notify parent component
    setHighlightedIndex(0);
    setShouldFetch(false); // Stop fetching until user types again
  };

  // ================================ MVP START ========================================
  //  Make "Salvador" as Initial Sugestion
  useEffect(() => {
    handleSelect({ xid: 'salvador-xid', name: 'Salvador, Brasil' });
  }, []);

  // ================================== MVP END ========================================

  return (
    <div className="relative w-full">
      {/* Editable input bound to state */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onFocus={() => {
          if (suggestions.length > 0) setShowList(true); // Ensure list reopens on focus
        }} //Track input focus
        onBlur={() => {
          // Delay hiding to allow click events to register
          setTimeout(() => {
            if (!document.activeElement || document.activeElement.tagName !== 'LI') {
              setShowList(false);
              setHighlightedIndex(0);
            }
          }, 150);
        }}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShouldFetch(true); // Allow fetch when typing resumes
        }}
        onKeyDown={handleKeyDown}
        placeholder="Where is the adventure..."
        className="w-full border rounded px-3 py-2"
      />

      {/* Loading indicator */}
      {isLoading && <div className="absolute top-2 right-3 text-xs">Loading...</div>}

      {/* Suggestions dropdown */}
      {showList && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded mt-1 max-h-60 overflow-auto">
          {suggestions.map((item, index) => (
            <li
              key={item.xid}
              onClick={() => handleSelect(item)} // Select on click
              className={`px-3 py-2 cursor-pointer ${index === highlightedIndex ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
      {showList && !isLoading && suggestions.length === 0 && (
        <p className="absolute z-10 w-full bg-white border rounded mt-1 px-3 py-2 text-sm text-gray-500">
          No results found
        </p>
      )}
    </div>
  );
}
