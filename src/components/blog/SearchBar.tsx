"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "搜索文章..." }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    if (onSearch) {
      onSearch(trimmed);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className={styles.searchBar}>
      <Search size={18} className={styles.icon} />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
      />
      {query && (
        <button type="button" onClick={handleClear} className={styles.clearButton}>
          <X size={16} />
        </button>
      )}
    </form>
  );
}