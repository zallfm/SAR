import React, { useState, useEffect, useMemo } from "react";
import type { Schedule } from "../../../../data";
import {
  formatDisplayDateToDdMm,
  isValidDdMm,
  formatDdMmToDisplayDate,
  isUarDateValid,
} from "../../../../utils/dateFormatter";
import ShortDatePicker from "../Button/ShortDatePicker";
import { ScheduleData } from "@/src/types/schedule";

interface ScheduleEditModalProps {
  onClose: () => void;
  onSave: (updatedSchedules: ScheduleData[]) => void;
  schedulesToEdit: ScheduleData[];
}

const ScheduleEditModal: React.FC<ScheduleEditModalProps> = ({
  onClose,
  onSave,
  schedulesToEdit,
}) => {
  const [editedSchedules, setEditedSchedules] = useState<ScheduleData[]>([]);
  const handleScheduleChange = (
    id: string,
    field: keyof Omit<
      ScheduleData,
      "ID" | "APPLICATION_ID" | "applicationName"
    >,
    value: string
  ) => {
    setEditedSchedules((prev) => {
      return prev.map((schedule) => {
        return schedule.ID === id ? { ...schedule, [field]: value } : schedule;
      });
    });
  };

  useEffect(() => {
    setEditedSchedules(schedulesToEdit);
  }, [schedulesToEdit]);

  const isFormValid = useMemo(() => {
    return editedSchedules.every(
      (s) =>
        isValidDdMm(s.SCHEDULE_SYNC_START_DT) &&
        isValidDdMm(s.SCHEDULE_SYNC_END_DT) &&
        isValidDdMm(s.SCHEDULE_UAR_DT) &&
        isUarDateValid(s.SCHEDULE_SYNC_END_DT, s.SCHEDULE_UAR_DT)
    );
  }, [editedSchedules]);

  const handleSave = () => {
    if (!isFormValid) return;

    const updatedSchedules: ScheduleData[] = editedSchedules.map((edited) => {
      const originalSchedule = schedulesToEdit.find((s) => s.ID === edited.ID)!;
      return {
        ...originalSchedule,
        SCHEDULE_SYNC_END_DT: edited.SCHEDULE_SYNC_END_DT,
        SCHEDULE_SYNC_START_DT: edited.SCHEDULE_SYNC_START_DT,
        SCHEDULE_UAR_DT: edited.SCHEDULE_UAR_DT,
        SCHEDULE_STATUS: edited.SCHEDULE_STATUS,
      };
    });

    onSave(updatedSchedules);
  };

  const getInputClasses = (
    schedule: ScheduleData,
    field: "SCHEDULE_SYNC_START_DT" | "SCHEDULE_SYNC_END_DT" | "SCHEDULE_UAR_DT"
  ) => {
    const baseClasses =
      "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 text-sm";
    const validClasses =
      "border-gray-300 focus:ring-blue-500 focus:border-blue-500";
    const invalidClasses =
      "border-red-500 focus:ring-red-500 focus:border-red-500";

    const value = schedule[field];

    // Check basic date format validation
    if (!isValidDdMm(value) && value.length > 0) {
      return `${baseClasses} ${invalidClasses}`;
    }

    // Check UAR date validation against sync end date
    if (
      field === "SCHEDULE_UAR_DT" &&
      value.length > 0 &&
      isValidDdMm(schedule.SCHEDULE_SYNC_END_DT) &&
      !isUarDateValid(schedule.SCHEDULE_SYNC_END_DT, value)
    ) {
      return `${baseClasses} ${invalidClasses}`;
    }

    return `${baseClasses} ${validClasses}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Edit Schedule</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-600 bg-red-100 hover:bg-red-200"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {editedSchedules.map((schedule) => (
            <div
              key={schedule.ID}
              className="p-4 border border-gray-200 rounded-lg space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Application ID
                  </label>
                  <p className="text-sm font-semibold text-gray-800 p-2 bg-gray-100 rounded-md">
                    {schedule.APPLICATION_ID}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Application Name
                  </label>
                  <p className="text-sm font-semibold text-gray-800 p-2 bg-gray-100 rounded-md">
                    {schedule.APPLICATION_ID}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Schedule Synchronize
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <ShortDatePicker
                    value={schedule.SCHEDULE_SYNC_START_DT}
                    onChange={(val) =>
                      handleScheduleChange(
                        schedule.ID,
                        "SCHEDULE_SYNC_START_DT",
                        val
                      )
                    }
                    className={getInputClasses(
                      schedule,
                      "SCHEDULE_SYNC_START_DT"
                    )}
                  />
                  <ShortDatePicker
                    value={schedule.SCHEDULE_SYNC_END_DT}
                    onChange={(val) =>
                      handleScheduleChange(
                        schedule.ID,
                        "SCHEDULE_SYNC_END_DT",
                        val
                      )
                    }
                    className={getInputClasses(
                      schedule,
                      "SCHEDULE_SYNC_END_DT"
                    )}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Schedule UAR
                </label>
                <ShortDatePicker
                  value={schedule.SCHEDULE_UAR_DT}
                  onChange={(val) =>
                    handleScheduleChange(schedule.ID, "SCHEDULE_UAR_DT", val)
                  }
                  className={getInputClasses(schedule, "SCHEDULE_UAR_DT")}
                />
                {schedule.SCHEDULE_UAR_DT.length > 0 &&
                  isValidDdMm(schedule.SCHEDULE_SYNC_END_DT) &&
                  isValidDdMm(schedule.SCHEDULE_UAR_DT) &&
                  !isUarDateValid(
                    schedule.SCHEDULE_SYNC_END_DT,
                    schedule.SCHEDULE_UAR_DT
                  ) && (
                    <p className="mt-1 text-sm text-red-600">
                      Schedule UAR must be after Schedule Synchronize date (
                      {schedule.SCHEDULE_SYNC_END_DT})
                    </p>
                  )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end items-center px-6 py-4 bg-gray-50 border-t gap-3 mt-auto rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isFormValid}
            className="px-8 py-2 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleEditModal;
