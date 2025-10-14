import React, { useState, useMemo } from 'react';
import { SearchIcon } from '../src/components/icons/SearchIcon';
import { ChevronDownIcon } from '../src/components/icons/ChevronDownIcon';
import { EditIcon } from '../src/components/icons/EditIcon';
import { DeleteIcon } from '../src/components/icons/DeleteIcon';
import { initialPicUsers, divisions } from '../data';
import type { PicUser } from '../data';
import UarPicModal from '../src/components/common/Modal/UarPicModal';
import ConfirmationModal from '../src/components/common/Modal/ConfirmationModal';
import InfoModal from '../src/components/common/Modal/InfoModal';

const UarPicPage: React.FC = () => {
    const [pics, setPics] = useState<PicUser[]>(initialPicUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [divisionFilter, setDivisionFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPic, setEditingPic] = useState<PicUser | null>(null);
    
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [picToDelete, setPicToDelete] = useState<PicUser | null>(null);
    
    const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
    const [picToEdit, setPicToEdit] = useState<PicUser | null>(null);

    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');

    const filteredPics = useMemo(() => {
        return pics.filter(pic => {
            const nameMatch = pic.name.toLowerCase().includes(searchTerm.toLowerCase());
            const divisionMatch = divisionFilter ? pic.division === divisionFilter : true;
            return nameMatch && divisionMatch;
        });
    }, [pics, searchTerm, divisionFilter]);

    const currentPics = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPics.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPics, currentPage, itemsPerPage]);

    const totalItems = filteredPics.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const handleOpenAddModal = () => {
        setEditingPic(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (pic: PicUser) => {
        setEditingPic(pic);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPic(null);
    };

    const handleSavePic = (pic: PicUser) => {
        handleCloseModal();
        if (editingPic) {
            // If editing, open confirmation modal
            setPicToEdit(pic);
            setIsEditConfirmOpen(true);
        } else {
            // If adding, save directly
            const newId = pics.length > 0 ? Math.max(...pics.map(p => p.id)) + 1 : 1;
            setPics(prev => [{...pic, id: newId}, ...prev]);
            setInfoMessage('Save Successfully');
            setIsInfoOpen(true);
        }
    };

    const handleConfirmEdit = () => {
        if(picToEdit) {
            setPics(prev => prev.map(p => p.id === picToEdit.id ? picToEdit : p));
            setInfoMessage('Save Successfully');
            setIsInfoOpen(true);
        }
        setIsEditConfirmOpen(false);
        setPicToEdit(null);
    };

    const handleOpenDeleteConfirm = (pic: PicUser) => {
        setPicToDelete(pic);
        setIsDeleteConfirmOpen(true);
    };

    const handleCloseDeleteConfirm = () => {
        setPicToDelete(null);
        setIsDeleteConfirmOpen(false);
    };
    
    const handleDeletePic = () => {
        if (picToDelete) {
            setPics(prev => prev.filter(p => p.id !== picToDelete.id));
            handleCloseDeleteConfirm();
        }
    };


    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">UAR PIC</h2>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative w-full max-w-xs">
                            <input
                                type="text"
                                placeholder="Name"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-4 pr-10 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <div className="relative">
                           <select
                                value={divisionFilter}
                                onChange={(e) => setDivisionFilter(e.target.value)}
                                className="pl-3 pr-8 py-2 border border-gray-300 rounded-md appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Division</option>
                                {[...new Set(divisions)].sort().map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                             <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleOpenAddModal}
                        className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        + Add
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-sm text-left text-gray-600">
                        <thead className="text-sm font-semibold text-gray-700 border-b-2 border-gray-200">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-sm">No</th>
                                <th scope="col" className="px-4 py-3 text-sm">Name</th>
                                <th scope="col" className="px-4 py-3 text-sm">Division</th>
                                <th scope="col" className="px-4 py-3 text-sm">Email</th>
                                <th scope="col" className="px-4 py-3 text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPics.length > 0 ? currentPics.map((pic, index) => (
                                <tr key={pic.id} className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900 text-sm">{startItem + index}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{pic.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{pic.division}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{pic.email}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center justify-start gap-4">
                                            <div className="group relative">
                                                <button onClick={() => handleOpenEditModal(pic)} className="text-gray-500 hover:text-blue-600" aria-label={`Edit ${pic.name}`}>
                                                    <EditIcon />
                                                </button>
                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-blue-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    Edit
                                                </div>
                                            </div>
                                            <div className="group relative">
                                                <button onClick={() => handleOpenDeleteConfirm(pic)} className="text-gray-500 hover:text-red-600" aria-label={`Delete ${pic.name}`}>
                                                    <DeleteIcon />
                                                </button>
                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-blue-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    Delete
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500 text-sm">No PICs found.</td>
                                </tr>
                            )}
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
                                className="px-3 py-1.5 border bg-white border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Previous Page"
                            >
                                &lt;
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage >= totalPages}
                                className="px-3 py-1.5 border bg-white border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Next Page"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {isModalOpen && <UarPicModal onClose={handleCloseModal} onSave={handleSavePic} picToEdit={editingPic} />}
            
            {isDeleteConfirmOpen && (
                <ConfirmationModal 
                    onClose={handleCloseDeleteConfirm} 
                    onConfirm={handleDeletePic}
                    title="Delete User Confirmation"
                    message="Do you want to Delete user PIC?"
                />
            )}
            {isEditConfirmOpen && (
                <ConfirmationModal 
                    onClose={() => setIsEditConfirmOpen(false)} 
                    onConfirm={handleConfirmEdit}
                    title="Edit User Confirmation"
                    message="Do you want to submit?"
                />
            )}

            {isInfoOpen && (
                <InfoModal
                    onClose={() => setIsInfoOpen(false)}
                    title="Information"
                    message={infoMessage}
                />
            )}
        </div>
    );
};

export default UarPicPage;