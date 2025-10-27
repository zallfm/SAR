// ShortDatePicker.tsx - Simple dual dropdown approach
import React from "react";

type Props = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
};

export default function ShortDatePicker({
  value,
  onChange,
  placeholder = "dd/mm",
  className,
}: Props) {
  // Parse current value
  const [day, month] = value ? value.split("/") : [null, null];

  const handleDayChange = (newDay: string) => {
    if (!newDay) return;
    const formatted = `${newDay.padStart(2, "0")}/${month || "01"}`;

    onChange(formatted);
  };

  const handleMonthChange = (newMonth: string) => {
    if (!newMonth) return;
    const formatted = `${day || "01"}/${newMonth.padStart(2, "0")}`;
    onChange(formatted);
  };

  // Generate days (1-31)
  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  // Generate months (01-12)
  const months = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  return (
    <div className="flex gap-2 items-center">
      {/* Day selector */}
      <div className="relative flex-1">
        <select
          value={day || ""}
          onChange={(e) => handleDayChange(e.target.value)}
          className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-sm appearance-none"
        >
          <option value="" disabled>
            Day
          </option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d.padStart(2, "0")}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="#9ca3af"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>

      {/* Separator */}
      <span className="text-gray-400 text-lg font-medium">/</span>

      {/* Month selector */}
      <div className="relative flex-1">
        <select
          value={month || ""}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-sm appearance-none"
        >
          <option value="" disabled>
            Month
          </option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="#9ca3af"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
