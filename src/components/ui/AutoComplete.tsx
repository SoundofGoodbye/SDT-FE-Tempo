import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import apiClient from "@/lib/api-client";
import {cn} from "@/lib/utils";

interface AutocompleteProps {
    apiUrl?: string;
    placeholder?: string;
    onSelect?: (value: string) => void;
    maxResults?: number;
    minChars?: number;
    className?: string;
}

export const AutoComplete: React.FC<AutocompleteProps> = ({
                                                       apiUrl,
                                                       placeholder = 'Search products...',
                                                       onSelect,
                                                       maxResults = 100,
                                                       minChars = 1,
                                                       className = ''
                                                   }) => {
    const [input, setInput] = useState<string>('');
    const [query, setQuery] = useState<string>('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [data, setData] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [error, setError] = useState<string>('');

    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Mock API call - replace with your actual API endpoint
    const fetchSuggestions = async (searchQuery: string): Promise<string[]> => {
        try {
            setIsLoading(true);
            setError('');

            await new Promise(resolve => setTimeout(resolve, 300));

            // Filter results based on search query
            const filtered = data.filter(item =>
                item.toLowerCase().includes(searchQuery.toLowerCase())
            );

            return filtered.slice(0, maxResults);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (apiUrl != undefined) {
            apiClient.get<string[]>(apiUrl)
                .then(response => {
                    if (Array.isArray(response)) {
                        setData(response);
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (query != input && query.length >= minChars) {
                const results = await fetchSuggestions(query);
                setSuggestions(results);
                setIsOpen(results.length > 0);
                setSelectedIndex(-1);
            } else {
                setSuggestions([]);
                setIsOpen(false);
            }
        }, 300); // Debounce API calls

        return () => clearTimeout(timeoutId);
    }, [query, minChars]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setInput('')
        setIsOpen(false);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        setInput(suggestion);
        setIsOpen(false);
        setSelectedIndex(-1);
        onSelect?.(suggestion);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    const clearInput = () => {
        setQuery('');
        setSuggestions([]);
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.focus();
    };

    const highlightMatch = (text: string, query: string): JSX.Element => {
        if (!query) return <span>{text}</span>;

        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);

        return (
            <span>
        {parts.map((part, index) =>
            regex.test(part) ? (
                <mark key={index} className="bg-yellow-200 font-medium">
                    {part}
                </mark>
            ) : (
                <span key={index}>{part}</span>
            )
        )}
      </span>
        );
    };

    return (
        <div className={`relative w-full max-w-md mx-auto ${className}`}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    className={cn(
                        "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                    autoComplete="off"
                />

                {query && (
                    <button
                        onClick={clearInput}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 transition-colors"
                        type="button"
                    >
                        <X className="h-5 w-5 text-gray-400" />
                    </button>
                )}

                {isLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 bg-background"></div>
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {error ? (
                        <div className="px-4 py-3 text-red-600 text-sm">
                            Error: {error}
                        </div>
                    ) : suggestions.length > 0 ? (
                        <ul ref={listRef} className="py-1">
                            {suggestions.map((suggestion, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className={`px-4 py-3 cursor-pointer transition-colors border-l-4 ${
                                        index === selectedIndex
                                            ? 'bg-gray-50 text-gray-900'
                                            : 'bg-white border-transparent hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="text-sm">
                                        {highlightMatch(suggestion, query)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-3 text-gray-500 text-sm">
                            No results found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
