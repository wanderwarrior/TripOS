"use client";

import { Filter, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Presentational shell for the filter bar above a DataTable. Each table
// supplies its own search box + facet selects as children; this just gives
// them a consistent frame and the "showing X of Y" count.

export function TableFilters({
  children,
  shown,
  total,
  onClear,
  hasActiveFilters,
}: {
  children: React.ReactNode;
  shown: number;
  total: number;
  onClear?: () => void;
  hasActiveFilters?: boolean;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <Filter className="h-3.5 w-3.5" />
        Filter
      </span>
      {children}
      <span className="ml-auto text-xs text-muted-foreground tabular-nums">
        {shown === total ? `${total}` : `${shown} of ${total}`}
      </span>
      {hasActiveFilters && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-navy"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      ) : null}
    </div>
  );
}

export function FilterSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Search…"}
        className="h-9 w-52 rounded-xl border border-line bg-white pl-8 pr-3 text-xs focus:outline-none focus:border-sand"
      />
    </div>
  );
}

export function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 rounded-xl border bg-white px-3 text-xs focus:outline-none focus:border-sand",
        value !== "all" ? "border-sand-300 text-navy" : "border-line"
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
