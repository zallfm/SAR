import React from "react";
import clsx from "clsx";
import { Button } from "./Button";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tooltip?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  mode?: string;
  hoverColor?: 'blue' | 'red';
};

export const IconButton: React.FC<IconButtonProps> = ({
  className,
  children,
  tooltip,
  label,
  leftIcon,
  mode = "icon",
  hoverColor = 'blue',
  ...props
}) => {
  const hoverClasses = hoverColor === 'blue'
    ? "text-gray-500 hover:text-blue-600"
    : "text-gray-500 hover:text-red-600";

  if (mode === "label") {
    return (
      <Button
        variant="primary"
        size="md"
        leftIcon={leftIcon}
        className={clsx("!bg-blue-600 !text-white hover:!bg-blue-700", className)}
        {...props}
      >
        {label}
      </Button>
    );
  }
  return (
    <>
      <button
        className={clsx(
          "flex items-center justify-center p-2 rounded-lg transition-colors",
          hoverClasses,
          "disabled:!opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        {children}
      </button>
      {tooltip && (
        <div className={clsx(
          "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10",
          hoverColor === 'blue' ? "bg-blue-600" : "bg-red-600"
        )}>
          {tooltip}
        </div>
      )}
    </>
  );
};
