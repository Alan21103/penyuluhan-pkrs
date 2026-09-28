"use client";

import React, { useState } from "react";

interface SelectWithLainnyaProps {
  id?: string;
  value: string;
  onValueChange: (val: string) => void;
  options: readonly string[];
  placeholder?: string;
  customPlaceholder?: string;
  className?: string;
}

export default function SelectWithLainnya({
  id,
  value,
  onValueChange,
  options,
  placeholder = "Pilih...",
  customPlaceholder = "Ketik pilihan lainnya...",
}: SelectWithLainnyaProps) {
  // Determine if current value is custom (not in preset options except "Lainnya")
  const isLainnya =
    value === "Lainnya" ||
    (value !== "" &&
      !options.slice(0, -1).includes(value) &&
      options[options.length - 1] === "Lainnya");

  const [customText, setCustomText] = useState(
    isLainnya && value !== "Lainnya" ? value : ""
  );

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === "Lainnya") {
      onValueChange("Lainnya");
      setCustomText("");
    } else {
      onValueChange(selected);
      setCustomText("");
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setCustomText(text);
    onValueChange(text || "Lainnya");
  };

  const selectValue = isLainnya ? "Lainnya" : value;

  return (
    <div className="space-y-2">
      <select
        id={id}
        value={selectValue}
        onChange={handleSelectChange}
        className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {isLainnya && (
        <input
          type="text"
          value={customText}
          onChange={handleCustomChange}
          placeholder={customPlaceholder}
          className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          autoFocus
        />
      )}
    </div>
  );
}
