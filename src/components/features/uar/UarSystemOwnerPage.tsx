import React, { useEffect, useMemo, useState } from "react";
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
import SearchableDropdown from "../../common/SearchableDropdown";
import { postLogMonitoringApi } from "@/src/api/log_monitoring";
import { AuditAction } from "@/src/constants/auditActions";
import { useAuthStore } from "@/src/store/authStore";

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
  const { currentUser } = useAuthStore()

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

  const enhancedRecords = useMemo(() => {
    const computePeriod = (uarId: string) => {
      const parts = uarId.split("_");
      if (parts.length > 1 && parts[1].length === 6 && /^\d+$/.test(parts[1])) {
        const month = parts[1].substring(0, 2);
        const year = `20${parts[1].substring(2)}`;
        return `${year}-${month}`;
      }
      return null;
    };

    return records.map((record) => {
      const progress = progressData.get(record.uarId);
      const reviewed = progress?.reviewed ?? 0;
      const total = progress?.total ?? 0;
      const isFinished = total > 0 && reviewed === total;
      const percentComplete = total > 0
        ? `${Math.round((reviewed / total) * 100)}% (${reviewed} of ${total})`
        : "0% (0 of 0)";

      return {
        ...record,
        percentComplete,
        status: isFinished ? "Finished" as const : "InProgress" as const,
        periodKey: computePeriod(record.uarId),
        searchableUarId: record.uarId.toLowerCase(),
        searchableOwner: record.divisionOwner.toLowerCase(),
      };
    });
  }, [records, progressData]);

  const overallProgress = useMemo(() => {
    const totalCount = enhancedRecords.length;
    const finishedCount = enhancedRecords.filter(
      (record) => record.status === "Finished"
    ).length;

    return { finishedCount, totalCount };
  }, [enhancedRecords]);

  const filteredRecords = useMemo(() => {
    const normalizedUarFilter = uarFilter.trim().toLowerCase();
    const normalizedOwnerFilter = ownerFilter.trim().toLowerCase();

    return enhancedRecords.filter((record) => {
      if (
        normalizedUarFilter &&
        !record.searchableUarId.includes(normalizedUarFilter)
      ) {
        return false;
      }

      if (
        normalizedOwnerFilter &&
        !record.searchableOwner.includes(normalizedOwnerFilter)
      ) {
        return false;
      }

      if (statusFilter && record.status !== statusFilter) {
        return false;
      }

      if (periodFilter && record.periodKey !== periodFilter) {
        return false;
      }

      return true;
    });
  }, [enhancedRecords, periodFilter, statusFilter, uarFilter, ownerFilter]);

  const totalItems = filteredRecords.length;
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    if (totalItems === 0) {
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
      return;
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalItems, totalPages]);

  const handleReviewClick = async (record: UarSystemOwnerRecord) => {
    // 1️⃣ Jalankan fungsi review yang dikirim dari parent
    onReview(record);

    // 2️⃣ Kirim log monitoring
    try {
      await postLogMonitoringApi({
        userId: currentUser?.username ?? "anonymous",
        module: "UAR System Owner",
        action: AuditAction.DATA_REVIEW,
        status: "Success",
        description: `User ${currentUser?.username ?? "unknown"} reviewed UAR ${record.uarId}`,
        location: "UarSystemOwnerPage.handleReviewClick",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Gagal mencatat log review:", err);
    }
  };

  const handleDownloadClick = async (record: UarSystemOwnerRecord) => {
    try {
      await postLogMonitoringApi({
        userId: currentUser?.username ?? "anonymous",
        module: "UAR System Owner",
        action: AuditAction.DATA_DOWNLOAD,
        status: "Success",
        description: `User ${currentUser?.username ?? "unknown"} downloaded UAR ${record.uarId}`,
        location: "UarSystemOwnerPage.handleDownloadClick",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Gagal mencatat log download:", err);
    }
  };

  const { paginatedRecords, startItem, endItem } = useMemo(() => {
    if (totalItems === 0) {
      return {
        paginatedRecords: [] as typeof enhancedRecords,
        startItem: 0,
        endItem: 0,
      };
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
      paginatedRecords: filteredRecords.slice(startIndex, endIndex),
      startItem: startIndex + 1,
      endItem: endIndex,
    };
  }, [
    filteredRecords,
    totalItems,
    currentPage,
    itemsPerPage,
    enhancedRecords,
  ]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
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
          <div className="flex items-center gap-4 flex-wrap">
            <SearchableDropdown
              label="UAR ID"
              value={uarFilter}
              onChange={setUarFilter}
              options={[...new Set(records.map(r => r.uarId))]}
              placeholder="UAR ID"
            />
            <SearchableDropdown
              label="Division Owner"
              value={ownerFilter}
              onChange={setOwnerFilter}
              options={[...new Set(records.map(r => r.divisionOwner))]}
              placeholder="Division Owner"
            />
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
                className="w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                className="w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <SearchableDropdown
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={['Finished', 'InProgress']}
              searchable={false}
              placeholder="Status"
            />
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
              {paginatedRecords.map((record) => {
                return (
                  <tr
                    key={record.ID}
                    className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.uarId}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {record.divisionOwner}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {record.percentComplete}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {record.createDate}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {record.completedDate}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <StatusPill status={record.status} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-3">
                        <div className="group relative">
                          {/* Button Review */}
                          <ActionReview onClick={() => handleReviewClick(record)} />
                        </div>
                        <div className="group relative">
                          {/* Button download */}
                          <ActionDownload onClick={() => handleDownloadClick(record)} />
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
              Showing {totalItems === 0 ? 0 : `${startItem}-${endItem}`} of {totalItems}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-2 py-1 border bg-white border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                aria-label="Previous Page"
              >
                &lt;
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
