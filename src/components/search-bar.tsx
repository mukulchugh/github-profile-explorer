import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchHistoryItem } from "@/hooks/use-search-history";
import { cn } from "@/lib/utils";
import { IconClockHour3, IconSearch, IconX } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import * as React from "react";

// Safely format a timestamp, return empty string for invalid timestamps
const safeFormatTimeDistance = (timestamp: number | undefined) => {
  if (!timestamp || isNaN(timestamp) || timestamp <= 0) {
    return ""; // Return empty string for invalid timestamps
  }

  try {
    return formatDistanceToNow(timestamp, { addSuffix: true });
  } catch (error) {
    console.warn("Invalid timestamp encountered:", timestamp, error);
    return ""; // Return empty string if formatting fails
  }
};

interface SearchBarProps {
  /**
   * Current search query value
   */
  value?: string;

  /**
   * Called when the search query changes
   */
  onChange?: (value: string) => void;

  /**
   * Called when search is submitted
   */
  onSearch?: (query: string) => void;

  /**
   * Called when a history item is selected
   */
  onHistorySelect?: (query: string) => void;

  /**
   * Recent search history items (simple string array for backward compatibility)
   */
  history?: string[];

  /**
   * Enhanced search history with timestamps
   */
  enhancedHistory?: SearchHistoryItem[];

  /**
   * Placeholder text for the search input
   */
  placeholder?: string;

  /**
   * Additional class name for the search bar
   */
  className?: string;

  /**
   * Whether the search is currently loading
   */
  isLoading?: boolean;

  /**
   * User data to be saved with the search history
   */
  userData?: GitHubUser;

  /**
   * Function to add to history
   */
  addToHistory: (query: string, userData?: GitHubUser) => void;
}

export function SearchBar({
  value = "",
  onChange,
  onSearch,
  onHistorySelect,
  history = [],
  enhancedHistory = [],
  placeholder = "Search GitHub users...",
  className,
  isLoading = false,
  userData,
  addToHistory,
}: SearchBarProps) {
  // Internal state
  const [inputValue, setInputValue] = React.useState(value);
  const [showHistory, setShowHistory] = React.useState(false);
  const searchBarRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Update internal value when external value changes
  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Handle form submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!value.trim()) return;

    // When a search is performed, also pass any user data if available
    if (onSearch) {
      onSearch(value.trim());
    }

    // If the userData is available (passed as a prop), save it with the query
    if (userData) {
      addToHistory(value.trim(), userData);
    }

    setShowHistory(false);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) onChange(newValue);
  };

  // Handle history selection
  const handleHistoryClick = (query: string) => {
    if (onHistorySelect) {
      onHistorySelect(query);
    }
    setShowHistory(false);
  };

  // Handle clear button
  const handleClearClick = () => {
    setInputValue("");
    if (onChange) onChange("");
    if (inputRef.current) inputRef.current.focus();
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter history based on current input
  const filteredHistory = React.useMemo(() => {
    if (enhancedHistory && enhancedHistory.length > 0) {
      return enhancedHistory
        .filter(
          (item) => !inputValue || item.query.toLowerCase().includes(inputValue.toLowerCase())
        )
        .slice(0, 5);
    }

    if (!history || !Array.isArray(history)) return [];

    return (
      history
        .filter(
          (item) => item && (!inputValue || item.toLowerCase().includes(inputValue.toLowerCase()))
        )
        .slice(0, 5)
        // Convert simple history to enhanced format if needed
        .map((query) => ({ query, timestamp: Date.now() }))
    );
  }, [history, enhancedHistory, inputValue]);

  return (
    <div className={cn("relative w-full", className)} ref={searchBarRef}>
      <form onSubmit={handleSubmit} className="flex items-center w-full">
        <div className="relative flex-grow flex items-center rounded-md border border-input bg-transparent px-3 py-1">
          <IconSearch className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowHistory(true)}
            placeholder={placeholder}
            className="border-0 p-0 shadow-none focus-visible:ring-0 flex-grow"
          />
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleClearClick}
              aria-label="Clear search"
            >
              <IconX className="h-3 w-3" />
            </Button>
          )}
        </div>
      </form>

      {showHistory && filteredHistory.length > 0 && (
        <div className="absolute w-full bg-background border rounded-md shadow-lg mt-1 z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs font-medium text-muted-foreground px-2 mb-1">Recent Searches</p>
            {filteredHistory.map((item) => (
              <div
                key={item.query}
                className="flex items-center justify-between px-2 py-2 cursor-pointer rounded hover:bg-muted group"
                onClick={() => handleHistoryClick(item.query)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="bg-primary/10 rounded-full p-1 text-primary">
                    <IconClockHour3 className="h-3 w-3" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-sm font-medium truncate block">{item.query}</span>
                    <span className="text-xs text-muted-foreground">
                      {safeFormatTimeDistance(item.timestamp)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleHistoryClick(item.query)}
                >
                  Search
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
