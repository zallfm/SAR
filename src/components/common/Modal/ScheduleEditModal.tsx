import React, { useState, useEffect, useMemo } from 'react';
import type { Schedule } from '../../../../data';
import { formatDisplayDateToDdMm, isValidDdMm, formatDdMmToDisplayDate } from '../../../../utils/dateFormatter';

interface EditedScheduleState {
    id: number;
    applicationId: string;
    applicationName: string;
    syncStart: string;
    syncEnd: string;
    uar: string;
}

interface ScheduleEditModalProps {
    onClose: () => void;
    onSave: (updatedSchedules: Schedule[]) => void;
    schedulesToEdit: Schedule[];
}

const ScheduleEditModal: React.FC<ScheduleEditModalProps> = ({ onClose, onSave, schedulesToEdit }) => {
    const [editedSchedules, setEditedSchedules] = useState<EditedScheduleState[]>([]);

    useEffect(() => {
        const initialState = schedulesToEdit.map(schedule => {
            const syncParts = schedule.scheduleSync.split(' - ');
            let start = '', end = '';
            if (syncParts.length === 2) {
                start = formatDisplayDateToDdMm(syncParts[0].trim());
                end = formatDisplayDateToDdMm(syncParts[1].trim());
            } else {
                start = formatDisplayDateToDdMm(schedule.scheduleSync.trim());
            }

            return {
                id: schedule.id,
                applicationId: schedule.applicationId,
                applicationName: schedule.applicationName,
                syncStart: start,
                syncEnd: end,
                uar: formatDisplayDateToDdMm(schedule.scheduleUar.trim())
            };
        });
        setEditedSchedules(initialState);
    }, [schedulesToEdit]);

    const handleScheduleChange = (id: number, field: keyof Omit<EditedScheduleState, 'id' | 'applicationId' | 'applicationName'>, value: string) => {
        setEditedSchedules(prev => 
            prev.map(schedule => 
                schedule.id === id ? { ...schedule, [field]: value } : schedule
            )
        );
    };

    const isFormValid = useMemo(() => {
        return editedSchedules.every(s => 
            isValidDdMm(s.syncStart) && isValidDdMm(s.syncEnd) && isValidDdMm(s.uar)
        );
    }, [editedSchedules]);

    const handleSave = () => {
        if (!isFormValid) return;
        
        const updatedSchedules: Schedule[] = editedSchedules.map(edited => {
            const originalSchedule = schedulesToEdit.find(s => s.id === edited.id)!;
            return {
                ...originalSchedule,
                scheduleSync: `${formatDdMmToDisplayDate(edited.syncStart)} - ${formatDdMmToDisplayDate(edited.syncEnd)}`,
                scheduleUar: formatDdMmToDisplayDate(edited.uar),
            };
        });

        onSave(updatedSchedules);
    };

    const getInputClasses = (value: string) => {
      const baseClasses = "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 text-sm";
      const validClasses = "border-gray-300 focus:ring-blue-500 focus:border-blue-500";
      const invalidClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";
      return `${baseClasses} ${!isValidDdMm(value) && value.length > 0 ? invalidClasses : validClasses}`;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Edit Schedule</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-600 bg-red-100 hover:bg-red-200" aria-label="Close modal">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                       </svg>
                    </button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto">
                    {editedSchedules.map((schedule) => (
                        <div key={schedule.id} className="p-4 border border-gray-200 rounded-lg space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Application ID</label>
                                    <p className="text-sm font-semibold text-gray-800 p-2 bg-gray-100 rounded-md">{schedule.applicationId}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Application Name</label>
                                    <p className="text-sm font-semibold text-gray-800 p-2 bg-gray-100 rounded-md">{schedule.applicationName}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Schedule Synchronize</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="dd/mm"
                                        value={schedule.syncStart}
                                        onChange={(e) => handleScheduleChange(schedule.id, 'syncStart', e.target.value)}
                                        className={getInputClasses(schedule.syncStart)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="dd/mm"
                                        value={schedule.syncEnd}
                                        onChange={(e) => handleScheduleChange(schedule.id, 'syncEnd', e.target.value)}
                                        className={getInputClasses(schedule.syncEnd)}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Schedule UAR</label>
                                <input
                                    type="text"
                                    placeholder="dd/mm"
                                    value={schedule.uar}
                                    onChange={(e) => handleScheduleChange(schedule.id, 'uar', e.target.value)}
                                    className={getInputClasses(schedule.uar)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end items-center px-6 py-4 bg-gray-50 border-t gap-3 mt-auto rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!isFormValid}
                        className="px-8 py-2 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleEditModal;
