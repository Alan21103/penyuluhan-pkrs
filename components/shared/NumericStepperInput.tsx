"use client";

import React, { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumericStepperInputProps {
  id?: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unitLabel?: string;
  quickPresets?: number[];
  className?: string;
}

export default function NumericStepperInput({
  id,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  unitLabel = "Eks / Tayangan",
  quickPresets = [10, 50, 100],
  className,
}: NumericStepperInputProps) {
  // Local string state to handle typing smoothly (e.g. temporary blank input while editing)
  const [inputValue, setInputValue] = useState<string>(
    value === undefined || value === null ? "0" : String(value)
  );

  useEffect(() => {
    setInputValue(String(value ?? 0));
  }, [value]);

  const updateValue = (num: number) => {
    let bounded = num;
    if (min !== undefined && bounded < min) bounded = min;
    if (max !== undefined && bounded > max) bounded = max;
    setInputValue(String(bounded));
    onChange(bounded);
  };

  const handleDecrement = () => {
    updateValue((value || 0) - step);
  };

  const handleIncrement = () => {
    updateValue((value || 0) + step);
  };

  const handleQuickAdd = (preset: number) => {
    updateValue((value || 0) + preset);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    if (raw === "") {
      onChange(0);
    } else {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed)) {
        updateValue(parsed);
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Auto-select text so typing immediately overwrites existing value (prevents "010" issue)
    e.target.select();
  };

  const handleBlur = () => {
    if (inputValue === "" || isNaN(Number(inputValue))) {
      setInputValue("0");
      onChange(0);
    }
  };

  return (
    <div id={id} className={cn("space-y-2", className)}>
      {/* Main Stepper Row */}
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-xl border border-input bg-background p-1 shadow-2xs focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
          {/* Decrement Button */}
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= min}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground hover:bg-muted active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent disabled:active:scale-100 transition-all cursor-pointer select-none shrink-0"
            title="Kurangi"
            aria-label="Decrease value"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Numeric Input */}
          <input
            type="number"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            min={min}
            max={max}
            className="w-20 text-center text-sm font-semibold text-foreground bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          {/* Increment Button */}
          <button
            type="button"
            onClick={handleIncrement}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all cursor-pointer select-none shrink-0"
            title="Tambah"
            aria-label="Increase value"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Unit Label Pill */}
        {unitLabel && (
          <span className="px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs font-medium text-muted-foreground whitespace-nowrap">
            {unitLabel}
          </span>
        )}
      </div>

      {/* Quick Add Presets */}
      {quickPresets && quickPresets.length > 0 && (
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="text-[11px] text-muted-foreground mr-1">Tambah cepat:</span>
          {quickPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleQuickAdd(preset)}
              className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/40 text-[11px] font-semibold text-muted-foreground transition-all cursor-pointer select-none"
            >
              +{preset}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
