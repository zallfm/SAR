import React, { useState, useMemo } from "react";
import { SearchIcon } from "../../icons/SearchIcon";
import { ChevronDownIcon } from "../../icons/ChevronDownIcon";
import { EditIcon } from "../../icons/EditIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { divisions } from "../../../../data";
import type { PicUser } from "../../../../data";
import UarPicModal from "../../common/Modal/UarPicModal";
import ConfirmationModal from "../../common/Modal/ConfirmationModal";
import InfoModal from "../../common/Modal/InfoModal";
import { AddButton } from "../../common/Button/AddButton";
import { IconButton } from "../../common/Button/IconButton";
import SearchableDropdown from "../../common/SearchableDropdown";
import {
  usePics,
  useFilteredPics,
  useUarPicFilters,
  useUarPicPagination,
  useUarPicActions,
} from "../../../hooks/useStoreSelectors";
import { useUarPicStore } from "@/src/store/uarPicStore";
import { error } from "console";
import { postLogMonitoringApi } from "@/src/api/log_monitoring";
import { AuditAction } from "@/src/constants/auditActions";
import { useAuthStore } from "@/src/store/authStore";

const UarPicPage: React.FC = () => {
  // Zustand store hooks
  const pics = usePics();
  const storeFilteredPics = useFilteredPics();
  const { filters, setFilters } = useUarPicFilters();
  const {
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    getTotalPages,
    getCurrentPagePics,
  } = useUarPicPagination();
  const {
    setPics,
    setFilteredPics,
    setSelectedPic,
    addPic,
    updatePic,
    deletePic,
  } = useUarPicActions();

  const { currentUser } = useAuthStore();

  const getPics = useUarPicStore((state) => state.getPics);
  // Local state for UI interactions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPic, setEditingPic] = useState<PicUser | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [picToDelete, setPicToDelete] = useState<PicUser | null>(null);
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
  const [picToEdit, setPicToEdit] = useState<PicUser | null>(null);

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  const filteredPics = useMemo(() => {
    return pics.filter((pic) => {
      const nameMatch = pic.PIC_NAME.toLowerCase().includes(
        filters.name.toLowerCase()
      );
      const divisionMatch = filters.division
        ? divisions[pic.DIVISION_ID - 1] === filters.division
        : true;
      return nameMatch && divisionMatch;
    });
  }, [pics, filters]);

  React.useEffect(() => {
    const haveSameLength = storeFilteredPics.length === filteredPics.length;
    const haveSameIds =
      haveSameLength &&
      storeFilteredPics.every(
        (pic, index) => pic.ID === filteredPics[index]?.ID
      );

    if (!haveSameIds) {
      setFilteredPics(filteredPics);
    }
  }, [filteredPics, setFilteredPics, storeFilteredPics]);

  React.useEffect(() => {
    getPics();
  }, [getPics]);

  const totalPages = getTotalPages();
  const currentPics = getCurrentPagePics();
  const startItem =
    currentPics.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, filteredPics.length);

  const handleOpenAddModal = () => {
    setEditingPic(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pic: PicUser) => {
    setEditingPic(pic);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPic(null);
  };

  const handleSavePic = async (pic: PicUser) => {
    handleCloseModal();
    if (editingPic) {
      // If editing, open confirmation modal
      setPicToEdit(pic);
      setIsEditConfirmOpen(true);

      // await postLogMonitoringApi({
      //   userId: currentUser?.username ?? "anonymous",
      //   module: "Uar Pic",
      //   action: AuditAction.DATA_UPDATE,
      //   status: "Success",
      //   description: `User update UAR PIC ${pic.PIC_NAME}`,
      //   location: "UarPicPage.UpdateForm",
      //   timestamp: new Date().toISOString(),
      // });
    } else {
      // If adding, save directly
      const status = await addPic(pic);
      if (status.error === undefined) {
        setInfoMessage("Save Successfully");
        await postLogMonitoringApi({
          userId: currentUser?.username ?? "anonymous",
          module: "Uar Pic",
          action: AuditAction.DATA_UPDATE,
          status: "Success",
          description: `User update UAR PIC ${pic.PIC_NAME}`,
          location: "UarPicPage.UpdateForm",
          timestamp: new Date().toISOString(),
        });
      } else {
        setInfoMessage(
          `Error: ${status.error.message} Code: ${status.error.code ?? ""}`
        );
        await postLogMonitoringApi({
          userId: currentUser?.username ?? "anonymous",
          module: "Uar Pic",
          action: AuditAction.DATA_UPDATE,
          status: "Failed",
          description: `User Failed update UAR PIC ${pic.PIC_NAME}`,
          location: "UarPicPage.UpdateForm",
          timestamp: new Date().toISOString(),
        });
      }
      setIsInfoOpen(true);
    }
  };

  const handleConfirmEdit = async () => {
    if (picToEdit) {
      // const status = await updatePic(picToEdit.ID, picToEdit);
      const target = { id: picToEdit.ID, name: picToEdit.PIC_NAME };
      const status = await updatePic(target.id, picToEdit);
      if (status.error === undefined) {
        setInfoMessage("Save Successfully");
        setIsInfoOpen(true);
      } else {
        setInfoMessage(
          `Error: ${status.error.message} Code: ${status.error.code ?? ""}`
        );
        setIsInfoOpen(true);
        await postLogMonitoringApi({
          userId: currentUser?.username ?? "anonymous",
          module: "UAR.PIC",
          action: AuditAction.DATA_UPDATE,
          status: "Error",
          description: `Update PIC failed for ${target.name} (ID=${target.id}): ${status.error.message}`,
          location: "UarPicPage.handleConfirmEdit",
          timestamp: new Date().toISOString(),
        });

      }
    }
    setIsEditConfirmOpen(false);
    setPicToEdit(null);
  };

  const handleOpenDeleteConfirm = (pic: PicUser) => {
    setPicToDelete(pic);
    setIsDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setPicToDelete(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleDeletePic = async () => {
    if (!picToDelete) return;

    const username = currentUser?.username ?? "anonymous";
    const target = { id: picToDelete.ID, name: picToDelete.PIC_NAME };

    try {
      // Hapus data
      await deletePic(target.id);

      // Tutup dialog konfirmasi hanya jika delete sukses
      handleCloseDeleteConfirm();

      // Log sukses
      await postLogMonitoringApi({
        userId: username,
        module: "UAR.PIC",
        action: AuditAction.DATA_DELETE,
        status: "Success",
        description: `User ${username} deleted PIC ${target.name} (ID=${target.id})`,
        location: "UarPicPage.handleDeletePic",
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.warn("Failed to delete:", err);

      // Log error
      await postLogMonitoringApi({
        userId: username,
        module: "UAR.PIC",
        action: AuditAction.DATA_DELETE,
        status: "Error",
        description: `Delete PIC failed for ${target.name} (ID=${target.id}): ${err?.message ?? "Unknown error"}`,
        location: "UarPicPage.handleDeletePic",
        timestamp: new Date().toISOString(),
      }).catch(() => { });
    }
  };

  const handleFilterChange = async (
    key: keyof typeof filters,
    value: string
  ) => {
    setFilters({ [key]: value });

    const username = currentUser?.username ?? "anonymous";

    if (value.trim() !== "") {
      try {
        await postLogMonitoringApi({
          userId: username,
          module: "UAR PIC",
          action: AuditAction.DATA_FILTER,
          status: "Success",
          description: `User ${username} filtered UAR PIC by ${key}: ${value}`,
          location: "UarPicPage.handleFilterChange",
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Failed to log filter action:", err);
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">UAR PIC</h2>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <SearchableDropdown
              label="Name"
              value={filters.name}
              onChange={(value) => handleFilterChange('name', value)}
              options={[...new Set(pics.map((pic) => pic.PIC_NAME))]}
              placeholder="Name"
              className="w-full sm:w-40"
            />
            <SearchableDropdown
              label="Division"
              value={filters.division}
              onChange={(value) => handleFilterChange('division', value)}
              options={[...new Set(divisions)].sort()}
              searchable={false}
              placeholder="Division"
              className="w-full sm:w-40"
            />
          </div>
          <AddButton onClick={handleOpenAddModal} label="+ Add" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm text-left text-gray-600">
            <thead className="text-sm font-semibold text-gray-700 border-b-2 border-gray-200">
              <tr>
                <th scope="col" className="px-4 py-3 text-sm">
                  No
                </th>
                <th scope="col" className="px-4 py-3 text-sm">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 text-sm">
                  Division
                </th>
                <th scope="col" className="px-4 py-3 text-sm">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 text-sm">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {currentPics.length > 0 ? (
                currentPics.map((pic, index) => (
                  <tr
                    key={pic.ID}
                    className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-gray-900 text-sm">
                      {startItem + index}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {pic.PIC_NAME}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {divisions[pic.DIVISION_ID - 1]}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {pic.MAIL}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center justify-start gap-4">
                        <div className="group relative">
                          <IconButton
                            onClick={() => handleOpenEditModal(pic)}
                            tooltip="Edit"
                            aria-label={`Edit ${pic.PIC_NAME}`}
                            hoverColor="blue"
                          >
                            <EditIcon />
                          </IconButton>
                        </div>
                        <div className="group relative">
                          <IconButton
                            onClick={() => handleOpenDeleteConfirm(pic)}
                            tooltip="Delete"
                            aria-label={`Delete ${pic.PIC_NAME}`}
                            hoverColor="red"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-gray-500 text-sm"
                  >
                    No PICs found.
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
              Showing {startItem}-{endItem} of {filteredPics.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border bg-white border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous Page"
              >
                &lt;
              </button>
              <button
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

      {isModalOpen && (
        <UarPicModal
          onClose={handleCloseModal}
          onSave={handleSavePic}
          picToEdit={editingPic}
        />
      )}

      {isDeleteConfirmOpen && (
        <ConfirmationModal
          onClose={handleCloseDeleteConfirm}
          onConfirm={handleDeletePic}
          title="Delete User Confirmation"
          message="Do you want to Delete user PIC?"
        />
      )}
      {isEditConfirmOpen && (
        <ConfirmationModal
          onClose={() => setIsEditConfirmOpen(false)}
          onConfirm={handleConfirmEdit}
          title="Edit User Confirmation"
          message="Do you want to submit?"
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

export default UarPicPage;
