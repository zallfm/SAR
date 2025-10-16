import React from "react";
import clsx from "clsx";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tooltip?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  mode?: string;
};

export const IconButton: React.FC<IconButtonProps> = ({
  className,
  children,
  tooltip,
  label,
  leftIcon,
  mode = "icon",
  ...props
}) => {
  if (mode === "label") {
    return (
      <button
        className={clsx(
          "flex items-center justify-center gap-2 px-4 py-2 font-semibold text-sm rounded-lg transition-colors",
          "border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200",
          "disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500",
          className
        )}
        {...props}
      >
        {leftIcon && <span className="inline-flex">{leftIcon}</span>}
        {label && <span>{label}</span>}
      </button>
    );
  }
  return (
    <>
      <button
        className={clsx("text-gray-500 hover:text-blue-600", className)}
        {...props}
      >
        {children}
      </button>
      {tooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-blue-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {tooltip}
        </div>
      )}
    </>
  );
};
