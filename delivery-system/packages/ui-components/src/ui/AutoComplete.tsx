import React, {useState, useEffect, useRef, KeyboardEvent, JSX} from 'react';
import { X } from 'lucide-react';
import { cn } from '@delivery-system/utils';

interface AutocompleteProps {
    options: { id: number; name: string }[];
    placeholder?: string;
    onSelect?: (value: { id: number; name: string }) => void;
    maxResults?: number;
    minChars?: number;
    className?: string;
}

export const AutoComplete: React.FC<AutocompleteProps> = ({
                                                              options,
                                                              placeholder = 'Search products...',
                                                              onSelect,
                                                              maxResults = 100,
                                                              minChars = 1,
                                                              className = ''
                                                          }) => {
    const [input, setInput] = useState<string>('');
    const [query, setQuery] = useState<string>('');
    const [filteredOptions, setFilteredOptions] = useState<{ id: number; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [error, setError] = useState<string>('');
    const [isSelected, setIsSelected] = useState<boolean>(false); // Track if current value is a selected item

    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Don't show suggestions if the current value is a selected item
            if (isSelected) {
                return;
            }

            if (query.length >= minChars) {
                const filtered = options.filter(o =>
                    o.name.toLowerCase().includes(query.toLowerCase())
                ).slice(0, maxResults);

                setFilteredOptions(filtered);
                setIsOpen(filtered.length > 0);
                setSelectedIndex(-1);
            } else {
                setFilteredOptions([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, options, minChars, maxResults, isSelected]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setQuery(newValue);
        setInput('');
        setIsSelected(false); // Mark that user is typing (not a selected value)

        // Close dropdown if input is too short
        if (newValue.length < minChars) {
            setIsOpen(false);
        }
    };

    const handleSuggestionClick = (option: { id: number; name: string }) => {
        setQuery(option.name);
        setInput(option.name);
        setIsOpen(false);
        setSelectedIndex(-1);
        setFilteredOptions([]);
        setIsSelected(true); // Mark that current value is a selected item
        onSelect?.(option);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
                    handleSuggestionClick(filteredOptions[selectedIndex]);
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
        setInput('');
        setFilteredOptions([]);
        setIsOpen(false);
        setSelectedIndex(-1);
        setIsSelected(false);
        inputRef.current?.focus();
    };

    const handleFocus = () => {
        // Only show dropdown if the current value is not a selected item
        if (!isSelected && query.length >= minChars && options.length > 0) {
            const filtered = options.filter(o =>
                o.name.toLowerCase().includes(query.toLowerCase())
            ).slice(0, maxResults);
            setFilteredOptions(filtered);
            setIsOpen(filtered.length > 0);
        }
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
                    onFocus={handleFocus}
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
                    ) : filteredOptions.length > 0 ? (
                        <ul ref={listRef} className="py-1">
                            {filteredOptions.map((option, index) => (
                                <li
                                    key={option.id}
                                    onClick={() => handleSuggestionClick(option)}
                                    className={`px-4 py-3 cursor-pointer transition-colors border-l-4 ${
                                        index === selectedIndex
                                            ? 'bg-gray-50 text-gray-900 border-blue-500'
                                            : 'bg-white border-transparent hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="text-sm">
                                        {highlightMatch(option.name, query)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : query.length >= minChars ? (
                        <div className="px-4 py-3 text-gray-500 text-sm">
                            No results found for "{query}"
                        </div>
                    ) : (
                        <div className="px-4 py-3 text-gray-500 text-sm">
                            Type at least {minChars} character{minChars > 1 ? 's' : ''} to search
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};