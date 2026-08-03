import { useEffect, useRef, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { searchLocations } from "../api/weather";
import { useToast } from "../context/ToastContext";
import { useApp } from "../context/AppContext";
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
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { apiKeyMissing } = useApp();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing stale results when the query is emptied is intentional
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    if (apiKeyMissing) {
      setResults([]);
      setError("API key is missing. Enter it in Settings to enable search.");
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await searchLocations(query);
        setResults(r);
        if (r.length === 0) {
          setError("No matching locations were found. Try a different query.");
        }
      } catch (err) {
        console.error("Search failed:", err);

        const message = "Unable to fetch location results. Check your API key and network.";

        setResults([]);
        setError(message);
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, apiKeyMissing, showToast]);

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
          {!loading && error && <div className="search-empty">{error}</div>}
          {!loading && !error && results.length === 0 && <div className="search-empty">No matching locations</div>}
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                onSelect(r);
                setQuery("");
                setResults([]);
                setError(null);
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
