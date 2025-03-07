import { cn } from "@/lib/utils";
import { IconSearch } from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  onSearch: (username: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [username, setUsername] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && !isLoading) {
      onSearch(username.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className={cn(
          "relative group transition-all duration-300 ease-out",
          "rounded-2xl",
          "glass",
          isFocused ? "shadow-lg ring-2 ring-primary/20" : "shadow"
        )}
      >
        <div className="flex items-center px-4 h-16">
          <IconSearch
            className={cn(
              "h-5 w-5 transition-colors duration-200",
              isFocused ? "text-primary" : "text-muted-foreground"
            )}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for a GitHub user..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "flex-1 bg-transparent border-none outline-none px-3 py-2",
              "text-lg placeholder:text-muted-foreground/70",
              "transition-all duration-200 ease-out"
            )}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!username.trim() || isLoading}
            className={cn(
              "inline-flex items-center justify-center",
              "rounded-xl px-5 py-2 text-sm font-medium",
              "transition-all duration-200 ease-out",
              "bg-primary text-primary-foreground",
              "shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20",
              (!username.trim() || isLoading) && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </div>
      </form>
      <p className="text-xs text-muted-foreground text-center mt-2 opacity-70">
        Try searching for "mukulchugh", "facebook", or "google"
      </p>
    </div>
  );
};

export default SearchBar;
