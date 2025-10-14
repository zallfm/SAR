import React from 'react';
import { ApprovedIcon } from './icons/ApprovedIcon';
import { RevokedIcon } from './icons/RevokedIcon';
import { AccessReviewCompleteIcon } from './icons/AccessReviewCompleteIcon';
import { UpTrendIcon } from './icons/UpTrendIcon';
import { DownTrendIcon } from './icons/DownTrendIcon';

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down';
  trendText: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendDirection, trendText, icon }) => {
  const isUp = trendDirection === 'up';
  const trendColor = isUp ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          <div className={`flex items-center mt-2 text-xs ${trendColor}`}>
            {isUp ? <UpTrendIcon className="w-4 h-4 mr-1" /> : <DownTrendIcon className="w-4 h-4 mr-1" />}
            <span className="font-semibold">{trend}</span>
            <span className="text-gray-500 ml-1">{trendText}</span>
          </div>
        </div>
        <div className="w-12 h-12 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
};

interface TaskListProps {
  title: string;
  items: string[];
}

const TaskList: React.FC<TaskListProps> = ({ title, items }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
          <p className="text-sm text-gray-600">{item}</p>
          <button className="text-xs font-semibold bg-teal-100 text-teal-600 px-4 py-1.5 rounded-md hover:bg-teal-200 transition-colors">
            START
          </button>
        </div>
      ))}
    </div>
    <div className="mt-6 text-center">
      <button className="text-sm font-semibold bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
        See More
      </button>
    </div>
  </div>
);

const DashboardContent: React.FC = () => {
  const reviewItems = ['UAR_072025_IPPCS', 'UAR_072025_IPPCS', 'UAR_072025_PAS'];
  const approveItems = ['UAR_072025_IPPCS', 'UAR_072025_IPPCS', 'UAR_072025_PAS'];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Approved" 
          value="10%" 
          trend="1.3%" 
          trendDirection="up" 
          trendText="Up from past week"
          icon={<ApprovedIcon />} 
        />
        <StatCard 
          title="Revoked" 
          value="5%" 
          trend="4.3%" 
          trendDirection="down" 
          trendText="Down from yesterday"
          icon={<RevokedIcon />} 
        />
        <StatCard 
          title="Access Review Complete" 
          value="20%" 
          trend="1.8%" 
          trendDirection="up" 
          trendText="Up from yesterday"
          icon={<AccessReviewCompleteIcon />}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskList title="To Do Review" items={reviewItems} />
        <TaskList title="To Do Approve" items={approveItems} />
      </div>
    </div>
  );
};

export default DashboardContent;
