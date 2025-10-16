import React from "react";
import clsx from "clsx";
import { SendIcon } from "../../icons/SendIcon";

type ActionReviewProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tooltip?: string;
};

export const ActionReview: React.FC<ActionReviewProps> = ({
  className,
  tooltip = "Review",
  ...props
}) => {
  return (
    <div className="group relative inline-flex">
      <button
        aria-label={tooltip}
        className={clsx(
          "text-gray-500 hover:text-blue-600 transition-colors",
          className
        )}
        {...props}
      >
        <SendIcon />
      </button>
      {tooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-blue-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {tooltip}
        </div>
      )}
    </div>
  );
};
