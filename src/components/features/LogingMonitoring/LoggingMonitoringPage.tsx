import React, { useState, useMemo } from 'react';
import { SearchIcon } from '../../../components/icons/SearchIcon';
import { ChevronDownIcon } from '../../../components/icons/ChevronDownIcon';
import { DetailIcon } from '../../../components/icons/DetailIcon';
import { mockLogs } from '../../../../data';
import type { LogEntry } from '../../../../data';
import StatusPill from '../StatusPill/StatusPill';

declare var XLSX: any;

const FilterInput: React.FC<{ 
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ placeholder, value, onChange }) => (
    <div className="relative flex-1 min-w-[120px]">
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm placeholder-gray-400"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
        </div>
    </div>
);

const FilterSelect: React.FC<{ 
    children: React.ReactNode; 
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ children, value, onChange }) => (
    <div className="relative flex-1 min-w-[120px]">
        <select 
            value={value} 
            onChange={onChange}
            className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none text-sm ${value ? 'text-gray-800' : 'text-gray-400'}`}
        >
            {children}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        </div>
    </div>
);

const FilterDate: React.FC<{ 
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ placeholder, value, onChange }) => (
     <div className="relative flex-1 min-w-[120px]">
        <input
            type={value ? 'date' : 'text'}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={(e) => { e.target.type = 'date'; try { e.currentTarget.showPicker() } catch(e) { /* ignore */ } }}
            onBlur={(e) => { if(!e.target.value) e.target.type = 'text' }}
            className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none text-sm ${value ? 'text-gray-800' : 'text-gray-400'}`}
        />
    </div>
);


const LoggingMonitoringPage: React.FC<{ onViewDetail: (log: LogEntry) => void }> = ({ onViewDetail }) => {
    const [logs] = useState<LogEntry[]>(mockLogs);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const [processFilter, setProcessFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [moduleFilter, setModuleFilter] = useState('');
    const [functionFilter, setFunctionFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<LogEntry['status'] | ''>('');

    // FIX: Add explicit string[] type and use `logs` state variable in dependency array for `useMemo` to ensure correct type inference.
    const uniqueModules: string[] = useMemo(() => [...new Set(logs.map(log => log.module))], [logs]);
    // FIX: Add explicit string[] type and use `logs` state variable in dependency array for `useMemo` to ensure correct type inference.
    const uniqueFunctions: string[] = useMemo(() => [...new Set(logs.map(log => log.functionName))], [logs]);

    const parseDate = (dateString: string): Date | null => {
        const parts = dateString.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/);
        if (!parts) return null;
        return new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1]), Number(parts[4]), Number(parts[5]), Number(parts[6]));
    };

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            if (processFilter && !log.processId.toLowerCase().includes(processFilter.toLowerCase())) {
                return false;
            }
            if (userFilter && !log.userId.toLowerCase().includes(userFilter.toLowerCase())) {
                return false;
            }
            if (moduleFilter && log.module !== moduleFilter) {
                return false;
            }
            if (functionFilter && log.functionName !== functionFilter) {
                return false;
            }
            if (statusFilter && log.status !== statusFilter) {
                return false;
            }
            const logStartDate = parseDate(log.startDate);
            if (startDateFilter && logStartDate) {
                if (logStartDate < new Date(startDateFilter)) return false;
            }
            const logEndDate = parseDate(log.endDate);
            if (endDateFilter && logEndDate) {
                const filterEndDate = new Date(endDateFilter);
                filterEndDate.setHours(23, 59, 59, 999);
                if (logEndDate > filterEndDate) return false;
            }
            return true;
        });
    }, [logs, processFilter, userFilter, moduleFilter, functionFilter, startDateFilter, endDateFilter, statusFilter]);

    const currentLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredLogs, currentPage, itemsPerPage]);

    const totalItems = filteredLogs.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<any>>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setter(e.target.value);
        setCurrentPage(1);
    };
    
    const handleDownload = () => {
        if (!filteredLogs.length) {
            alert("No data available to download based on the current filters.");
            return;
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dateStamp = `${year}${month}${day}`;
        const fileName = `SAR_log_${dateStamp}.xlsx`;

        const headers = [
            'No',
            'Process ID',
            'User ID',
            'Module',
            'Function Name',
            'Start Date',
            'End Date',
            'Status',
        ];

        const dataToExport = filteredLogs.map((log, index) => [
            index + 1,
            log.processId,
            log.userId,
            log.module,
            log.functionName,
            log.startDate,
            log.endDate,
            log.status,
        ]);

        const worksheetData = [headers, ...dataToExport];
        
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');
        XLSX.writeFile(workbook, fileName);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Logging Monitoring</h2>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-x-3 mb-6 flex-wrap">
                    <FilterInput placeholder="Process" value={processFilter} onChange={handleFilterChange(setProcessFilter)} />
                    <FilterInput placeholder="User" value={userFilter} onChange={handleFilterChange(setUserFilter)} />
                    <FilterSelect value={moduleFilter} onChange={handleFilterChange(setModuleFilter)}>
                        <option value="">Module</option>
                        {uniqueModules.map(m => <option key={m} value={m}>{m}</option>)}
                    </FilterSelect>
                    <FilterSelect value={functionFilter} onChange={handleFilterChange(setFunctionFilter)}>
                        <option value="">Function</option>
                        {uniqueFunctions.map(f => <option key={f} value={f}>{f}</option>)}
                    </FilterSelect>
                    <FilterDate placeholder="Start Date" value={startDateFilter} onChange={handleFilterChange(setStartDateFilter)} />
                    <FilterDate placeholder="End Date" value={endDateFilter} onChange={handleFilterChange(setEndDateFilter)} />
                    <FilterSelect value={statusFilter} onChange={handleFilterChange(setStatusFilter)}>
                        <option value="">Status</option>
                        <option value="Success">Success</option>
                        <option value="Error">Error</option>
                        <option value="InProgress">In Progress</option>
                    </FilterSelect>
                    <button 
                        type="button"
                        onClick={handleDownload}
                        className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                    >
                        Download
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-sm text-left text-gray-600">
                        <thead className="text-sm text-gray-700 border-b-2 border-gray-200">
                            <tr>
                                <th scope="col" className="px-4 py-3 font-semibold text-sm">No</th>
                                <th scope="col" className="px-4 py-3 font-semibold text-sm">Process ID</th>
                                <th scope="col" className="px-4 py-3 font-semibold text-sm">User ID</th>
                                <th scope="col" className="px-4 py-3 font-semibold text-sm">Module</th>
                                <th scope="col" className="px-4 py-3 font-semibold text-sm">Function Name</th>
                                <th scope="col" className="px-4 py-3 font-semibold text-sm">Start Date</th>
                                <th scope="col" className="px-4 py-3 font-semibold text-sm">End Date</th>
                                <th scope="col" className="px-4 py-3 font-semibold text-center text-sm">Status</th>
                                <th scope="col" className="px-4 py-3 font-semibold text-center text-sm">Detail</th>
                            </tr>
                        </thead>
                        <tbody>
                             {currentLogs.length > 0 ? currentLogs.map((log, index) => (
                                <tr key={log.id} className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900 text-sm">{startItem + index}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{log.processId}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{log.userId}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{log.module}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{log.functionName}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{log.startDate}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{log.endDate}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm"><StatusPill status={log.status} /></td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                                        <div className="group relative inline-block">
                                            <button 
                                                type="button"
                                                onClick={() => onViewDetail(log)}
                                                className="text-gray-500 hover:text-blue-600 text-sm" aria-label={`Details for ${log.processId}`}>
                                                <DetailIcon />
                                            </button>
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-blue-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                Detail
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={9} className="text-center py-10 text-gray-500 text-sm">No matching logs found.</td>
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
                                type="button"
                                onClick={() => setCurrentPage(p => p - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 border bg-white border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Previous Page"
                            >
                                &lt;
                            </button>
                            <button
                                type="button"
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
        </div>
    );
};

export default LoggingMonitoringPage;