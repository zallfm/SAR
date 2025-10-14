import React, { useState } from 'react';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import type { ActiveView } from './Dashboard';

interface SidebarProps {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(true);
  const [isUarOpen, setIsUarOpen] = useState(true);

  const NavLink: React.FC<{ 
      view: ActiveView; 
      children: React.ReactNode; 
      indent?: boolean;
      active?: boolean;
  }> = ({ view, children, indent }) => {
    const isLoggingMonitoringActive = view === 'logging_monitoring' && (activeView === 'logging_monitoring' || activeView === 'logging_monitoring_detail');
    const isUarDivisionUserActive = view === 'uar_division_user' && (activeView === 'uar_division_user' || activeView === 'uar_division_user_detail');
    const isUarSystemOwnerActive = view === 'uar_system_owner' && (activeView === 'uar_system_owner' || activeView === 'uar_system_owner_detail');

    const isActive = isLoggingMonitoringActive || isUarDivisionUserActive || isUarSystemOwnerActive || activeView === view;

    return (
        <button 
            onClick={() => setActiveView(view)}
            className={`flex items-center w-full text-left text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-200'
            } ${indent ? 'pl-8' : ''}`}
        >
          {children}
        </button>
    );
  };
  
  return (
    <aside className="w-64 bg-white flex-shrink-0 p-4 border-r border-gray-200 hidden md:block">
      <nav className="space-y-1">
        <NavLink view="dashboard">Dashboard</NavLink>
        
        <div>
          <button 
            className="flex items-center justify-between w-full text-sm font-medium px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-200"
            onClick={() => setIsMasterDataOpen(!isMasterDataOpen)}
            aria-expanded={isMasterDataOpen}
          >
            <span>Master Data</span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isMasterDataOpen ? 'rotate-180' : ''}`} />
          </button>
          {isMasterDataOpen && (
            <div className="mt-1 space-y-1">
              <NavLink view="uar_pic" indent>UAR PIC</NavLink>
              <NavLink view="application" indent>Application</NavLink>
              <NavLink view="schedule" indent>Schedule</NavLink>
              <NavLink view="system_master" indent>System Master</NavLink>
            </div>
          )}
        </div>

        <div>
          <button 
            className="flex items-center justify-between w-full text-sm font-medium px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-200"
            onClick={() => setIsUarOpen(!isUarOpen)}
            aria-expanded={isUarOpen}
          >
            <span>User Access Review</span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isUarOpen ? 'rotate-180' : ''}`} />
          </button>
          {isUarOpen && (
            <div className="mt-1 space-y-1">
              <NavLink view="uar_division_user" indent>UAR Division User</NavLink>
              <NavLink view="uar_system_owner" indent>UAR System Owner</NavLink>
              <NavLink view="uar_latest_role" indent>UAR Latest Role</NavLink>
              <NavLink view="uar_progress" indent>UAR Progress</NavLink>
            </div>
          )}
        </div>
        
        <NavLink view="logging_monitoring">Log Monitoring</NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;