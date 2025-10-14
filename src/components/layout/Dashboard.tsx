import React, { useState } from 'react';
import type { User } from '../../../types';
import Header from './Header';
import Sidebar from './Sidebar';
import DashboardContent from '../../../components/DashboardContent';
import ApplicationPage from '../../../components/ApplicationPage';
import LoggingMonitoringPage from '../../../components/LoggingMonitoringPage';
import type { LogEntry, UarSystemOwnerRecord, UarDivisionUserRecord } from '../../../data';
import LoggingMonitoringDetailPage from '../../../components/LoggingMonitoringDetailPage';
import UarPicPage from '../../../components/UarPicPage';
import SystemMasterPage from '../../../components/SystemMasterPage';
import UarLatestRolePage from '../../../components/UarLatestRolePage';
import SchedulePage from '../../../components/SchedulePage';
import UarSystemOwnerPage from '../../../components/UarSystemOwnerPage';
import UarProgressPage from '../../../components/UarProgressPage';
import UarSystemOwnerDetailPage from '../../../components/UarSystemOwnerDetailPage';
import UarDivisionUserPage from '../../../components/UarDivisionUserPage';
import UarDivisionUserDetailPage from '../../../components/UarDivisionUserDetailPage';

export type ActiveView = 
  | 'dashboard'
  | 'application'
  | 'uar_progress'
  | 'uar_division_user'
  | 'uar_division_user_detail'
  | 'uar_system_owner'
  | 'uar_system_owner_detail'
  | 'uar_latest_role'
  | 'uar_pic'
  | 'schedule'
  | 'system_master'
  | 'logging_monitoring'
  | 'logging_monitoring_detail';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [selectedUarRecord, setSelectedUarRecord] = useState<UarSystemOwnerRecord | null>(null);
  const [selectedUarDivisionRecord, setSelectedUarDivisionRecord] = useState<UarDivisionUserRecord | null>(null);

  const handleViewDetail = (log: LogEntry) => {
    setSelectedLog(log);
    setActiveView('logging_monitoring_detail');
  };

  const handleBackToLogs = () => {
    setSelectedLog(null);
    setActiveView('logging_monitoring');
  };

  const handleReviewUarRecord = (record: UarSystemOwnerRecord) => {
    setSelectedUarRecord(record);
    setActiveView('uar_system_owner_detail');
  }

  const handleBackToUarSystemOwner = () => {
    setSelectedUarRecord(null);
    setActiveView('uar_system_owner');
  }

  const handleReviewUarDivisionRecord = (record: UarDivisionUserRecord) => {
    setSelectedUarDivisionRecord(record);
    setActiveView('uar_division_user_detail');
  }

  const handleBackToUarDivisionUser = () => {
    setSelectedUarDivisionRecord(null);
    setActiveView('uar_division_user');
  }


  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardContent />;
      case 'application':
        return <ApplicationPage />;
      case 'logging_monitoring':
        return <LoggingMonitoringPage onViewDetail={handleViewDetail} />;
      case 'logging_monitoring_detail':
        return selectedLog ? <LoggingMonitoringDetailPage logEntry={selectedLog} onBack={handleBackToLogs} /> : <LoggingMonitoringPage onViewDetail={handleViewDetail} />;
      case 'uar_pic':
        return <UarPicPage />;
      case 'system_master':
        return <SystemMasterPage user={user} />;
      case 'uar_latest_role':
        return <UarLatestRolePage />;
      case 'schedule':
        return <SchedulePage />;
      case 'uar_system_owner':
        return <UarSystemOwnerPage onReview={handleReviewUarRecord} />;
       case 'uar_system_owner_detail':
        return selectedUarRecord ? <UarSystemOwnerDetailPage record={selectedUarRecord} onBack={handleBackToUarSystemOwner} user={user} /> : <UarSystemOwnerPage onReview={handleReviewUarRecord} />;
      case 'uar_progress':
        return <UarProgressPage />;
      case 'uar_division_user':
        return <UarDivisionUserPage onReview={handleReviewUarDivisionRecord} />;
      case 'uar_division_user_detail':
        return selectedUarDivisionRecord ? <UarDivisionUserDetailPage record={selectedUarDivisionRecord} onBack={handleBackToUarDivisionUser} user={user} /> : <UarDivisionUserPage onReview={handleReviewUarDivisionRecord} />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={onLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;