import React, { useState } from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { ActionIcon } from './icons/ActionIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import AddApplicationModal from '../src/components/common/Modal/AddApplicationModal';
import SuccessModal from '../src/components/common/Modal/SuccessModal';
import { initialApplications } from '../data';
import type { Application } from '../data';
import StatusConfirmationModal from '../src/components/common/Modal/StatusConfirmationModal';
import StatusPill from './StatusPill';

const ApplicationPage: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>(initialApplications);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingApplication, setEditingApplication] = useState<Application | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
    const [appToChangeStatus, setAppToChangeStatus] = useState<Application | null>(null);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleOpenAddModal = () => {
        setEditingApplication(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (app: Application) => {
        setEditingApplication(app);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingApplication(null);
    };

    const handleSaveApplication = (application: Application) => {
        if (editingApplication) {
            // Update existing application
            setApplications(prev => 
                prev.map(app => app.id === application.id ? application : app)
            );
        } else {
            // Add new application
            setApplications(prev => [application, ...prev]);
        }
        handleCloseModal();
        setShowSuccessModal(true);
        setTimeout(() => {
            setShowSuccessModal(false);
        }, 3000);
    };

    const handleOpenStatusConfirm = (app: Application) => {
        setAppToChangeStatus(app);
        setIsStatusConfirmOpen(true);
    };

    const handleCloseStatusConfirm = () => {
        setAppToChangeStatus(null);
        setIsStatusConfirmOpen(false);
    };

    const handleConfirmStatusChange = () => {
        if (!appToChangeStatus) return;

        const now = new Date();
        const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
        const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const newUpdateTime = `${formattedDate}\n${formattedTime}`;

        setApplications(prev =>
            prev.map(app =>
                app.id === appToChangeStatus.id
                    ? {
                          ...app,
                          status: app.status === 'Active' ? 'Inactive' : 'Active',
                          updated: newUpdateTime,
                      }
                    : app
            )
        );
        
        handleCloseStatusConfirm();
        setShowSuccessModal(true);
        setTimeout(() => {
            setShowSuccessModal(false);
        }, 3000);
    };
    
    const filteredApplications = applications.filter(app => {
        const term = searchTerm.toLowerCase();
        return Object.values(app).some(value => 
            String(value).toLowerCase().includes(term)
        );
    });

    const totalItems = filteredApplications.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentApplications = filteredApplications.slice(startIndex, endIndex);

    const startItem = totalItems > 0 ? startIndex + 1 : 0;
    const endItem = Math.min(endIndex, totalItems);

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Application</h2>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-full max-w-xs">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    <button 
                        onClick={handleOpenAddModal}
                        className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <span className="text-xl font-bold leading-none pb-0.5">+</span> Add
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px] text-sm text-left text-gray-600">
                        <thead className="bg-white text-sm text-gray-700 font-bold border-b-2 border-gray-200">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-sm">Application ID</th>
                                <th scope="col" className="px-4 py-3 text-sm">Application Name</th>
                                <th scope="col" className="px-4 py-3 text-sm">Division Owner</th>
                                <th scope="col" className="px-4 py-3 text-sm">System Owner</th>
                                <th scope="col" className="px-4 py-3 text-sm">System Custodian</th>
                                <th scope="col" className="px-4 py-3 text-sm">Security Center</th>
                                <th scope="col" className="px-4 py-3 text-sm">Created Date</th>
                                <th scope="col" className="px-4 py-3 text-sm">Last Updated</th>
                                <th scope="col" className="px-4 py-3 text-sm">Status</th>
                                <th scope="col" className="px-4 py-3 text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentApplications.map((app, index) => (
                                <tr key={`${app.id}-${index}`} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap text-gray-900 text-sm">{app.id}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{app.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{app.division}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{app.owner}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{app.custodian}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{app.securityCenter}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{app.created.replace('\\n', ' ')}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{app.updated.replace('\\n', ' ')}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenStatusConfirm(app)}
                                            className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
                                            aria-label={`Change status for ${app.name}`}
                                        >
                                          <StatusPill status={app.status} />
                                        </button>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <div className="group relative flex justify-center">
                                            <button 
                                                onClick={() => handleOpenEditModal(app)}
                                                className="text-gray-500 hover:text-blue-600 text-sm" 
                                                aria-label={`Edit ${app.name}`}>
                                                <ActionIcon />
                                            </button>
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-blue-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                Edit
                                            </div>
                                        </div>
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
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                aria-label="Previous Page">
                                &lt;
                            </button>
                            <button 
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" 
                                aria-label="Next Page">
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {isModalOpen && <AddApplicationModal onClose={handleCloseModal} onSave={handleSaveApplication} applicationToEdit={editingApplication} />}
            {showSuccessModal && <SuccessModal onClose={() => setShowSuccessModal(false)} />}
            {isStatusConfirmOpen && appToChangeStatus && (
                <StatusConfirmationModal 
                    onClose={handleCloseStatusConfirm}
                    onConfirm={handleConfirmStatusChange}
                    currentStatus={appToChangeStatus.status}
                />
            )}
        </div>
    );
};

export default ApplicationPage;