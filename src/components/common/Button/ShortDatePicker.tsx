// ShortDatePicker.tsx
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

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
  const parsed = React.useMemo(() => {
    if (!value) return null;
    const withYear = `${value}/2000`;
    const d = dayjs(withYear, "DD/MM/YYYY", true);
    return d.isValid() ? d.toDate() : null;
  }, [value]);

  return (
    <DatePicker
      selected={parsed}
      onChange={(date) => {
        if (!date) return onChange("");
        onChange(dayjs(date).format("DD/MM"));
      }}
      dateFormat="dd/MM"
      placeholderText={placeholder}
      className={className}
      showPopperArrow={false}
      todayButton="Today"
      showMonthDropdown
    />
  );
}
