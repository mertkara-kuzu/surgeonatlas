"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  size?: "lg" | "md";
  className?: string;
}

export default function SearchBar({ placeholder, size = "md", className = "" }: SearchBarProps) {
  const t = useTranslations();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const isLarge = size === "lg";

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search
        className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ${
          isLarge ? "h-5 w-5" : "h-4 w-4"
        }`}
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || t("home.searchPlaceholder")}
        className={`w-full rounded-xl border border-gray-200 bg-white shadow-sm transition-all focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 ${
          isLarge
            ? "py-4 pl-12 pr-32 text-base"
            : "py-3 pl-10 pr-24 text-sm"
        }`}
      />
      <button
        type="submit"
        className={`btn-primary absolute right-2 top-1/2 -translate-y-1/2 ${
          isLarge ? "!px-6 !py-2.5" : "!px-4 !py-2 text-sm"
        }`}
      >
        {t("common.search")}
      </button>
    </form>
  );
}
