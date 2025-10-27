import React, { useState, useMemo, useEffect } from "react";
import { SearchIcon } from "../../../components/icons/SearchIcon";
import { ChevronDownIcon } from "../../../components/icons/ChevronDownIcon";
import { mockLogDetails } from "../../../../data";
import type { LogEntry, LogDetail } from "../../../../data";
import * as XLSX from "xlsx";
// import { getLogByProcessIdApi } from "@/src/api/log_monitoring";
import { getLogByProcessIdApi } from "../../../../src/api/log_monitoring";

const FilterDisplay: React.FC<{
  label: string;
  value: string;
  hasSearchIcon?: boolean;
}> = ({ label, value, hasSearchIcon }) => (
  <div className="relative flex-1 min-w-[120px]">
    <input
      type="text"
      value={value}
      aria-label={label}
      disabled
      className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-sm text-gray-700 cursor-not-allowed"
    />
    {hasSearchIcon && (
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <SearchIcon className="w-5 h-5 text-gray-400" />
      </div>
    )}
  </div>
);

const FilterSelectDisplay: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="relative flex-1 min-w-[120px]">
    <select
      value={value}
      aria-label={label}
      disabled
      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 appearance-none text-sm text-gray-700 cursor-not-allowed"
    >
      <option>{value}</option>
    </select>
    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
      <ChevronDownIcon className="w-4 h-4 text-gray-400" />
    </div>
  </div>
);

interface LoggingMonitoringDetailPageProps {
  logEntry: LogEntry;
  onBack: () => void;
}

const LoggingMonitoringDetailPage: React.FC<
  LoggingMonitoringDetailPageProps
> = ({ logEntry, onBack }) => {
  // const [logDetails] = useState<LogDetail[]>(mockLogDetails);
  const [currentPage, setCurrentPage] = useState(1);
  const [logDetails, setLogDetails] = useState<LogDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    let alive = true;
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await getLogByProcessIdApi(logEntry.PROCESS_ID);
        const details = res?.data?.DETAILS ?? [];
        if (alive) {
          setLogDetails(details);
          setCurrentPage(1);
        }
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Failed to load details");
      } finally {
        if (alive) setIsLoading(false);
      }
    };
    fetchDetail();
    return () => {
      alive = false;
    };
  }, [logEntry.PROCESS_ID]);

  const formatDate = (dateString: string) => {
    const parts = dateString.split(" ")[0].split("-"); // DD-MM-YYYY
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
    }
    return "";
  };
  const formattedStartDate = logEntry.START_DATE;
  const formattedEndDate = logEntry.END_DATE;

  const currentDetails = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return logDetails.slice(startIndex, startIndex + itemsPerPage);
  }, [logDetails, currentPage, itemsPerPage]);
  console.log("currentDetails", currentDetails)

  const totalItems = logDetails.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handleDownload = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const dateStamp = `${year}${month}${day}`;
    const fileName = `SAR_log_detail_${logEntry.PROCESS_ID}_${dateStamp}.xlsx`;

    const headers = ["No", "Message Date Time", "Location", "Message Detail"];
    const dataToExport = logDetails.map((detail, index) => [
      startItem + index,
      detail.MESSAGE_DATE_TIME,
      detail.LOCATION,
      detail.MESSAGE_DETAIL,
    ]);
    const worksheetData = [headers, ...dataToExport];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LogDetails");
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Logging Monitoring Detail
      </h2>
      <div className="text-sm text-gray-500 mb-6 flex items-center flex-wrap">
        <button
          onClick={onBack}
          className="text-blue-600 hover:underline hover:text-blue-800 transition-colors"
          aria-label="Back to Logging Monitoring"
        >
          Logging Monitoring
        </button>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-700">
          {logEntry.PROCESS_ID} - {logEntry.USER_ID}
        </span>
      </div>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-x-3 mb-6 flex-wrap">
          <FilterDisplay
            label="Process ID"
            value={logEntry.PROCESS_ID}
            hasSearchIcon
          />
          <FilterSelectDisplay label="User ID" value={logEntry.USER_ID} />
          <FilterSelectDisplay label="Module" value={logEntry.MODULE} />
          <FilterSelectDisplay label="Function" value={logEntry.FUNCTION_NAME} />
          <FilterDisplay label="Start Date" value={formattedStartDate} />
          <FilterDisplay label="End Date" value={formattedEndDate} />
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
          >
            Download
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm text-left text-gray-600">
            <thead className="text-sm text-gray-700 border-b-2 border-gray-200">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold text-sm">
                  No
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-sm">
                  Message Date Time
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-sm">
                  Location
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-sm">
                  Message Detail
                </th>
              </tr>
            </thead>
            <tbody>
              {currentDetails.length > 0 ? (
                currentDetails.map((detail, index) => (
                  <tr
                    key={detail.ID}
                    className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-gray-900 text-sm">
                      {startItem + index}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {detail.MESSAGE_DATE_TIME}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {detail.LOCATION}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {detail.MESSAGE_DETAIL}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-10 text-gray-500 text-sm"
                  >
                    No details found.
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
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border bg-white border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous Page"
              >
                &lt;
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
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

export default LoggingMonitoringDetailPage;
