import React, { useState, useEffect } from 'react';
import type { User } from '../../../../types';
import type { UarDivisionUserRecord, UarDivisionUserReviewDetail, Comment } from '../../../../data';
import { initialUarDivisionUserReviewData } from '../../../../data';
import { ChevronDownIcon } from '../../icons/ChevronDownIcon';
import { CommentIcon } from '../../icons/CommentIcon';
// import RoleInfoModal from './RoleInfoModal';
import CommentModal from '../../common/Modal/CommentModal';
import RoleInfoModal from '../../common/Modal/RoleInfoModal';

type ApprovalStatus = 'Approved' | 'Revoked';
type TableData = UarDivisionUserReviewDetail & { approvalStatus: ApprovalStatus };

interface UarDivisionUserDetailPageProps {
    record: UarDivisionUserRecord;
    onBack: () => void;
    user: User;
}

const UarDivisionUserDetailPage: React.FC<UarDivisionUserDetailPageProps> = ({ record, onBack, user }) => {
    
    const [tableData, setTableData] = useState<TableData[]>([]);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    
    const [isRoleInfoModalOpen, setIsRoleInfoModalOpen] = useState(false);
    const [selectedRoleInfo, setSelectedRoleInfo] = useState<UarDivisionUserReviewDetail | null>(null);

    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [commentTarget, setCommentTarget] = useState<TableData | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        // Filter the full dataset based on the record's uarId
        const relevantDetails = initialUarDivisionUserReviewData
            .filter(item => item.uarId === record.uarId)
            .map(item => ({ ...item, approvalStatus: 'Approved' as ApprovalStatus }));
        setTableData(relevantDetails);
    }, [record.uarId]);

    const handleRowApprovalChange = (id: number, status: ApprovalStatus) => {
        setTableData(prev => prev.map(row => row.id === id ? { ...row, approvalStatus: status } : row));
    };

    const handleBulkAction = (status: ApprovalStatus) => {
        if (selectedRows.length === 0) return;
        setTableData(prev => prev.map(row => selectedRows.includes(row.id) ? { ...row, approvalStatus: status } : row));
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(currentData.map(d => d.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: number) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
    };

    const handleRoleInfoClick = (role: UarDivisionUserReviewDetail) => {
        setSelectedRoleInfo(role);
        setIsRoleInfoModalOpen(true);
    };

    const handleOpenCommentModal = (row: TableData) => {
        setCommentTarget(row);
        setIsCommentModalOpen(true);
    };

    const handleCloseCommentModal = () => {
        setCommentTarget(null);
        setIsCommentModalOpen(false);
    };

    const handleSubmitComment = (newCommentText: string) => {
        if (commentTarget) {
            const newComment: Comment = {
                user: `${user.name} (${user.role})`,
                text: newCommentText,
                timestamp: new Date(),
            };

            setTableData(prev => 
                prev.map(row => 
                    row.id === commentTarget.id 
                        ? { ...row, comments: [...(row.comments || []), newComment] } 
                        : row
                )
            );
        }
        handleCloseCommentModal();
    };


    const totalItems = tableData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = tableData.slice(startIndex, startIndex + itemsPerPage);
    const startItem = totalItems > 0 ? startIndex + 1 : 0;
    const endItem = Math.min(startIndex + itemsPerPage, totalItems);
    const isAllSelectedOnPage = currentData.length > 0 && selectedRows.length > 0 && currentData.every(d => selectedRows.includes(d.id));

    return (
        <div className="space-y-6">
            <div>
                 <h2 className="text-3xl font-bold text-gray-800">UAR Division User</h2>
                 <div className="text-sm text-gray-500 mt-1 flex items-center flex-wrap">
                    <button 
                        onClick={onBack} 
                        className="text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                        aria-label="Back to UAR Division User list"
                    >
                        UAR Division User
                    </button>
                    <span className="mx-2">&gt;</span>
                    <span className="text-gray-700 font-medium">{record.uarId}</span>
                 </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                 <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => handleBulkAction('Approved')}
                            disabled={selectedRows.length === 0}
                            className="px-6 py-2 text-sm font-semibold text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                            Approve
                        </button>
                        <button
                             onClick={() => handleBulkAction('Revoked')}
                             disabled={selectedRows.length === 0}
                             className="px-6 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                            Revoke
                        </button>
                    </div>
                     <button className="px-8 py-2 text-sm font-semibold text-white bg-blue-400 rounded-lg hover:bg-blue-500 transition-colors">
                        Submit
                     </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px] text-sm text-left text-gray-700">
                        <thead className="text-sm text-black font-semibold">
                            <tr className="border-b-2 border-gray-200">
                                <th scope="col" className="px-4 py-3 w-12 text-sm">
                                    <input 
                                        type="checkbox" 
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={isAllSelectedOnPage}
                                        onChange={handleSelectAll}
                                        aria-label="Select all rows on this page"
                                    />
                                </th>
                                <th scope="col" className="px-4 py-3 text-sm">Username</th>
                                <th scope="col" className="px-4 py-3 text-sm">NOREG</th>
                                <th scope="col" className="px-4 py-3 text-sm">Name</th>
                                <th scope="col" className="px-4 py-3 text-sm">Role ID</th>
                                <th scope="col" className="px-4 py-3 text-sm">Role Description</th>
                                <th scope="col" className="px-4 py-3 text-sm">Status</th>
                                <th scope="col" className="px-4 py-3 text-center w-48 text-sm">Approval</th>
                                <th scope="col" className="px-4 py-3 text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map(row => (
                                <tr key={row.id} className="bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm">
                                         <input 
                                            type="checkbox" 
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                            checked={selectedRows.includes(row.id)}
                                            onChange={() => handleSelectRow(row.id)}
                                            aria-label={`Select row ${row.id}`}
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-sm">{row.username}</td>
                                    <td className="px-4 py-2 text-sm">{row.noreg}</td>
                                    <td className="px-4 py-2 text-sm">{row.name}</td>
                                    <td className="px-4 py-2 text-sm">
                                        <button 
                                            onClick={() => handleRoleInfoClick(row)}
                                            className="text-blue-600 hover:underline cursor-pointer"
                                        >
                                            {row.roleId}
                                        </button>
                                    </td>
                                    <td className="px-4 py-2 text-sm">{row.roleDescription}</td>
                                    <td className="px-4 py-2 text-sm">{row.status}</td>
                                    <td className="px-4 py-2 text-sm">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleRowApprovalChange(row.id, 'Approved')}
                                                className={`px-3 py-1 text-xs font-semibold rounded-md min-w-[70px] transition-colors ${row.approvalStatus === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-100'}`}
                                            >
                                                Approved
                                            </button>
                                            <button 
                                                onClick={() => handleRowApprovalChange(row.id, 'Revoked')}
                                                className={`px-3 py-1 text-xs font-semibold rounded-md min-w-[70px] transition-colors ${row.approvalStatus === 'Revoked' ? 'bg-red-100 text-red-700' : 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-100'}`}
                                            >
                                                Revoke
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                         <div className="group relative flex justify-center">
                                            <button 
                                                onClick={() => handleOpenCommentModal(row)}
                                                className={row.comments && row.comments.length > 0 ? "text-blue-600 hover:text-blue-800" : "text-gray-400 hover:text-blue-600"}
                                            >
                                                <CommentIcon />
                                            </button>
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-blue-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {row.comments && row.comments.length > 0 ? 'View Comments' : 'Add Comment'}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={itemsPerPage}
                                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
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
                                className="px-2 py-1 border bg-white border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                aria-label="Previous Page"
                            >
                                &lt;
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage >= totalPages}
                                className="px-2 py-1 border bg-white border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                aria-label="Next Page"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isRoleInfoModalOpen && selectedRoleInfo && (
                <RoleInfoModal
                    onClose={() => setIsRoleInfoModalOpen(false)} 
                    roleInfo={selectedRoleInfo}
                />
            )}
            {isCommentModalOpen && commentTarget && (
                <CommentModal 
                    onClose={handleCloseCommentModal}
                    onSubmit={handleSubmitComment}
                    targetUser={commentTarget.name}
                    commentingUser={`${user.name} (${user.role})`}
                    comments={commentTarget.comments || []}
                />
            )}
        </div>
    );
};

export default UarDivisionUserDetailPage;