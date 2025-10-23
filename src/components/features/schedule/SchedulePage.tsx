import React, { useState, useMemo } from "react";
import type { Schedule } from "../../../../data";
import { SearchIcon } from "../../icons/SearchIcon";
import { ChevronDownIcon } from "../../icons/ChevronDownIcon";
import { EditIcon } from "../../icons/EditIcon";
import { CalendarIcon } from "../../icons/CalendarIcon";
import ScheduleEditModal from "../../common/Modal/ScheduleEditModal";
import ConfirmationModal from "../../common/Modal/ConfirmationModal";
import SetScheduleModal from "../../common/Modal/SetScheduleModal";
import SuccessModal from "../../common/Modal/SuccessModal";
import StatusConfirmationModal from "../../common/Modal/StatusConfirmationModal";
import { formatDdMmToDisplayDate } from "../../../../utils/dateFormatter";
import StatusPill from "../StatusPill/StatusPill";
import { IconButton } from "../../common/Button/IconButton";
import { AddButton } from "../../common/Button/AddButton";
import SearchableDropdown from "../../common/SearchableDropdown";
import {
  useSchedules,
  useFilteredSchedules,
  useScheduleFilters,
  useSchedulePagination,
  useScheduleActions,
} from "../../../hooks/useStoreSelectors";

const SchedulePage: React.FC = () => {
  // Zustand store hooks
  const schedules = useSchedules();
  const storeFilteredSchedules = useFilteredSchedules();
  const { filters, setFilters } = useScheduleFilters();
  const {
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    getTotalPages,
    getCurrentPageSchedules,
  } = useSchedulePagination();
  const {
    setSchedules,
    setFilteredSchedules,
    setSelectedSchedule,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  } = useScheduleActions();

  // Local state for UI interactions
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSetScheduleModalOpen, setIsSetScheduleModalOpen] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<Schedule[] | null>(null);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [scheduleToChangeStatus, setScheduleToChangeStatus] =
    useState<Schedule | null>(null);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const appIdMatch = filters.applicationId
        ? schedule.applicationId
            .toLowerCase()
            .includes(filters.applicationId.toLowerCase())
        : true;
      const appNameMatch = filters.applicationName
        ? schedule.applicationName
            .toLowerCase()
            .includes(filters.applicationName.toLowerCase())
        : true;
      const statusMatch = filters.status
        ? schedule.status === filters.status
        : true;
      return appIdMatch && appNameMatch && statusMatch;
    });
  }, [schedules, filters]);

  // Update filtered schedules in store when filters change
  React.useEffect(() => {
    const haveSameLength =
      storeFilteredSchedules.length === filteredSchedules.length;
    const haveSameIds =
      haveSameLength &&
      storeFilteredSchedules.every(
        (schedule, index) => schedule.id === filteredSchedules[index]?.id
      );

    if (!haveSameIds) {
      setFilteredSchedules(filteredSchedules);
    }
  }, [filteredSchedules, storeFilteredSchedules, setFilteredSchedules]);

  const totalPages = getTotalPages();
  const currentSchedules = getCurrentPageSchedules();

  const startItem =
    currentSchedules.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(
    currentPage * itemsPerPage,
    filteredSchedules.length
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(currentSchedules.map((s) => s.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const isAllSelectedOnPage =
    currentSchedules.length > 0 &&
    selectedRows.length > 0 &&
    currentSchedules.every((s) => selectedRows.includes(s.id));

  const handleOpenEditModal = () => {
    if (selectedRows.length > 0) {
      setIsEditModalOpen(true);
    }
  };

  const handleEditSave = (updatedSchedules: Schedule[]) => {
    setPendingUpdate(updatedSchedules);
    setIsEditModalOpen(false);
    setIsSaveConfirmOpen(true);
  };

  const handleConfirmEditSave = () => {
    if (pendingUpdate) {
      pendingUpdate.forEach((updatedSchedule) => {
        updateSchedule(updatedSchedule.id, updatedSchedule);
      });

      setSelectedRows([]);
      setShowSuccessModal(true);
    }
    setIsSaveConfirmOpen(false);
    setPendingUpdate(null);
  };

  console.log(currentSchedules);

  const handleAddNewSchedules = (newSchedules: Omit<Schedule, "id">[]) => {
    const highestId = schedules.reduce(
      (maxId, schedule) => Math.max(schedule.id, maxId),
      0
    );

    const schedulesToAdd = newSchedules.map((s, index) => {
      const formatSyncDate = (syncStr: string) => {
        const parts = syncStr.split(" - ");
        if (parts.length === 2) {
          const start = formatDdMmToDisplayDate(parts[0]);
          const end = formatDdMmToDisplayDate(parts[1]);
          return `${start} - ${end}`;
        }
        return syncStr;
      };

      return {
        ...s,
        id: highestId + 1 + index,
        scheduleSync: formatSyncDate(s.scheduleSync),
        scheduleUar: formatDdMmToDisplayDate(s.scheduleUar),
      };
    });

    schedulesToAdd.forEach((schedule) => {
      addSchedule(schedule);
    });
    setIsSetScheduleModalOpen(false);
    setShowSuccessModal(true);
  };

  const handleOpenStatusConfirm = (schedule: Schedule) => {
    setScheduleToChangeStatus(schedule);
    setIsStatusConfirmOpen(true);
  };

  const handleCloseStatusConfirm = () => {
    setScheduleToChangeStatus(null);
    setIsStatusConfirmOpen(false);
  };

  const handleConfirmStatusChange = () => {
    if (!scheduleToChangeStatus) return;

    const newStatus =
      scheduleToChangeStatus.status === "Active"
        ? "Inactive"
        : ("Active" as "Active" | "Inactive");
    updateSchedule(scheduleToChangeStatus.id, { status: newStatus });

    handleCloseStatusConfirm();
    setShowSuccessModal(true);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Schedule</h2>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <SearchableDropdown
              label="Application ID"
              value={filters.applicationId}
              onChange={(value) => setFilters({ applicationId: value })}
              options={[...new Set(schedules.map((s) => s.applicationId))]}
              placeholder="Application ID"
              className="w-full sm:w-48"
            />
            <SearchableDropdown
              label="Application Name"
              value={filters.applicationName}
              onChange={(value) => setFilters({ applicationName: value })}
              options={[...new Set(schedules.map((s) => s.applicationName))]}
              placeholder="Application Name"
              className="w-full sm:w-48"
            />
            <SearchableDropdown
              label="Status"
              value={filters.status}
              onChange={(value) => setFilters({ status: value })}
              options={["Active", "Inactive"]}
              searchable={false}
              placeholder="Status"
              className="w-full sm:w-40"
            />
          </div>
          <div className="flex items-center gap-3">
            {/* button edit */}
            <IconButton
              mode="label"
              leftIcon={<EditIcon className="w-4 h-4" />}
              label="Edit"
              disabled={selectedRows.length === 0}
              onClick={handleOpenEditModal}
              hoverColor="blue"
            />
            {/* button set schedule */}
            <AddButton
              onClick={() => setIsSetScheduleModalOpen(true)}
              label="Set Schedule"
            >
              <CalendarIcon className="w-4 h-4" />
            </AddButton>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm text-left text-gray-700">
            <thead className="text-sm text-black font-bold">
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
                <th scope="col" className="px-4 py-3 text-sm">
                  Application ID
                </th>
                <th scope="col" className="px-4 py-3 text-sm">
                  Application Name
                </th>
                <th scope="col" className="px-4 py-3 text-sm">
                  Schedule Synchronize
                </th>
                <th scope="col" className="px-4 py-3 text-sm">
                  Schedule UAR
                </th>
                <th scope="col" className="px-4 py-3 text-sm">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {currentSchedules.map((schedule) => (
                <tr
                  key={schedule.id}
                  className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedRows.includes(schedule.id)}
                      onChange={() => handleSelectRow(schedule.id)}
                      aria-label={`Select row ${schedule.id}`}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-900 text-sm">
                    {schedule.applicationId}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {schedule.applicationName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {schedule.scheduleSync}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {schedule.scheduleUar}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button
                      type="button"
                      onClick={() => handleOpenStatusConfirm(schedule)}
                      className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
                      aria-label={`Change status for ${schedule.applicationName}`}
                    >
                      <StatusPill status={schedule.status} />
                    </button>
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
            <span>
              Showing {startItem}-{endItem} of {filteredSchedules.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 border bg-white border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous Page"
              >
                &lt;
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-2 py-1 border bg-white border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next Page"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <ScheduleEditModal
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditSave}
          schedulesToEdit={schedules.filter((s) => selectedRows.includes(s.id))}
        />
      )}
      {isSetScheduleModalOpen && (
        <SetScheduleModal
          onClose={() => setIsSetScheduleModalOpen(false)}
          onSave={handleAddNewSchedules}
        />
      )}
      {isSaveConfirmOpen && (
        <ConfirmationModal
          onClose={() => setIsSaveConfirmOpen(false)}
          onConfirm={handleConfirmEditSave}
          title="Edit Schedule Confirmation"
          message="Do you want to submit?"
        />
      )}
      {showSuccessModal && (
        <SuccessModal onClose={() => setShowSuccessModal(false)} />
      )}
      {isStatusConfirmOpen && scheduleToChangeStatus && (
        <StatusConfirmationModal
          onClose={handleCloseStatusConfirm}
          onConfirm={handleConfirmStatusChange}
          currentStatus={scheduleToChangeStatus.status}
        />
      )}
    </div>
  );
};

export default SchedulePage;
