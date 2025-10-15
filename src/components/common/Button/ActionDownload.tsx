import React from "react";
import clsx from "clsx";
import { DownloadActionIcon } from "../../icons/DownloadActionIcon"; // sesuaikan path ikon

type ActionDownloadProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tooltip?: string;
};

export const ActionDownload: React.FC<ActionDownloadProps> = ({
  className,
  tooltip = "Download",
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
        <DownloadActionIcon />
      </button>
      {tooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-blue-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {tooltip}
        </div>
      )}
    </div>
  );
};
