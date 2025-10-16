import React, { useState, useMemo } from "react";
import {
  initialUarSystemOwnerData,
  initialUarSystemOwnerDetailData,
} from "../../../../data";
import type { UarSystemOwnerRecord } from "../../../../data";
import { ChevronDownIcon } from "../../icons/ChevronDownIcon";
import { SearchIcon } from "../../icons/SearchIcon";
import { ProgressCheckIcon } from "../../icons/ProgressCheckIcon";
import { SendIcon } from "../../icons/SendIcon";
import { DownloadActionIcon } from "../../icons/DownloadActionIcon";
import StatusPill from "../StatusPill/StatusPill";
import { ActionReview } from "../../common/Button/ActionReview";
import { ActionDownload } from "../../common/Button/ActionDownload";

interface UarSystemOwnerPageProps {
  onReview: (record: UarSystemOwnerRecord) => void;
}

const UarSystemOwnerPage: React.FC<UarSystemOwnerPageProps> = ({
  onReview,
}) => {
  const [records] = useState<UarSystemOwnerRecord[]>(initialUarSystemOwnerData);

  // Filters
  const [periodFilter, setPeriodFilter] = useState("");
  const [uarFilter, setUarFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [createDateFilter, setCreateDateFilter] = useState("");
  const [completedDateFilter, setCompletedDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const progressData = useMemo(() => {
    const progressMap = new Map<string, { reviewed: number; total: number }>();
    initialUarSystemOwnerDetailData.forEach((detail) => {
      const progress = progressMap.get(detail.uarId) || {
        reviewed: 0,
        total: 0,
      };
      progress.total += 1;
      if (detail.reviewed) {
        progress.reviewed += 1;
      }
      progressMap.set(detail.uarId, progress);
    });
    return progressMap;
  }, []);

  const overallProgress = useMemo(() => {
    const totalCount = records.length;
    let finishedCount = 0;

    records.forEach((record) => {
      const progress = progressData.get(record.uarId);
      if (progress && progress.reviewed === progress.total) {
        finishedCount++;
      }
    });

    return { finishedCount, totalCount };
  }, [records, progressData]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const uarMatch = uarFilter
        ? record.uarId.toLowerCase().includes(uarFilter.toLowerCase())
        : true;
      const ownerMatch = ownerFilter
        ? record.divisionOwner.toLowerCase().includes(ownerFilter.toLowerCase())
        : true;

      const progress = progressData.get(record.uarId);
      const status: "Finished" | "InProgress" =
        progress && progress.reviewed === progress.total
          ? "Finished"
          : "InProgress";
      const statusMatch = statusFilter ? status === statusFilter : true;

      const periodMatch = (() => {
        if (!periodFilter) return true; // periodFilter is "YYYY-MM"
        const parts = record.uarId.split("_");
        if (
          parts.length > 1 &&
          parts[1].length === 6 &&
          /^\d+$/.test(parts[1])
        ) {
          const month = parts[1].substring(0, 2);
          const year = `20${parts[1].substring(2)}`;
          const recordPeriod = `${year}-${month}`;
          return recordPeriod === periodFilter;
        }
        return false;
      })();

      return periodMatch && uarMatch && ownerMatch && statusMatch;
    });
  }, [
    records,
    periodFilter,
    uarFilter,
    ownerFilter,
    statusFilter,
    progressData,
  ]);

  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRecords = filteredRecords.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const startItem = totalItems > 0 ? startIndex + 1 : 0;
  const endItem = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        UAR System Owner
      </h2>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="mb-6">
          {/* Top Row: Period and Progress Card */}
          <div className="flex justify-between items-start gap-4 mb-4 flex-wrap">
            {/* Period Input */}
            <div className="relative w-full max-w-sm">
              <input
                type={periodFilter ? "month" : "text"}
                placeholder="Period"
                value={periodFilter}
                onChange={(e) => {
                  setPeriodFilter(e.target.value);
                  setCurrentPage(1);
                }}
                onFocus={(e) => {
                  e.target.type = "month";
                  try {
                    e.currentTarget.showPicker();
                  } catch (e) {
                    /* ignore */
                  }
                }}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = "text";
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Progress Review Card */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm w-full sm:w-auto sm:max-w-[240px]">
              <p className="text-sm text-gray-500 font-medium">
                Progress Review
              </p>
              <div className="flex items-center justify-between mt-2 gap-4">
                <div>
                  <p className="text-4xl font-bold text-gray-800">{`${overallProgress.finishedCount} / ${overallProgress.totalCount}`}</p>
                  <p className="text-sm text-gray-500">Application</p>
                </div>
                <ProgressCheckIcon className="w-12 h-12 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Bottom Row: Other Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="UAR"
                value={uarFilter}
                onChange={(e) => setUarFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Division Owner"
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="relative">
              <input
                type={createDateFilter ? "date" : "text"}
                placeholder="Create Date"
                value={createDateFilter}
                onChange={(e) => setCreateDateFilter(e.target.value)}
                onFocus={(e) => {
                  e.target.type = "date";
                }}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = "text";
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="relative">
              <input
                type={completedDateFilter ? "date" : "text"}
                placeholder="Completed Date"
                value={completedDateFilter}
                onChange={(e) => setCompletedDateFilter(e.target.value)}
                onFocus={(e) => {
                  e.target.type = "date";
                }}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = "text";
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Status</option>
                <option value="Finished">Finished</option>
                <option value="InProgress">In Progress</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm text-left text-gray-700">
            <thead className="text-sm text-gray-800 font-bold bg-gray-50">
              <tr className="border-b-2 border-gray-200">
                {[
                  "UAR ID",
                  "Division Owner",
                  "Percent Complete",
                  "Create Date",
                  "Completed Date",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 text-sm">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((record) => {
                const progress = progressData.get(record.uarId);
                const percentComplete =
                  progress && progress.total > 0
                    ? `${Math.round(
                        (progress.reviewed / progress.total) * 100
                      )}% (${progress.reviewed} of ${progress.total})`
                    : "0% (0 of 0)";
                const status: "Finished" | "InProgress" =
                  progress && progress.reviewed === progress.total
                    ? "Finished"
                    : "InProgress";

                return (
                  <tr
                    key={record.id}
                    className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.uarId}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {record.divisionOwner}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {percentComplete}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {record.createDate}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {record.completedDate}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <StatusPill status={status} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-3">
                        <div className="group relative">
                          {/* Button Review */}
                          <ActionReview onClick={() => onReview(record)} />
                        </div>
                        <div className="group relative">
                          {/* Button download */}
                          <ActionDownload />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 border bg-white border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                aria-label="Previous Page"
              >
                &lt;
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
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
    </div>
  );
};

export default UarSystemOwnerPage;
