import React, { useState, useEffect, useMemo } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { systemUsers, securityCenters } from '../data';
import type { SystemUser, Application } from '../data';

interface AddApplicationModalProps {
    onClose: () => void;
    onSave: (application: Application) => void;
    applicationToEdit?: Application | null;
}

const AutocompleteInput: React.FC<{
    label: string;
    placeholder: string;
    query: string;
    onQueryChange: (value: string) => void;
    suggestions: SystemUser[];
    onSelect: (user: SystemUser) => void;
}> = ({ label, placeholder, query, onQueryChange, suggestions, onSelect }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleSelect = (user: SystemUser) => {
        onSelect(user);
        setShowSuggestions(false);
    }
    
    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => {
                    onQueryChange(e.target.value);
                    setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {showSuggestions && query && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {suggestions.map((user) => (
                        <li key={user.id} onMouseDown={() => handleSelect(user)} className="px-3 py-2 cursor-pointer hover:bg-blue-100">
                           {user.id} - {user.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

const UserDetailsDisplay: React.FC<{ user: SystemUser | null }> = ({ user }) => (
    <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
        <div className="grid grid-cols-[3fr_2fr] gap-x-4 gap-y-2">
            <p className="truncate">Name : <span className="font-semibold text-gray-800">{user?.name || '-'}</span></p>
            <p className="truncate">Division : <span className="font-semibold text-gray-800">{user?.division || '-'}</span></p>
            <p className="truncate">Email : <span className="font-semibold text-gray-800">{user?.email || '-'}</span></p>
            <p className="truncate">Department : <span className="font-semibold text-gray-800">{user?.department || '-'}</span></p>
        </div>
    </div>
);


const AddApplicationModal: React.FC<AddApplicationModalProps> = ({ onClose, onSave, applicationToEdit }) => {
    const isEditMode = !!applicationToEdit;

    const [appId, setAppId] = useState('');
    const [appName, setAppName] = useState('');

    const [ownerQuery, setOwnerQuery] = useState('');
    const [selectedOwner, setSelectedOwner] = useState<SystemUser | null>(null);

    const [custodianQuery, setCustodianQuery] = useState('');
    const [selectedCustodian, setSelectedCustodian] = useState<SystemUser | null>(null);

    const [securityCenterQuery, setSecurityCenterQuery] = useState('');
    const [selectedSecurityCenter, setSelectedSecurityCenter] = useState<string | null>(null);
    const [showSecuritySuggestions, setShowSecuritySuggestions] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            setAppId(applicationToEdit.id);
            setAppName(applicationToEdit.name);
            
            const ownerUser = systemUsers.find(u => u.name === applicationToEdit.owner);
            if(ownerUser) {
                setSelectedOwner(ownerUser);
                setOwnerQuery(ownerUser.id);
            }
            
            const custodianUser = systemUsers.find(u => u.name === applicationToEdit.custodian);
            if(custodianUser) {
                setSelectedCustodian(custodianUser);
                setCustodianQuery(custodianUser.id);
            }

            setSelectedSecurityCenter(applicationToEdit.securityCenter);
            setSecurityCenterQuery(applicationToEdit.securityCenter);
        }
    }, [applicationToEdit, isEditMode]);

    const handleNoregOrNameChange = (
        value: string, 
        setter: React.Dispatch<React.SetStateAction<string>>
    ) => {
        if (/^\d*$/.test(value)) { // if user is typing numbers (or empty)
            if (value.length <= 8) {
                setter(value);
            }
        } else { // if user is typing text (name)
            setter(value);
        }
    };


    const filteredOwners = useMemo(() => 
        ownerQuery ? systemUsers.filter(u => `${u.id} ${u.name}`.toLowerCase().includes(ownerQuery.toLowerCase())) : [],
        [ownerQuery]
    );

    const filteredCustodians = useMemo(() => 
        custodianQuery ? systemUsers.filter(u => `${u.id} ${u.name}`.toLowerCase().includes(custodianQuery.toLowerCase())) : [],
        [custodianQuery]
    );

    const filteredSecurityCenters = useMemo(() =>
        securityCenterQuery ? securityCenters.filter(sc => sc.toLowerCase().includes(securityCenterQuery.toLowerCase())) : securityCenters,
        [securityCenterQuery]
    );

    const isFormValid = useMemo(() => {
        return appId && appName && selectedOwner && selectedCustodian && selectedSecurityCenter;
    }, [appId, appName, selectedOwner, selectedCustodian, selectedSecurityCenter]);

    const handleSave = () => {
        if (!isFormValid) return;
        
        const now = new Date();
        const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
        const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const newUpdateTime = `${formattedDate}\n${formattedTime}`;

        const newApplication: Application = {
            id: appId,
            name: appName,
            division: selectedOwner.division,
            owner: selectedOwner.name,
            custodian: selectedCustodian.name,
            securityCenter: selectedSecurityCenter,
            created: isEditMode ? applicationToEdit.created : newUpdateTime,
            updated: newUpdateTime,
            status: isEditMode ? applicationToEdit.status : 'Active',
        };
        onSave(newApplication);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit' : 'Add'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="appId" className="block text-sm font-medium text-gray-700 mb-1">
                            Application ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="appId"
                            type="text"
                            placeholder="Application ID"
                            value={appId}
                            onChange={(e) => setAppId(e.target.value)}
                            disabled={isEditMode}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label htmlFor="appName" className="block text-sm font-medium text-gray-700 mb-1">
                            Application Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="appName"
                            type="text"
                            placeholder="Application Name"
                            value={appName}
                            onChange={(e) => setAppName(e.target.value)}
                            disabled={isEditMode}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                    </div>
                    
                    <AutocompleteInput
                        label="System Owner"
                        placeholder="Enter Name / NOREG"
                        query={ownerQuery}
                        onQueryChange={(value) => handleNoregOrNameChange(value, setOwnerQuery)}
                        suggestions={filteredOwners}
                        onSelect={(user) => {
                            setSelectedOwner(user);
                            setOwnerQuery(user.id);
                        }}
                    />
                    <UserDetailsDisplay user={selectedOwner} />

                    <AutocompleteInput
                        label="System Custodian"
                        placeholder="Enter Name / NOREG"
                        query={custodianQuery}
                        onQueryChange={(value) => handleNoregOrNameChange(value, setCustodianQuery)}
                        suggestions={filteredCustodians}
                        onSelect={(user) => {
                            setSelectedCustodian(user);
                            setCustodianQuery(user.id);
                        }}
                    />
                    <UserDetailsDisplay user={selectedCustodian} />

                    <div className="relative">
                        <label htmlFor="securityCenter" className="block text-sm font-medium text-gray-700 mb-1">
                            Security Center <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="securityCenter"
                            type="text"
                            placeholder="Select Security Center"
                            value={securityCenterQuery}
                            onChange={(e) => {
                                setSecurityCenterQuery(e.target.value);
                                setSelectedSecurityCenter(null); 
                                setShowSecuritySuggestions(true);
                            }}
                            onFocus={() => setShowSecuritySuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSecuritySuggestions(false), 200)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        {showSecuritySuggestions && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto">
                                {filteredSecurityCenters.map((sc) => (
                                    <li key={sc} onMouseDown={() => {
                                        setSelectedSecurityCenter(sc);
                                        setSecurityCenterQuery(sc);
                                        setShowSecuritySuggestions(false);
                                    }} className="px-3 py-2 cursor-pointer hover:bg-blue-100">
                                       {sc}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="flex justify-end items-center p-4 bg-gray-50 border-t">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={!isFormValid}
                        className="ml-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddApplicationModal;