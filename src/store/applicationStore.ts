import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { editApplicationApi, getApplicationApi, postApplicationApi } from "../api/application.api";
import type { Application } from "../types/application";

interface ApplicationState {
  applications: Application[];
  filteredApplications: Application[];
  searchTerm: string;

  // UI STATE
  isLoading: boolean;
  error: string | null;

  currentPage: number;
  itemsPerPage: number;
  isModalOpen: boolean;
  editingApplication: Application | null;
  isStatusConfirmationOpen: boolean;
  pendingStatusApplication: Application | null;

  // Actions
  getApplications: () => Promise<void>;
  createApplication: (payload: Omit<Application, "CREATED_BY" | "CREATED_DT" | "CHANGED_BY" | "CHANGED_DT">) => Promise<Application>;
  editApplication: (id: string, payload: Partial<Application>) => Promise<Application>;


  setApplications: (apps: Application[]) => void;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (size: number) => void;
  addApplication: (app: Application) => void;
  updateApplication: (app: Application) => void;
  setBulkApplications: (apps: Application[]) => void;
  openAddModal: () => void;
  openEditModal: (app: Application) => void;
  closeModal: () => void;
  openStatusConfirmation: (app: Application) => void;
  closeStatusConfirmation: () => void;
}

export const useApplicationStore = create<ApplicationState>()(
  devtools(
    persist(
      (set, get) => ({
        applications: [],
        filteredApplications: [],
        searchTerm: "",
        currentPage: 1,
        itemsPerPage: 10,

        isLoading: false,
        error: null,

        // 🧩 UI and state management
        isModalOpen: false,
        editingApplication: null,
        isStatusConfirmationOpen: false,
        pendingStatusApplication: null,

        setApplications: (apps) => set({ applications: apps }),
        setSearchTerm: (term) => set({ searchTerm: term, currentPage: 1 }),
        setCurrentPage: (page) => set({ currentPage: page }),
        setItemsPerPage: (size) =>
          set({ itemsPerPage: size, currentPage: 1 }),

        // ✅ GET applications from backend
        getApplications: async () => {
          set({ isLoading: true, error: null });
          try {
            const res = await getApplicationApi();
            const apps = res.data.map((item) => ({
              APPLICATION_ID: item.APPLICATION_ID,
              APPLICATION_NAME: item.APPLICATION_NAME,
              DIVISION_ID_OWNER: item.DIVISION_ID_OWNER,
              NOREG_SYSTEM_OWNER: item.NOREG_SYSTEM_OWNER,
              NOREG_SYSTEM_CUST: item.NOREG_SYSTEM_CUST,
              SECURITY_CENTER: item.SECURITY_CENTER,
              APPLICATION_STATUS: item.APPLICATION_STATUS,
              CREATED_BY: item.CREATED_BY,
              CREATED_DT: item.CREATED_DT,
              CHANGED_BY: item.CHANGED_BY,
              CHANGED_DT: item.CHANGED_DT,
            }));
            set({
              applications: apps,
              filteredApplications: apps,
              isLoading: false,
            });
          } catch (err) {
            set({ error: (err as Error).message, isLoading: false });
          }
        },

        createApplication: async (payload: any) => {
          const res = await postApplicationApi(payload)
          const created = res.data;
          set((s) => ({ applications: [created, ...s.applications] }))
          return created
        },

        editApplication: async (id: string, payload: Partial<Application>) => {
          const res = await editApplicationApi(id, payload);
          const updatedFromApi = res.data;
          const merged = updatedFromApi ?? {
            ...(get().applications.find(a => a.APPLICATION_ID === id) as Application),
            ...payload,
            CHANGED_DT: new Date().toISOString(),
          };

          set((s) => ({
            applications: s.applications.map((a) =>
              a.APPLICATION_ID === id ? merged : a
            ),
            filteredApplications: s.filteredApplications.map((a) =>
              a.APPLICATION_ID === id ? merged : a
            ),
            isModalOpen: false,
            editingApplication: null,
          }));

          return merged;
        },

        addApplication: (app) =>
          set((state) => ({
            applications: [app, ...state.applications],
            isModalOpen: false,
          })),

        updateApplication: (updatedApp) =>
          set((state) => ({
            applications: state.applications.map((app) =>
              app.APPLICATION_ID === updatedApp.APPLICATION_ID
                ? updatedApp
                : app
            ),
            isModalOpen: false,
            editingApplication: null,
          })),

        setBulkApplications: (apps) => set({ applications: apps }),
        openAddModal: () => set({ isModalOpen: true, editingApplication: null }),
        openEditModal: (app) =>
          set({ isModalOpen: true, editingApplication: app }),
        closeModal: () => set({ isModalOpen: false, editingApplication: null }),
        openStatusConfirmation: (app) =>
          set({
            isStatusConfirmationOpen: true,
            pendingStatusApplication: app,
          }),
        closeStatusConfirmation: () =>
          set({
            isStatusConfirmationOpen: false,
            pendingStatusApplication: null,
          }),
      }),
      {
        name: "application-store",
        partialize: (state) => ({
          applications: state.applications,
          searchTerm: state.searchTerm,
          currentPage: state.currentPage,
          itemsPerPage: state.itemsPerPage,
        }),
      }
    ),
    { name: "ApplicationStore" }
  )
);
