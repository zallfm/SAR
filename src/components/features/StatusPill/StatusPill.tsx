import React from 'react';

export type StatusType = 'Success' | 'Error' | 'InProgress' | 'Active' | 'Inactive' | 'Finished';

interface StatusPillProps {
  status: StatusType;
}

const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap inline-block text-center min-w-[80px]";
  
  let statusClasses = "";
  let displayText: string = status;

  switch (status) {
    case 'Success':
    case 'Active':
    case 'Finished':
      statusClasses = "bg-green-100 text-green-700";
      break;
    case 'Error':
    case 'Inactive':
      statusClasses = "bg-red-100 text-red-700";
      break;
    case 'InProgress':
      statusClasses = "bg-yellow-100 text-yellow-800";
      // FIX: The type of displayText was inferred as StatusType, but we want to display a different string.
      displayText = 'In Progress';
      break;
    default:
      statusClasses = "bg-gray-100 text-gray-700";
      break;
  }

  return (
    <span className={`${baseClasses} ${statusClasses}`}>
      {displayText}
    </span>
  );
};

export default StatusPill;
