import { useEffect, useRef, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { searchLocations } from "../api/weather";
import type { SavedLocation } from "../types/weather";

interface Props {
  onSelect: (loc: Omit<SavedLocation, "id">) => void;
  placeholder?: string;
}

export default function SearchBar({ onSelect, placeholder = "Search for a city" }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing stale results when the query is emptied is intentional
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await searchLocations(query);
        setResults(r);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="search-shell">
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="search-input"
          aria-label="Search for a location"
        />
        {loading && <Loader2 size={16} className="search-loading" />}
        {query && !loading && (
          <button
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="search-clear"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {open && query && (
        <div className="search-results">
          {loading && <div className="search-empty">Searching…</div>}
          {!loading && results.length === 0 && <div className="search-empty">No matching locations</div>}
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                onSelect(r);
                setQuery("");
                setResults([]);
                setOpen(false);
              }}
              className="search-result"
            >
              <span className="search-result-name">{r.name}</span>
              <span className="search-result-country">{r.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
