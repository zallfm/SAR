import React, { useState, useEffect, useMemo } from 'react';
import type { SystemMasterRecord } from '../data';
import type { User } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface SystemMasterModalProps {
    onClose: () => void;
    onSave: (record: SystemMasterRecord) => void;
    recordToEdit?: SystemMasterRecord | null;
    user: User;
}

const toInputDate = (dateStr: string): string => {
    if (!dateStr) return '';
    // Handles DD-MM-YYYY format
    const parts = dateStr.split(' ')[0].split('-');
    if (parts.length !== 3) return '';
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD for input
};

const fromInputDate = (dateStr: string): string => {
    if (!dateStr) return '';
     // Handles YYYY-MM-DD format from input
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY for display
};

const SystemMasterModal: React.FC<SystemMasterModalProps> = ({ onClose, onSave, recordToEdit, user }) => {
    const isEditMode = !!recordToEdit;

    // FIX: Removed explicit generic type to allow `systemValueNum` to be a string in the form state, matching the input's value type.
    const [formData, setFormData] = useState({
        systemType: '',
        systemCode: '',
        validFrom: '',
        validTo: '',
        systemValueText: '',
        systemValueNum: '',
        systemValueTime: '',
    });

    const [dateError, setDateError] = useState('');

    useEffect(() => {
        if (isEditMode && recordToEdit) {
            // FIX: Explicitly set form fields and convert `systemValueNum` to a string for the input.
            setFormData({
                systemType: recordToEdit.systemType,
                systemCode: recordToEdit.systemCode,
                validFrom: toInputDate(recordToEdit.validFrom),
                validTo: toInputDate(recordToEdit.validTo),
                systemValueText: recordToEdit.systemValueText,
                systemValueNum: String(recordToEdit.systemValueNum),
                systemValueTime: recordToEdit.systemValueTime,
            });
        }
    }, [recordToEdit, isEditMode]);

    useEffect(() => {
        if (formData.validFrom && formData.validTo) {
            const from = new Date(formData.validFrom);
            const to = new Date(formData.validTo);
            if (to < from) {
                setDateError('Valid To date cannot be earlier than Valid From date.');
            } else {
                setDateError('');
            }
        } else {
            setDateError('');
        }
    }, [formData.validFrom, formData.validTo]);

    const isFormValid = useMemo(() => {
        return (
            formData.systemType.trim() !== '' &&
            formData.systemCode.trim() !== '' &&
            formData.validFrom !== '' &&
            formData.validTo !== '' &&
            !dateError
        );
    }, [formData.systemType, formData.systemCode, formData.validFrom, formData.validTo, dateError]);
    
    const handleSave = () => {
        if (!isFormValid) return;

        const now = new Date();
        const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
        const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const newUpdateTime = `${formattedDate}\n${formattedTime}`;

        const finalRecord: SystemMasterRecord = {
            id: isEditMode && recordToEdit ? recordToEdit.id : 0,
            systemType: formData.systemType.trim(),
            systemCode: formData.systemCode.trim(),
            validFrom: fromInputDate(formData.validFrom),
            validTo: fromInputDate(formData.validTo),
            systemValueText: formData.systemValueText.trim(),
            // FIX: Convert `systemValueNum` from string back to number upon saving.
            systemValueNum: Number(formData.systemValueNum) || 0,
            systemValueTime: formData.systemValueTime,
            createdBy: isEditMode && recordToEdit ? recordToEdit.createdBy : user.name,
            createdDate: isEditMode && recordToEdit ? recordToEdit.createdDate : newUpdateTime,
            changedBy: user.name,
            changedDate: newUpdateTime,
        };
        onSave(finalRecord);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        if (id === 'systemValueNum') {
             if (value === '' || /^\d+$/.test(value)) {
                setFormData(prev => ({ ...prev, [id]: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-full overflow-y-auto">
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit' : 'Add'}</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
                        <CloseIcon />
                    </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="systemType" className="block text-sm font-medium text-gray-700 mb-1">
                                System Type
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="systemType"
                                type="text"
                                placeholder="System Type"
                                value={formData.systemType}
                                onChange={handleChange}
                                disabled={isEditMode}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label htmlFor="systemCode" className="block text-sm font-medium text-gray-700 mb-1">
                                System Code
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="systemCode"
                                type="text"
                                placeholder="System Code"
                                value={formData.systemCode}
                                onChange={handleChange}
                                disabled={isEditMode}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700 mb-1">
                                Valid From <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="validFrom"
                                type="date"
                                value={formData.validFrom}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="validTo" className="block text-sm font-medium text-gray-700 mb-1">
                                Valid To <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="validTo"
                                type="date"
                                value={formData.validTo}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            {dateError && <p className="mt-1 text-xs text-red-600">{dateError}</p>}
                        </div>
                         <div>
                            <label htmlFor="systemValueText" className="block text-sm font-medium text-gray-700 mb-1">
                                System Value Text
                            </label>
                             <input
                                id="systemValueText"
                                type="text"
                                placeholder="System Value Text"
                                value={formData.systemValueText}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="systemValueNum" className="block text-sm font-medium text-gray-700 mb-1">
                                System Value Num
                            </label>
                            <input
                                id="systemValueNum"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="System Value Num"
                                value={formData.systemValueNum}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="systemValueTime" className="block text-sm font-medium text-gray-700 mb-1">
                                System Value Time
                            </label>
                            <input
                                id="systemValueTime"
                                type="time"
                                step="1"
                                value={formData.systemValueTime}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end items-center px-6 py-4 bg-gray-50 border-t gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={!isFormValid}
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SystemMasterModal;