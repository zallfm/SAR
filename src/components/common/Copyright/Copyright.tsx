import React from 'react';
import { COPYRIGHT_YEAR, COPYRIGHT_OWNER } from '../../../config/version';

const Copyright: React.FC = () => {
  return (
    <div className="text-center py-4 text-sm text-gray-500">
      <p>&copy; {COPYRIGHT_YEAR} {COPYRIGHT_OWNER}. All rights reserved.</p>
    </div>
  );
};

export default Copyright;
