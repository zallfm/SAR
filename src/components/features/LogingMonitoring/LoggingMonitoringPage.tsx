import React, { useState, useMemo, useEffect } from "react";
import { SearchIcon } from "../../../components/icons/SearchIcon";
import { ChevronDownIcon } from "../../../components/icons/ChevronDownIcon";
import { DetailIcon } from "../../../components/icons/DetailIcon";
import { LogEntry, mockLogs } from "../../../../data";
// import type { LogEntry } from '../../../../data';
import StatusPill from "../StatusPill/StatusPill";
import { DownloadButton } from "../../common/Button/DownloadButton";
import { loggingService, LogFilter } from "../../../services/loggingService";
import { useLogging } from "../../../hooks/useLogging";
import SearchableDropdown from "../../common/SearchableDropdown";
import * as XLSX from "xlsx";

import {
  useLogs,
  useFilteredLogs,
  useLoggingFilters,
  useLoggingPagination,
  useLoggingActions,
} from "../../../hooks/useStoreSelectors";
// import { useLoggingStore } from '@/src/store/loggingStore';
import { useLoggingStore } from "../../../../src/store/loggingStore";

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
      className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none text-sm ${
        value ? "text-gray-800" : "text-gray-400"
      }`}
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
  <div className="relative w-36">
    <input
      type={value ? "date" : "text"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={(e) => {
        e.target.type = "date";
        try {
          e.currentTarget.showPicker();
        } catch (e) {
          /* ignore */
        }
      }}
      onBlur={(e) => {
        if (!e.target.value) e.target.type = "text";
      }}
      className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none text-sm ${
        value ? "text-gray-800" : "text-gray-400"
      }`}
    />
  </div>
);

const LoggingMonitoringPage: React.FC<{
  onViewDetail: (log: LogEntry) => void;
}> = ({ onViewDetail }) => {
  // Zustand store hooks
  const logs = useLogs();
  const filteredLogs = useFilteredLogs();
  const { filters, setFilters } = useLoggingFilters();
  const {
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    getTotalPages,
    getCurrentPageLogs,
  } = useLoggingPagination();
  const { setLogs, setFilteredLogs, setSelectedLog } = useLoggingActions();

  const getLogMonitorings = useLoggingStore((state) => state.getLogMonitoring);

  // Local state for real-time logs
  const [realTimeLogs, setRealTimeLogs] = useState<any[]>([]);

  // Initialize logging for this component
  const { logUserAction, logInfo } = useLogging({
    componentName: "LoggingMonitoringPage",
    enablePerformanceLogging: true,
  });

  useEffect(() => {
    const loadLogs = () => {
      const serviceLogs = loggingService.getLogs();
      const realTimeLogsFormatted: LogEntry[] = serviceLogs.map((s, idx) => {
        let details: any[] = [];
        if (Array.isArray((s as any).DETAILS)) {
          details = (s as any).DETAILS as any[];
        } else if (typeof (s as any).DETAILS === "string") {
          try {
            const parsed = JSON.parse((s as any).DETAILS as string);
            details = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            details = [];
          }
        }

        return {
          NO: (s as any).NO ?? s.NO ?? idx + 1,
          PROCESS_ID: (s as any).PROCESS_ID,
          USER_ID: (s as any).USER_ID,
          MODULE: (s as any).MODULE,
          FUNCTION_NAME: (s as any).FUNCTION_NAME,
          START_DATE: (s as any).START_DATE,
          END_DATE: (s as any).END_DATE,
          STATUS: (s as any).STATUS as
            | "Success"
            | "Error"
            | "Warning"
            | "InProgress",
          DETAILS: details,
        };
      });
      const combinedLogs: LogEntry[] = [...realTimeLogsFormatted, ...mockLogs];
      setLogs(combinedLogs);
    };

    loadLogs();
    const interval = setInterval(loadLogs, 2000);

    logUserAction("access_logging_monitoring_page", {
      timestamp: new Date().toISOString(),
    });
    return () => {
      clearInterval(interval);
      logUserAction("leave_logging_monitoring_page", {
        timestamp: new Date().toISOString(),
      });
    };
  }, [logUserAction, setLogs]);
  const uniqueModules: string[] = useMemo(
    () => [...new Set(logs.map((log) => log.MODULE))],
    [logs]
  );
  const uniqueFunctions: string[] = useMemo(
    () => [...new Set(logs.map((log) => log.FUNCTION_NAME))],
    [logs]
  );

  const parseDate = (dateString: string): Date | null => {
    const parts = dateString.match(
      /(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/
    );
    if (!parts) return null;
    return new Date(
      Number(parts[3]),
      Number(parts[2]) - 1,
      Number(parts[1]),
      Number(parts[4]),
      Number(parts[5]),
      Number(parts[6])
    );
  };

  useEffect(() => {
    const filtered = logs.filter((log) => {
      if (
        filters.process &&
        !log.PROCESS_ID.toLowerCase().includes(filters.process.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.user &&
        !log.USER_ID.toLowerCase().includes(filters.user.toLowerCase())
      ) {
        return false;
      }
      if (filters.module && log.MODULE !== filters.module) {
        return false;
      }
      if (filters.function && log.FUNCTION_NAME !== filters.function) {
        return false;
      }
      if (filters.status && log.STATUS !== filters.status) {
        return false;
      }
      const logStartDate = parseDate(log.START_DATE);
      if (filters.startDate && logStartDate) {
        if (logStartDate < new Date(filters.startDate)) return false;
      }
      const logEndDate = parseDate(log.END_DATE);
      if (filters.endDate && logEndDate) {
        const filterEndDate = new Date(filters.endDate);
        filterEndDate.setHours(23, 59, 59, 999);
        if (logEndDate > filterEndDate) return false;
      }
      return true;
    });

    const haveSameLength = filteredLogs.length === filtered.length;
    const haveSameIds =
      haveSameLength &&
      filteredLogs.every((log, index) => log.NO === filtered[index]?.NO);

    if (!haveSameIds) {
      setFilteredLogs(filtered);
    }
  }, [logs, filters, filteredLogs, setFilteredLogs]);

  // getLogMonitorings

  React.useEffect(() => {
    getLogMonitorings();
  }, [getLogMonitorings]);

  const totalPages = getTotalPages();
  const currentLogs = getCurrentPageLogs();
  const totalItems = filteredLogs.length;
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handleFilterChange = (
    filterName: keyof typeof filters,
    value: string
  ) => {
    setFilters({ [filterName]: value });
    setCurrentPage(1);
  };

  const handleDownload = () => {
    if (!filteredLogs.length) {
      alert("No data available to download based on the current filters.");
      return;
    }

    // Log critical action
    logUserAction("download_logs", {
      filteredCount: filteredLogs.length,
      filters: filters,
      timestamp: new Date().toISOString(),
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const dateStamp = `${year}${month}${day}`;
    const fileName = `SAR_log_${dateStamp}.xlsx`;

    const headers = [
      "No",
      "Process ID",
      "User ID",
      "Module",
      "Function Name",
      "Start Date",
      "End Date",
      "Status",
    ];

    const dataToExport = filteredLogs.map((log, index) => [
      index + 1,
      log.PROCESS_ID,
      log.USER_ID,
      log.MODULE,
      log.FUNCTION_NAME,
      log.START_DATE,
      log.END_DATE,
      log.STATUS,
    ]);

    const worksheetData = [headers, ...dataToExport];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Logging Monitoring
      </h2>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <SearchableDropdown
              label="Process"
              value={filters.process}
              onChange={(value) => handleFilterChange("process", value)}
              options={[...new Set(logs.map((log: any) => log.PROCESS_ID))]}
              placeholder="Process"
              className="w-36"
            />
            <SearchableDropdown
              label="User"
              value={filters.user}
              onChange={(value) => handleFilterChange("user", value)}
              options={[...new Set(logs.map((log: any) => log.USER_ID))]}
              placeholder="User"
              className="w-28"
            />
            <SearchableDropdown
              label="Module"
              value={filters.module}
              onChange={(value) => handleFilterChange("module", value)}
              options={uniqueModules}
              searchable={false}
              placeholder="Module"
              className="w-36"
            />
            <SearchableDropdown
              label="Function"
              value={filters.function}
              onChange={(value) => handleFilterChange("function", value)}
              options={uniqueFunctions}
              searchable={false}
              placeholder="Function"
              className="w-36"
            />
            <FilterDate
              placeholder="Start Date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
            <FilterDate
              placeholder="End Date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
            <SearchableDropdown
              label="Status"
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              options={["Success", "Error", "In Progress"]}
              searchable={false}
              placeholder="Status"
              className="w-28"
            />
          </div>
          <DownloadButton
            style={{ paddingLeft: "24px", paddingRight: "24px" }}
            className="bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
            onClick={handleDownload}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm text-left text-gray-600">
            <thead className="text-sm text-gray-700 border-b-2 border-gray-200">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold text-sm">
                  No
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-sm">
                  Process ID
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-sm">
                  User ID
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-sm">
                  Module
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-sm">
                  Function Name
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-sm">
                  Start Date
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-sm">
                  End Date
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 font-semibold text-center text-sm"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 font-semibold text-center text-sm"
                >
                  Detail
                </th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.length > 0 ? (
                currentLogs.map((log, index) => (
                  <tr
                    key={log.NO}
                    className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-gray-900 text-sm">
                      {startItem + index}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {log.PROCESS_ID}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {log.USER_ID}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {log.MODULE}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {log.FUNCTION_NAME}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {log.START_DATE}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {log.END_DATE}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                      <StatusPill status={log.STATUS} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                      <div className="group relative inline-block">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLog(log);
                            onViewDetail(log);
                            logUserAction("view_log_detail", {
                              logId: log.NO,
                              logModule: log.MODULE,
                              logFunction: log.FUNCTION_NAME,
                              logStatus: log.STATUS,
                              timestamp: new Date().toISOString(),
                            });
                          }}
                          className="text-gray-500 hover:text-blue-600 text-sm"
                          aria-label={`Details for ${log.PROCESS_ID}`}
                        >
                          <DetailIcon />
                        </button>
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-blue-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          Detail
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-10 text-gray-500 text-sm"
                  >
                    No matching logs found.
                  </td>
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
            <span>
              Showing {startItem}-{endItem} of {totalItems}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border bg-white border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous Page"
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(currentPage + 1)}
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
