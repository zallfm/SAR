import React, { useState, useMemo } from "react";
import type { SystemMasterRecord } from "../../../../data";
import type { User } from "../../../../types";
import { SearchIcon } from "../../icons/SearchIcon";
import { ChevronDownIcon } from "../../icons/ChevronDownIcon";
import { EditIcon } from "../../icons/EditIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";
import SystemMasterModal from "../../common/Modal/SystemMasterModal";
import ConfirmationModal from "../../common/Modal/ConfirmationModal";
import InfoModal from "../../common/Modal/InfoModal";
import { AddButton } from "../../common/Button/AddButton";
import { IconButton } from "../../common/Button/IconButton";
import SearchableDropdown from "../../common/SearchableDropdown";
import { 
  useSystemMasterRecords, 
  useFilteredSystemMasterRecords,
  useSystemMasterFilters, 
  useSystemMasterPagination, 
  useSystemMasterActions 
} from "../../../hooks/useStoreSelectors";

interface SystemMasterPageProps {
  user: User;
}

const SystemMasterPage: React.FC<SystemMasterPageProps> = ({ user }) => {
  // Zustand store hooks
  const records = useSystemMasterRecords();
  const storeFilteredRecords = useFilteredSystemMasterRecords();
  const { filters, setFilters } = useSystemMasterFilters();
  const { currentPage, itemsPerPage, setCurrentPage, setItemsPerPage, getTotalPages, getCurrentPageRecords } = useSystemMasterPagination();
  const { setSystemMasterRecords, setFilteredRecords, setSelectedRecord, addSystemMasterRecord, updateSystemMasterRecord, deleteSystemMasterRecord } = useSystemMasterActions();
  
  // Local state for UI interactions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SystemMasterRecord | null>(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] =
    useState<SystemMasterRecord | null>(null);

  const [infoMessage, setInfoMessage] = useState("");
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const systemTypes = useMemo(
    () => [...new Set(records.map((r) => r.systemType))],
    [records]
  );

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const typeMatch = filters.systemType
        ? record.systemType === filters.systemType
        : true;
      const codeMatch = filters.systemCode
        ? record.systemCode
            .toLowerCase()
            .includes(filters.systemCode.toLowerCase())
        : true;
      return typeMatch && codeMatch;
    });
  }, [records, filters]);

  // Update filtered records in store when filters change
  React.useEffect(() => {
    const haveSameLength = storeFilteredRecords.length === filteredRecords.length
    const haveSameIds = haveSameLength && storeFilteredRecords.every((record, index) => record.id === filteredRecords[index]?.id)

    if (!haveSameIds) {
      setFilteredRecords(filteredRecords)
    }
  }, [filteredRecords, storeFilteredRecords, setFilteredRecords])

  const totalPages = getTotalPages();
  const currentRecords = getCurrentPageRecords();
  const startItem = currentRecords.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, filteredRecords.length);

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: SystemMasterRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleSaveRecord = (record: SystemMasterRecord) => {
    if (editingRecord) {
      updateSystemMasterRecord(record.id, record);
    } else {
      addSystemMasterRecord(record);
    }
    handleCloseModal();
    setInfoMessage("Save Successfully");
    setIsInfoOpen(true);
  };

  const handleOpenDeleteConfirm = (record: SystemMasterRecord) => {
    setRecordToDelete(record);
    setIsDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setRecordToDelete(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleDeleteRecord = () => {
    if (recordToDelete) {
      deleteSystemMasterRecord(recordToDelete.id);
      handleCloseDeleteConfirm();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Master</h2>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <SearchableDropdown 
              label="System Type" 
              value={filters.systemType} 
              onChange={(value) => setFilters({ systemType: value })} 
              options={systemTypes}
              placeholder="System Type"
              className="w-full sm:w-40"
            />
            <SearchableDropdown 
              label="System Code" 
              value={filters.systemCode} 
              onChange={(value) => setFilters({ systemCode: value })} 
              options={[...new Set(records.map(r => r.systemCode))]}
              placeholder="System Code"
              className="w-full sm:w-40"
            />
          </div>
          <AddButton onClick={handleOpenAddModal} label="+ Add" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-sm text-left text-gray-600">
            <thead className="text-sm font-bold text-gray-700 bg-gray-50">
              <tr>
                {[
                  "System Type",
                  "System Code",
                  "Valid From",
                  "Valid To",
                  "System Value Text",
                  "System Value Num",
                  "System Value Time",
                  "Created By",
                  "Created Date",
                  "Changed By",
                  "Changed Date",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-3 border-b text-sm"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((record) => (
                <tr
                  key={record.id}
                  className="bg-white border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {record.systemType}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {record.systemCode}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {record.validFrom}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {record.validTo}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {record.systemValueText}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {record.systemValueNum}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {record.systemValueTime}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {record.createdBy}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {record.createdDate.replace("\\n", " ")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {record.changedBy}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {record.changedDate.replace("\\n", " ")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-4">
                      <div className="group relative">
                        {/* <button onClick={() => handleOpenEditModal(record)} className="text-gray-500 hover:text-blue-600 text-sm" aria-label={`Edit ${record.systemCode}`}><EditIcon /></button>
                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-blue-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    Edit
                                                </div> */}
                        <IconButton
                          onClick={() => handleOpenEditModal(record)}
                          tooltip="Edit"
                          aria-label={`Edit ${record.systemCode}`}
                          hoverColor="blue"
                        >
                          <EditIcon />
                        </IconButton>
                      </div>
                      <div className="group relative">
                        {/* <button
                          onClick={() => handleOpenDeleteConfirm(record)}
                          className="text-gray-500 hover:text-red-600 text-sm"
                          aria-label={`Delete ${record.systemCode}`}
                        >
                          <DeleteIcon />
                        </button>
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-blue-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          Delete
                        </div> */}
                        <IconButton
                          onClick={() => handleOpenDeleteConfirm(record)}
                          tooltip="Delete"
                          aria-label={`Delete ${record.systemCode}`}
                          hoverColor="red"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </div>
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
              Showing {startItem}-{endItem} of {filteredRecords.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border bg-white border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lt;
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 border bg-white border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <SystemMasterModal
          onClose={handleCloseModal}
          onSave={handleSaveRecord}
          recordToEdit={editingRecord}
          user={user}
        />
      )}
      {isDeleteConfirmOpen && (
        <ConfirmationModal
          onClose={handleCloseDeleteConfirm}
          onConfirm={handleDeleteRecord}
          title="Delete Confirmation"
          message="Do you want to Submit?"
        />
      )}
      {isInfoOpen && (
        <InfoModal
          onClose={() => setIsInfoOpen(false)}
          title="Information"
          message={infoMessage}
        />
      )}
    </div>
  );
};

export default SystemMasterPage;
