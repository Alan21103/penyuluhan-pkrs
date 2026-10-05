"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectCheckboxesProps {
  id?: string;
  value: string; // E.g. "Instagram, TikTok" or "Ruang Rawat Inap, TV RS"
  onValueChange: (val: string) => void;
  options: readonly string[];
  customPlaceholder?: string;
  className?: string;
}

export default function MultiSelectCheckboxes({
  id,
  value = "",
  onValueChange,
  options,
  customPlaceholder = "Ketik platform/lokasi lainnya...",
  className,
}: MultiSelectCheckboxesProps) {
  // Parse existing CSV value
  const standardOptions = useMemo(
    () => options.filter((opt) => opt !== "Lainnya"),
    [options]
  );

  const { parsedStandard, parsedLainnyaChecked, parsedLainnyaText } = useMemo(() => {
    if (!value) {
      return { parsedStandard: [], parsedLainnyaChecked: false, parsedLainnyaText: "" };
    }
    const items = value.split(",").map((s) => s.trim()).filter(Boolean);
    const std: string[] = [];
    let isLainnya = false;
    let customTxt = "";

    items.forEach((item) => {
      if (standardOptions.includes(item)) {
        std.push(item);
      } else if (item.startsWith("Lainnya:")) {
        isLainnya = true;
        customTxt = item.replace("Lainnya:", "").trim();
      } else if (item === "Lainnya") {
        isLainnya = true;
      } else {
        // Custom text without prefix
        isLainnya = true;
        customTxt = item;
      }
    });

    return {
      parsedStandard: std,
      parsedLainnyaChecked: isLainnya,
      parsedLainnyaText: customTxt,
    };
  }, [value, standardOptions]);

  const [selectedStandard, setSelectedStandard] = useState<string[]>(parsedStandard);
  const [isLainnyaChecked, setIsLainnyaChecked] = useState<boolean>(parsedLainnyaChecked);
  const [customText, setCustomText] = useState<string>(parsedLainnyaText);

  // Sync internal state if props value changes from outside
  useEffect(() => {
    setSelectedStandard(parsedStandard);
    setIsLainnyaChecked(parsedLainnyaChecked);
    setCustomText(parsedLainnyaText);
  }, [parsedStandard, parsedLainnyaChecked, parsedLainnyaText]);

  // Helper to emit updated combined string
  const emitValue = (stdList: string[], lainnyaActive: boolean, txt: string) => {
    const list = [...stdList];
    if (lainnyaActive) {
      if (txt.trim()) {
        list.push(`Lainnya: ${txt.trim()}`);
      } else {
        list.push("Lainnya");
      }
    }
    onValueChange(list.join(", "));
  };

  const toggleOption = (opt: string) => {
    let next: string[];
    if (selectedStandard.includes(opt)) {
      next = selectedStandard.filter((item) => item !== opt);
    } else {
      next = [...selectedStandard, opt];
    }
    setSelectedStandard(next);
    emitValue(next, isLainnyaChecked, customText);
  };

  const toggleLainnya = () => {
    const nextChecked = !isLainnyaChecked;
    setIsLainnyaChecked(nextChecked);
    emitValue(selectedStandard, nextChecked, customText);
  };

  const handleCustomTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const txt = e.target.value;
    setCustomText(txt);
    emitValue(selectedStandard, isLainnyaChecked, txt);
  };

  const hasLainnyaInOptions = options.includes("Lainnya");

  return (
    <div id={id} className={cn("space-y-2.5", className)}>
      {/* Checkbox Grid / Badge Pills */}
      <div className="flex flex-wrap gap-2">
        {standardOptions.map((opt) => {
          const isChecked = selectedStandard.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggleOption(opt)}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer select-none",
                isChecked
                  ? "bg-primary/10 text-primary border-primary/40 shadow-2xs font-semibold"
                  : "bg-background text-muted-foreground border-input hover:border-muted-foreground/40 hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "w-4 h-4 rounded-md border flex items-center justify-center transition-all",
                  isChecked
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-input bg-background"
                )}
              >
                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}

        {hasLainnyaInOptions && (
          <button
            type="button"
            onClick={toggleLainnya}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer select-none",
              isLainnyaChecked
                ? "bg-primary/10 text-primary border-primary/40 shadow-2xs font-semibold"
                : "bg-background text-muted-foreground border-input hover:border-muted-foreground/40 hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "w-4 h-4 rounded-md border flex items-center justify-center transition-all",
                isLainnyaChecked
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-input bg-background"
              )}
            >
              {isLainnyaChecked && <Check className="w-3 h-3 stroke-[3]" />}
            </span>
            <span>Lainnya</span>
          </button>
        )}
      </div>

      {/* Input Teks Khusus jika "Lainnya" dicentang */}
      {isLainnyaChecked && (
        <div className="pt-1">
          <input
            type="text"
            value={customText}
            onChange={handleCustomTextChange}
            placeholder={customPlaceholder}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
