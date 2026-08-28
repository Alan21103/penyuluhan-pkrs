"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  value?: string; // Format: "YYYY-MM-DD"
  onChange?: (dateString: string, date: Date | null) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  minDate?: string | Date;
  maxDate?: string | Date;
  locale?: "id" | "en";
  className?: string;
  id?: string;
  required?: boolean;
  variant?: "default" | "error";
  clearable?: boolean;
}

const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_NAMES_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DAYS_HEADER_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAYS_HEADER_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function DatePicker({
  value = "",
  onChange,
  placeholder = "Select a date",
  label,
  error,
  disabled = false,
  minDate,
  maxDate,
  locale = "id",
  className,
  id,
  required = false,
  variant,
  clearable = true,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date
  const selectedDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split("-").map(Number);
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  // Current view month & year in the calendar
  const [viewYear, setViewYear] = useState<number>(() => {
    return selectedDate ? selectedDate.getFullYear() : new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    return selectedDate ? selectedDate.getMonth() : new Date().getMonth();
  });

  // When value changes from outside, sync the view month/year
  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [selectedDate]);

  // Close calendar popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Format date for display
  const formattedDisplay = useMemo(() => {
    if (!selectedDate) return "";
    const day = selectedDate.getDate();
    const monthIndex = selectedDate.getMonth();
    const year = selectedDate.getFullYear();

    if (locale === "id") {
      const monthShort = MONTH_NAMES_ID[monthIndex].slice(0, 3);
      return `${day} ${monthShort} ${year}`;
    } else {
      const monthShort = MONTH_NAMES_EN[monthIndex].slice(0, 3);
      return `${day} ${monthShort} ${year}`;
    }
  }, [selectedDate, locale]);

  // Navigation handlers
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Convert Date to YYYY-MM-DD
  const toDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Select day
  const handleSelectDay = (date: Date) => {
    const str = toDateString(date);
    onChange?.(str, date);
    setIsOpen(false);
  };

  // Clear handler
  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange?.("", null);
    setIsOpen(false);
  };

  // Select Today handler
  const handleToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    handleSelectDay(today);
  };

  // Calculate calendar grid days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isSelected: boolean;
      isToday: boolean;
      isDisabled: boolean;
    }> = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const min = minDate ? new Date(minDate) : null;
    if (min) min.setHours(0, 0, 0, 0);
    const max = maxDate ? new Date(maxDate) : null;
    if (max) max.setHours(23, 59, 59, 999);

    // 1. Previous month padding days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth - 1, daysInPrevMonth - i);
      const isSelected =
        !!selectedDate &&
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getDate() === selectedDate.getDate();
      const isToday = d.getTime() === today.getTime();
      const isDisabled = (min && d < min) || (max && d > max);

      days.push({
        date: d,
        isCurrentMonth: false,
        isSelected: !!isSelected,
        isToday,
        isDisabled: !!isDisabled,
      });
    }

    // 2. Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const d = new Date(viewYear, viewMonth, i);
      const isSelected =
        !!selectedDate &&
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getDate() === selectedDate.getDate();
      const isToday = d.getTime() === today.getTime();
      const isDisabled = (min && d < min) || (max && d > max);

      days.push({
        date: d,
        isCurrentMonth: true,
        isSelected: !!isSelected,
        isToday,
        isDisabled: !!isDisabled,
      });
    }

    // 3. Next month padding days to complete 35 or 42 grid slots
    const totalSlots = days.length > 35 ? 42 : 35;
    const remainingSlots = totalSlots - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const d = new Date(viewYear, viewMonth + 1, i);
      const isSelected =
        !!selectedDate &&
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getDate() === selectedDate.getDate();
      const isToday = d.getTime() === today.getTime();
      const isDisabled = (min && d < min) || (max && d > max);

      days.push({
        date: d,
        isCurrentMonth: false,
        isSelected: !!isSelected,
        isToday,
        isDisabled: !!isDisabled,
      });
    }

    return days;
  }, [viewYear, viewMonth, selectedDate, minDate, maxDate]);

  const monthNames = locale === "id" ? MONTH_NAMES_ID : MONTH_NAMES_EN;
  const daysHeader = locale === "id" ? DAYS_HEADER_ID : DAYS_HEADER_EN;
  const hasError = Boolean(error || variant === "error");

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      {/* ── Input Trigger Trigger ── */}
      <div
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full h-11 px-3.5 rounded-xl border flex items-center justify-between text-sm transition-all duration-150 cursor-pointer select-none",
          "bg-white dark:bg-slate-900",
          hasError
            ? "border-rose-400 dark:border-rose-600 ring-2 ring-rose-500/10 text-rose-600 bg-rose-50/20"
            : isOpen
            ? "border-blue-500 ring-2 ring-blue-500/20 text-slate-900 dark:text-white"
            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-900 dark:text-white",
          disabled && "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800"
        )}
      >
        <span
          className={cn(
            "truncate",
            !formattedDisplay && "text-slate-400 dark:text-slate-500"
          )}
        >
          {formattedDisplay || placeholder}
        </span>

        {/* Right Icons: Clear X / Error / Calendar */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {formattedDisplay && clearable && !disabled ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Hapus tanggal"
              aria-label="Clear date"
            >
              <X className="w-4 h-4" />
            </button>
          ) : hasError ? (
            <AlertCircle className="w-4 h-4 text-rose-500" />
          ) : (
            <CalendarIcon
              className={cn(
                "w-4 h-4 transition-colors",
                isOpen
                  ? "text-blue-500"
                  : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600"
              )}
            />
          )}
        </div>
      </div>

      {/* Error Message Helper */}
      {error && (
        <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* ── Interactive Calendar Popover (Expanded Calendar View) ── */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-[290px] sm:w-[310px] p-4 bg-white dark:bg-slate-900",
            "rounded-2xl border border-slate-200/90 dark:border-slate-800",
            "shadow-[0_12px_36px_-6px_rgba(0,0,0,0.12)] dark:shadow-none",
            "animate-in fade-in-50 zoom-in-95 duration-150"
          )}
        >
          {/* Header: < Month Year > */}
          <div className="flex items-center justify-between mb-4 px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              {monthNames[viewMonth]} {viewYear}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of week row */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {daysHeader.map((d, idx) => (
              <div
                key={idx}
                className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((dayItem, idx) => {
              const dayNum = dayItem.date.getDate();

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={dayItem.isDisabled}
                  onClick={() => !dayItem.isDisabled && handleSelectDay(dayItem.date)}
                  className={cn(
                    "w-8 h-8 mx-auto rounded-full text-xs flex items-center justify-center transition-all duration-150 relative cursor-pointer",
                    // Selected state
                    dayItem.isSelected
                      ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25"
                      : // Current Month vs Padding Months
                      dayItem.isCurrentMonth
                      ? "text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600"
                      : "text-slate-300 dark:text-slate-600 hover:text-slate-500",
                    // Today Indicator (if not selected)
                    dayItem.isToday &&
                      !dayItem.isSelected &&
                      "font-bold text-blue-600 ring-1 ring-blue-500/40",
                    // Disabled
                    dayItem.isDisabled &&
                      "opacity-25 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer: Clear & Today */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-4 pt-3 px-1">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={handleToday}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
