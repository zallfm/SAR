import React from 'react';
import { APP_VERSION } from '../../../config/version';

const Version: React.FC = () => {
  return (
    <div className="px-4 py-2 text-xs text-gray-500 mt-auto">
      <div className="text-center">
        <span className="font-medium">v{APP_VERSION}</span>
      </div>
    </div>
  );
};

export default Version;
