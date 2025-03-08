import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IconClockHour3, IconSearch, IconX } from "@tabler/icons-react";
import * as React from "react";

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
   * Recent search history items
   */
  history?: string[];

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
}

export function SearchBar({
  value = "",
  onChange,
  onSearch,
  onHistorySelect,
  history = [],
  placeholder = "Search GitHub users...",
  className,
  isLoading = false,
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

    const query = inputValue.trim();
    if (query && onSearch) {
      onSearch(query);
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
    setInputValue(query);
    if (onChange) onChange(query);
    if (onHistorySelect) onHistorySelect(query);
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
    if (!history || !Array.isArray(history)) return [];

    return history
      .filter(
        (item) => item && (!inputValue || item.toLowerCase().includes(inputValue.toLowerCase()))
      )
      .slice(0, 5);
  }, [history, inputValue]);

  return (
    <div className={cn("relative w-full", className)} ref={searchBarRef}>
      <form onSubmit={handleSubmit} className="flex items-center w-full">
        <div className="relative flex-grow flex items-center rounded-l-md border border-r-0 border-input bg-transparent px-3 py-1">
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
        <Button
          type="submit"
          variant="default"
          size="sm"
          className="rounded-l-none"
          disabled={isLoading || !inputValue.trim()}
        >
          {isLoading ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            "Search"
          )}
        </Button>
      </form>

      {showHistory && filteredHistory.length > 0 && (
        <div className="absolute w-full bg-background border rounded-md shadow-lg mt-1 z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs font-medium text-muted-foreground px-2 mb-1">Recent Searches</p>
            {filteredHistory.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded hover:bg-muted"
                onClick={() => handleHistoryClick(item)}
              >
                <IconClockHour3 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
