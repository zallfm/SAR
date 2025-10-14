import React, { useState, useMemo } from 'react';
import { initialSchedules } from '../data';
import type { Schedule } from '../data';
import { SearchIcon } from './icons/SearchIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { EditIcon } from './icons/EditIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import ScheduleEditModal from './ScheduleEditModal';
import ConfirmationModal from './ConfirmationModal';
import SetScheduleModal from './SetScheduleModal';
import SuccessModal from './SuccessModal';
import StatusConfirmationModal from './StatusConfirmationModal';
import { formatDdMmToDisplayDate } from '../utils/dateFormatter';
import StatusPill from './StatusPill';

const SchedulePage: React.FC = () => {
    const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    // Modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSetScheduleModalOpen, setIsSetScheduleModalOpen] = useState(false);
    const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState<Schedule[] | null>(null);
    const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
    const [scheduleToChangeStatus, setScheduleToChangeStatus] = useState<Schedule | null>(null);


    // Filters
    const [appIdFilter, setAppIdFilter] = useState('');
    const [appNameFilter, setAppNameFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const filteredSchedules = useMemo(() => {
        return schedules.filter(schedule => {
            const appIdMatch = appIdFilter ? schedule.applicationId.toLowerCase().includes(appIdFilter.toLowerCase()) : true;
            const appNameMatch = appNameFilter ? schedule.applicationName.toLowerCase().includes(appNameFilter.toLowerCase()) : true;
            const statusMatch = statusFilter ? schedule.status === statusFilter : true;
            return appIdMatch && appNameMatch && statusMatch;
        });
    }, [schedules, appIdFilter, appNameFilter, statusFilter]);
    
    const totalItems = filteredSchedules.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentSchedules = filteredSchedules.slice(startIndex, startIndex + itemsPerPage);

    const startItem = totalItems > 0 ? startIndex + 1 : 0;
    const endItem = Math.min(startIndex + itemsPerPage, totalItems);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(currentSchedules.map(s => s.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: number) => {
        setSelectedRows(prev => 
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };
    
    const isAllSelectedOnPage = currentSchedules.length > 0 && selectedRows.length > 0 && currentSchedules.every(s => selectedRows.includes(s.id));

    const handleOpenEditModal = () => {
        if (selectedRows.length > 0) {
            setIsEditModalOpen(true);
        }
    };

    const handleEditSave = (updatedSchedules: Schedule[]) => {
        setPendingUpdate(updatedSchedules);
        setIsEditModalOpen(false);
        setIsSaveConfirmOpen(true);
    };
    
    const handleConfirmEditSave = () => {
        if (pendingUpdate) {
            const updatesMap = new Map(pendingUpdate.map(p => [p.id, p]));
            
            setSchedules(prevSchedules => 
                prevSchedules.map(schedule => 
                    updatesMap.has(schedule.id)
                        ? updatesMap.get(schedule.id)!
                        : schedule
                )
            );
            
            setSelectedRows([]);
            setShowSuccessModal(true);
        }
        setIsSaveConfirmOpen(false);
        setPendingUpdate(null);
    };
    
    const handleAddNewSchedules = (newSchedules: Omit<Schedule, 'id'>[]) => {
        const highestId = schedules.reduce((maxId, schedule) => Math.max(schedule.id, maxId), 0);
        
        const schedulesToAdd = newSchedules.map((s, index) => {
            const formatSyncDate = (syncStr: string) => {
                const parts = syncStr.split(' - ');
                if (parts.length === 2) {
                    const start = formatDdMmToDisplayDate(parts[0]);
                    const end = formatDdMmToDisplayDate(parts[1]);
                    return `${start} - ${end}`;
                }
                return syncStr;
            };

            return {
                ...s,
                id: highestId + 1 + index,
                scheduleSync: formatSyncDate(s.scheduleSync),
                scheduleUar: formatDdMmToDisplayDate(s.scheduleUar),
            };
        });

        setSchedules(prev => [...schedulesToAdd, ...prev]);
        setIsSetScheduleModalOpen(false);
        setShowSuccessModal(true);
    };

    const handleOpenStatusConfirm = (schedule: Schedule) => {
        setScheduleToChangeStatus(schedule);
        setIsStatusConfirmOpen(true);
    };

    const handleCloseStatusConfirm = () => {
        setScheduleToChangeStatus(null);
        setIsStatusConfirmOpen(false);
    };

    const handleConfirmStatusChange = () => {
        if (!scheduleToChangeStatus) return;

        setSchedules(prev =>
            prev.map(s =>
                s.id === scheduleToChangeStatus.id
                    ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' }
                    : s
            )
        );
        
        handleCloseStatusConfirm();
        setShowSuccessModal(true);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Schedule</h2>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Application ID"
                                value={appIdFilter}
                                onChange={e => setAppIdFilter(e.target.value)}
                                className="w-full sm:w-48 pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                         <div className="relative">
                            <input
                                type="text"
                                placeholder="Application Name"
                                value={appNameFilter}
                                onChange={e => setAppNameFilter(e.target.value)}
                                className="w-full sm:w-48 pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <div className="relative">
                           <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className={`w-full sm:w-40 pl-3 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusFilter ? 'text-gray-800' : 'text-gray-500'}`}
                            >
                                <option value="">Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            disabled={selectedRows.length === 0}
                            onClick={handleOpenEditModal}
                            className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-sm rounded-lg transition-colors disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                        >
                            <EditIcon className="w-4 h-4" />
                            Edit
                        </button>
                        <button
                            onClick={() => setIsSetScheduleModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <CalendarIcon className="w-4 h-4" />
                            Set Schedule
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm text-left text-gray-700">
                        <thead className="text-sm text-black font-bold">
                            <tr className="border-b-2 border-gray-200">
                                <th scope="col" className="px-4 py-3 w-12 text-sm">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                        checked={isAllSelectedOnPage}
                                        onChange={handleSelectAll}
                                        aria-label="Select all rows on this page"
                                    />
                                </th>
                                <th scope="col" className="px-4 py-3 text-sm">Application ID</th>
                                <th scope="col" className="px-4 py-3 text-sm">Application Name</th>
                                <th scope="col" className="px-4 py-3 text-sm">Schedule Synchronize</th>
                                <th scope="col" className="px-4 py-3 text-sm">Schedule UAR</th>
                                <th scope="col" className="px-4 py-3 text-sm">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentSchedules.map((schedule) => (
                                <tr key={schedule.id} className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        <input 
                                            type="checkbox" 
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                            checked={selectedRows.includes(schedule.id)}
                                            onChange={() => handleSelectRow(schedule.id)}
                                            aria-label={`Select row ${schedule.id}`}
                                        />
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-gray-900 text-sm">{schedule.applicationId}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{schedule.applicationName}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{schedule.scheduleSync}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{schedule.scheduleUar}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenStatusConfirm(schedule)}
                                            className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
                                            aria-label={`Change status for ${schedule.applicationName}`}
                                        >
                                            <StatusPill status={schedule.status} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                 <div className="flex justify-between items-center mt-6 text-sm text-gray-500">
                     <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100 appearance-none bg-white"
                                aria-label="Items per page"
                            >
                                <option value={10}>10 / Page</option>
                                <option value={25}>25 / Page</option>
                                <option value={50}>50 / Page</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                <ChevronDownIcon className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>Showing {startItem}-{endItem} of {totalItems}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => p - 1)}
                                disabled={currentPage === 1}
                                className="px-2 py-1 border bg-white border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Previous Page"
                            >
                                &lt;
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage >= totalPages}
                                className="px-2 py-1 border bg-white border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Next Page"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isEditModalOpen && (
                <ScheduleEditModal 
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleEditSave}
                    schedulesToEdit={schedules.filter(s => selectedRows.includes(s.id))}
                />
            )}
            {isSetScheduleModalOpen && (
                <SetScheduleModal 
                    onClose={() => setIsSetScheduleModalOpen(false)}
                    onSave={handleAddNewSchedules}
                />
            )}
            {isSaveConfirmOpen && (
                <ConfirmationModal 
                    onClose={() => setIsSaveConfirmOpen(false)}
                    onConfirm={handleConfirmEditSave}
                    title="Edit Schedule Confirmation"
                    message="Do you want to submit?"
                />
            )}
            {showSuccessModal && (
                <SuccessModal
                    onClose={() => setShowSuccessModal(false)}
                />
            )}
            {isStatusConfirmOpen && scheduleToChangeStatus && (
                <StatusConfirmationModal 
                    onClose={handleCloseStatusConfirm}
                    onConfirm={handleConfirmStatusChange}
                    currentStatus={scheduleToChangeStatus.status}
                />
            )}
        </div>
    );
};

export default SchedulePage;