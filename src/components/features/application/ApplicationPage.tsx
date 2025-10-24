import React, { useEffect, useMemo, useState } from "react";
import { SearchIcon } from "../../icons/SearchIcon";
import { ActionIcon } from "../../icons/ActionIcon";
import { ChevronDownIcon } from "../../icons/ChevronDownIcon";
import AddApplicationModal from "../../common/Modal/AddApplicationModal";
import SuccessModal from "../../common/Modal/SuccessModal";
import { systemUsers } from "../../../../data";
import type { Application } from "../../../../data";
import StatusConfirmationModal from "../../common/Modal/StatusConfirmationModal";
import StatusPill from "../StatusPill/StatusPill";
import { AddButton } from "../../common/Button/AddButton";
import { IconButton } from "../../common/Button/IconButton";
import { EditIcon } from "../../icons/EditIcon";
import { useLogging } from "../../../hooks/useLogging";
import { loggingUtils } from "../../../utils/loggingIntegration";
import SearchableDropdown from "../../common/SearchableDropdown";
import { useApplicationStore } from "../../../store/applicationStore";
// import { postLogMonitoringApi } from "@/src/api/log_monitoring";
// import { AuditAction } from "@/src/constants/auditActions";
// import { useAuthStore } from "@/src/store/authStore";
import { postLogMonitoringApi } from "../../../../src/api/log_monitoring";
import { AuditAction } from "../../../../src/constants/auditActions";
import { useAuthStore } from "../../../../src/store/authStore";

const ApplicationPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const {
    applications,
    searchTerm,
    currentPage,
    itemsPerPage,
    isModalOpen,
    editingApplication,
    isStatusConfirmationOpen,
    pendingStatusApplication,
    setSearchTerm,
    setCurrentPage,
    setItemsPerPage,
    addApplication,
    updateApplication,
    openAddModal,
    openEditModal,
    closeModal,
    openStatusConfirmation,
    closeStatusConfirmation,
  } = useApplicationStore();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingSearch, setPendingSearch] = useState("");

  const { logUserAction, logError } = useLogging({
    componentName: "ApplicationPage",
    enablePerformanceLogging: true,
  });

  const getNameFromNoreg = (noreg: string): string => {
    const user = systemUsers.find((u) => u.ID === noreg);
    return user ? user.name : noreg;
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  // const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setPendingSearch(event.target.value);
  // };

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     setSearchTerm(pendingSearch);
  //     if (pendingSearch.trim() !== "") {
  //       postLogMonitoringApi({
  //         userId: currentUser?.username ?? "anonymous",
  //         module: "Application",
  //         action: AuditAction.DATA_SEARCH,
  //         status: "Success",
  //         description: `User ${
  //           currentUser?.username ?? "unknown"
  //         } searched Application with keyword "${pendingSearch}"`,
  //         location: "ApplicationPage.handleSearchChange",
  //         timestamp: new Date().toISOString(),
  //       }).catch((err) => console.warn("Failed to log search:", err));
  //     }
  //   }, 300);

  //   return () => clearTimeout(timeout);
  // }, [pendingSearch]);

  const handleOpenAddModal = () => {
    openAddModal();
    loggingUtils.logCriticalAction(
      "open_add_application_modal",
      "Application",
      {
        timestamp: new Date().toISOString(),
      }
    );
  };

  const handleOpenEditModal = (app: Application) => {
    openEditModal(app);
    loggingUtils.logCriticalAction(
      "open_edit_application_modal",
      "Application",
      {
        applicationId: app.ID,
        applicationName: app.name,
        timestamp: new Date().toISOString(),
      }
    );
  };

  const handleCloseModal = () => {
    closeModal();
  };

  const handleSaveApplication = async (application: Application) => {
    if (editingApplication) {
      updateApplication(application);

      loggingUtils.logDataChange("Update", "Application", application.ID, {
        applicationName: application.name,
        timestamp: new Date().toISOString(),
      });

      await postLogMonitoringApi({
        userId: currentUser?.username ?? "anonymous",
        module: "Application",
        action: AuditAction.DATA_UPDATE,
        status: "Success",
        description: `User update aplikasi ${application.name}`,
        location: "ApplicationPage.UpdateForm",
        timestamp: new Date().toISOString(),
      });
    } else {
      addApplication(application);

      loggingUtils.logDataChange("Create", "Application", application.ID, {
        applicationName: application.name,
        timestamp: new Date().toISOString(),
      });

      await postLogMonitoringApi({
        userId: currentUser?.username ?? "anonymous",
        module: "Application",
        action: AuditAction.DATA_CREATE,
        status: "Success",
        description: `User menambahkan aplikasi ${application.name}`,
        location: "ApplicationPage.CreateForm",
        timestamp: new Date().toISOString(),
      });
    }

    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 3000);
  };

  const handleOpenStatusConfirm = (app: Application) => {
    openStatusConfirmation(app);
  };

  const handleCloseStatusConfirm = () => {
    closeStatusConfirmation();
  };

  const handleConfirmStatusChange = () => {
    if (!pendingStatusApplication) return;

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, "0")}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${now.getFullYear()}`;
    const formattedTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const newUpdateTime = `${formattedDate}\n${formattedTime}`;

    const updatedApplication: Application = {
      ...pendingStatusApplication,
      status:
        pendingStatusApplication.status === "Active" ? "Inactive" : "Active",
      updated: newUpdateTime,
    };

    updateApplication(updatedApplication);
    handleCloseStatusConfirm();
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 3000);
  };

  const enhancedApplications = useMemo(() => {
    const enhanceString = (value: string) => value.replace("\\n", " ");

    return applications.map((app) => ({
      ...app,
      searchableFields: Object.values(app)
        .map((value) => String(value).toLowerCase())
        .join("|"),
      createdDisplay: enhanceString(app.created),
      updatedDisplay: enhanceString(app.updated),
    }));
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return enhancedApplications;
    }

    return enhancedApplications.filter((app) =>
      app.searchableFields.includes(term)
    );
  }, [enhancedApplications, searchTerm]);

  const totalItems = filteredApplications.length;
  const totalPages =
    totalItems === 0 ? 1 : Math.ceil(totalItems / itemsPerPage);

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
  }, [currentPage, totalItems, totalPages, setCurrentPage]);

  const { paginatedApplications, startItem, endItem } = useMemo(() => {
    if (totalItems === 0) {
      return {
        paginatedApplications: [] as typeof enhancedApplications,
        startItem: 0,
        endItem: 0,
      };
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
      paginatedApplications: filteredApplications.slice(startIndex, endIndex),
      startItem: startIndex + 1,
      endItem: endIndex,
    };
  }, [
    filteredApplications,
    totalItems,
    currentPage,
    itemsPerPage,
    enhancedApplications,
  ]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Application</h2>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <SearchIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <AddButton onClick={handleOpenAddModal} label="+ Add" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-sm text-left text-gray-600">
            <thead className="bg-white text-sm text-gray-700 font-bold border-b-2 border-gray-200">
              <tr>
                <th scope="col" className="px-4 py-3 text-sm">
                  Application ID
                </th>
                <th scope="col" className="px-4 py-3 text-sm">
                  Application Name
                </th>
                <th scope="col" className="px-4 py-3 text-sm">
                  Division Owner
                </th>
                <th scope="col" className="px-4 py-3 text-sm">
                  System Owner
                </th>
                <th scope="col" className="px-4 py-3 text-sm">
                  System Custodian
                </th>
                <th scope="col" className="px-4 py-3 text-sm">
                  Security Center
                </th>
                <th scope="col" className="px-4 py-3 text-sm">
                  Created Date
                </th>
                <th scope="col" className="px-4 py-3 text-sm">
                  Last Updated
                </th>
                <th scope="col" className="px-4 py-3 text-sm">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-sm">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedApplications.map((app, index) => (
                <tr
                  key={`${app.ID}-${index}`}
                  className="bg-white border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-4 whitespace-nowrap text-gray-900 text-sm">
                    {app.ID}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {app.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {app.division}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {getNameFromNoreg(app.owner)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {getNameFromNoreg(app.custodian)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {app.securityCenter}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {app.createdDisplay}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {app.updatedDisplay}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <button
                      type="button"
                      onClick={() => handleOpenStatusConfirm(app)}
                      className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
                      aria-label={`Change status for ${app.name}`}
                    >
                      <StatusPill status={app.status} />
                    </button>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="group relative flex justify-center">
                      <IconButton
                        onClick={() => handleOpenEditModal(app)}
                        tooltip="Edit"
                        aria-label={`Edit ${app.name}`}
                        hoverColor="blue"
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
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
                  const value = Number(e.target.value);
                  if (!Number.isNaN(value) && value > 0) {
                    setItemsPerPage(value);
                    setCurrentPage(1);
                  }
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
              Showing {totalItems === 0 ? 0 : `${startItem}-${endItem}`} of{" "}
              {totalItems}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                aria-label="Previous Page"
              >
                &lt;
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage >= totalPages}
                className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                aria-label="Next Page"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <AddApplicationModal
          onClose={handleCloseModal}
          onSave={handleSaveApplication}
          applicationToEdit={editingApplication}
        />
      )}
      {showSuccessModal && (
        <SuccessModal onClose={() => setShowSuccessModal(false)} />
      )}
      {isStatusConfirmationOpen && pendingStatusApplication && (
        <StatusConfirmationModal
          onClose={handleCloseStatusConfirm}
          onConfirm={handleConfirmStatusChange}
          currentStatus={pendingStatusApplication.status}
        />
      )}
    </div>
  );
};

export default ApplicationPage;
