import React, { useState, useEffect, useMemo, useRef } from "react";
import { initialSchedules } from "../../../../data";
import { isValidDdMm, isUarDateValid } from "../../../../utils/dateFormatter";
import { TrashIcon } from "../../icons/TrashIcon";
import ShortDatePicker from "../Button/ShortDatePicker";
import { ScheduleData } from "@/src/types/schedule";

interface SetScheduleModalProps {
  onClose: () => void;
  onSave: (newSchedules: Omit<ScheduleData, "ID">[]) => void;
}

type AppOption = { id: string; name: string };
const availableApps: AppOption[] = [
  ...new Map(
    initialSchedules.map((item) => [
      item.applicationId,
      { id: item.applicationId, name: item.applicationName },
    ])
  ).values(),
];

const SetScheduleModal: React.FC<SetScheduleModalProps> = ({
  onClose,
  onSave,
}) => {
  const [selectedApps, setSelectedApps] = useState<AppOption[]>([]);
  const [appName, setAppName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [schedules, setSchedules] = useState([
    {
      SCHEDULE_SYNC_START_DT: "",
      SCHEDULE_SYNC_END_DT: "",
      SCHEDULE_UAR_DT: "",
    },
  ]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAppSelect = (app: AppOption) => {
    if (!selectedApps.some((selected) => selected.id === app.id)) {
      setSelectedApps([...selectedApps, app]);
    }
  };

  const handleAppRemove = (appId: string) => {
    setSelectedApps(selectedApps.filter((app) => app.id !== appId));
  };

  const handleScheduleChange = (
    index: number,
    field:
      | "SCHEDULE_SYNC_START_DT"
      | "SCHEDULE_SYNC_END_DT"
      | "SCHEDULE_UAR_DT",
    value: string
  ) => {
    const newSchedules = [...schedules];
    newSchedules[index][field] = value;
    setSchedules(newSchedules);
  };

  const addSchedule = () => {
    setSchedules([
      ...schedules,
      {
        SCHEDULE_SYNC_END_DT: "",
        SCHEDULE_SYNC_START_DT: "",
        SCHEDULE_UAR_DT: "",
      },
    ]);
  };

  const removeSchedule = (indexToRemove: number) => {
    setSchedules(schedules.filter((_, index) => index !== indexToRemove));
  };

  const isFormValid = useMemo(() => {
    if (selectedApps.length === 0 || !appName.trim()) return false;
    return schedules.every(
      (s) =>
        isValidDdMm(s.SCHEDULE_SYNC_START_DT) &&
        isValidDdMm(s.SCHEDULE_SYNC_END_DT) &&
        isValidDdMm(s.SCHEDULE_UAR_DT) &&
        isUarDateValid(s.SCHEDULE_SYNC_START_DT, s.SCHEDULE_UAR_DT)
    );
  }, [selectedApps, appName, schedules]);

  const handleSave = () => {
    if (!isFormValid) return;

    // This type should match what 'addSchedule' expects
    const newScheduleEntries: Omit<ScheduleData, "ID">[] = [];

    selectedApps.forEach((app) => {
      schedules.forEach((schedule) => {
        newScheduleEntries.push({
          APPLICATION_ID: app.id,
          SCHEDULE_SYNC_START_DT: schedule.SCHEDULE_SYNC_START_DT.trim(),
          SCHEDULE_SYNC_END_DT: schedule.SCHEDULE_SYNC_END_DT.trim(),
          SCHEDULE_UAR_DT: schedule.SCHEDULE_UAR_DT.trim(),
          SCHEDULE_STATUS: "Pending",
        });
      });
    });

    onSave(newScheduleEntries);
  };

  const getInputClasses = (
    schedule: {
      SCHEDULE_SYNC_START_DT: string;
      SCHEDULE_SYNC_END_DT: string;
      SCHEDULE_UAR_DT: string;
    },
    field: "SCHEDULE_SYNC_START_DT" | "SCHEDULE_SYNC_END_DT" | "SCHEDULE_UAR_DT"
  ) => {
    const baseClasses =
      "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1";
    const validClasses =
      "border-gray-300 focus:ring-blue-500 focus:border-blue-500";
    const invalidClasses =
      "border-red-500 focus:ring-red-500 focus:border-red-500";

    const value = schedule[field];

    if (!isValidDdMm(value) && value.length > 0) {
      return `${baseClasses} ${invalidClasses}`;
    }

    if (
      field === "SCHEDULE_UAR_DT" &&
      value.length > 0 &&
      isValidDdMm(schedule.SCHEDULE_SYNC_START_DT) &&
      !isUarDateValid(schedule.SCHEDULE_SYNC_START_DT, value)
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Set Schedule</h2>
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

        <div className="p-6 space-y-4 overflow-y-auto">
          <div ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex flex-wrap items-center gap-2 p-2 pr-10 border border-gray-300 rounded-md bg-white min-h-[42px] cursor-pointer"
              >
                {selectedApps.length === 0 && (
                  <span className="text-gray-400">Select Application</span>
                )}
                {selectedApps.map((app) => (
                  <span
                    key={app.id}
                    className="flex items-center gap-1.5 bg-gray-200 text-gray-700 text-sm font-medium px-2 py-0.5 rounded"
                  >
                    {app.id}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAppRemove(app.id);
                      }}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
              {isDropdownOpen && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto">
                  {availableApps.map((app) => (
                    <li
                      key={app.id}
                      onMouseDown={() => handleAppSelect(app)}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                        selectedApps.some((s) => s.id === app.id)
                          ? "bg-blue-100 text-blue-700"
                          : ""
                      }`}
                    >
                      {app.id}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="appName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Application Name <span className="text-red-500">*</span>
            </label>
            <input
              id="appName"
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Application Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {schedules.map((schedule, index) => (
            <div key={index} className="space-y-4 pt-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold text-gray-600">
                    Schedule {index + 1}
                  </h3>
                  {schedules.length > 1 && (
                    <button
                      onClick={() => removeSchedule(index)}
                      type="button"
                      className="text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <hr className="flex-grow border-t border-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule Synchronize <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* schedule syncronize start */}
                  <ShortDatePicker
                    value={schedule.SCHEDULE_SYNC_START_DT}
                    onChange={(val) =>
                      handleScheduleChange(index, "SCHEDULE_SYNC_START_DT", val)
                    }
                    className={getInputClasses(
                      schedule,
                      "SCHEDULE_SYNC_START_DT"
                    )}
                  />
                  {/* schedule syncronize end */}
                  <ShortDatePicker
                    value={schedule.SCHEDULE_SYNC_END_DT}
                    onChange={(val) =>
                      handleScheduleChange(index, "SCHEDULE_SYNC_END_DT", val)
                    }
                    className={getInputClasses(
                      schedule,
                      "SCHEDULE_SYNC_END_DT"
                    )}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule UAR <span className="text-red-500">*</span>
                </label>
                {/* schedule SCHEDULE_UAR_DT */}
                <ShortDatePicker
                  value={schedule.SCHEDULE_UAR_DT}
                  onChange={(val) =>
                    handleScheduleChange(index, "SCHEDULE_UAR_DT", val)
                  }
                  className={getInputClasses(schedule, "SCHEDULE_UAR_DT")}
                />
                {schedule.SCHEDULE_UAR_DT.length > 0 &&
                  isValidDdMm(schedule.SCHEDULE_SYNC_START_DT) &&
                  isValidDdMm(schedule.SCHEDULE_UAR_DT) &&
                  !isUarDateValid(
                    schedule.SCHEDULE_SYNC_START_DT,
                    schedule.SCHEDULE_UAR_DT
                  ) && (
                    <p className="mt-1 text-sm text-red-600">
                      Schedule UAR must be after Schedule Synchronize date (
                      {schedule.SCHEDULE_SYNC_START_DT})
                    </p>
                  )}
              </div>
            </div>
          ))}
          <div className="flex justify-center">
            <button
              onClick={addSchedule}
              type="button"
              className="w-8 h-8 flex items-center justify-center text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-100"
            >
              +
            </button>
          </div>
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

export default SetScheduleModal;
