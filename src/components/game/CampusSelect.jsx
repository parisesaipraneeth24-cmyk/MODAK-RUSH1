import React, { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, ChevronDown, Check } from "lucide-react";
import { NIAT_CAMPUSES } from "@/components/data/campuses";

export default function CampusSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NIAT_CAMPUSES;
    return NIAT_CAMPUSES.filter((c) => c.toLowerCase().includes(q));
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full h-12 justify-between text-base font-normal"
        >
          <span className={value ? "text-foreground truncate" : "text-muted-foreground"}>
            {value || "Search and select your campus"}
          </span>
          <ChevronDown className="w-5 h-5 opacity-60 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0"
        align="start"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          setTimeout(() => inputRef.current?.focus(), 30);
        }}
      >
        <div className="flex items-center border-b px-3">
          <Search className="w-4 h-4 mr-2 opacity-50" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campus..."
            className="flex h-11 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-[280px] overflow-y-auto overscroll-contain">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No campus found.</div>
          ) : (
            filtered.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                  setQuery("");
                }}
                className="w-full flex items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-amber-50 active:bg-amber-100 transition-colors"
              >
                <Check
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    value === c ? "opacity-100 text-orange-600" : "opacity-0"
                  }`}
                />
                <span className="leading-snug">{c}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}