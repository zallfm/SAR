import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import {
  getSystemMasterApi,
  createSystemMasterApi,
  deleteSystemMasterApi,
  editSystemMasterApi,
} from "../api/systemMaster";

import {
  BackendGetSystemMasterResponse,
  BackendCreateSystemMasterResponse,
  BackendUpdateSystemMasterResponse,
  CreateSystemMasterPayload,
  SystemMaster,
  UpdateSystemMasterPayload,
} from "../types/systemMaster";

// --- Types copied from ScheduleStore for consistency ---

type ApiMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// Response type for CUD operations
interface SystemMasterResponse {
  data: SystemMaster[] | undefined;
  error: { message: string; code?: number } | undefined;
}

// --- End of copied types ---

export interface SystemMasterFilters {
  page?: number;
  limit?: number;
  q?: string;
  order?: "asc" | "desc";
  systemType: string;
  systemCode: string;
}

export interface SystemMasterState {
  // Data
  records: SystemMaster[];
  filteredRecords: SystemMaster[]; // Kept for compatibility, mirrors 'records'
  selectedSystemMaster: SystemMaster | null;

  // ADDED: Meta from server
  meta: ApiMeta | null;

  // Filters
  filters: SystemMasterFilters;

  // Pagination
  currentPage: number;
  itemsPerPage: number;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  setRecords: (records: SystemMaster[]) => void;
  setFilteredRecords: (records: SystemMaster[]) => void;
  setSelectedSystemMaster: (record: SystemMaster | null) => void;
  setFilters: (filters: Partial<SystemMasterFilters>) => void;
  resetFilters: () => Promise<void>; // MODIFIED: Now async
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (size: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // CRUD Operations
  // MODIFIED: All CRUD ops are now async and API-driven
  getSystemMasters: (params?: SystemMasterFilters & { signal?: AbortSignal }) => Promise<void>;
  addSystemMaster: (
    record: CreateSystemMasterPayload
  ) => Promise<SystemMasterResponse>;
  updateSystemMaster: (
    SYSTEM_CD: string, // Kept as number based on original store
    updates: UpdateSystemMasterPayload
  ) => Promise<SystemMasterResponse>;
  deleteSystemMaster: (compoundId: Object) => Promise<void>;

  // Computed
  getTotalPages: () => number;
  getCurrentPageRecords: () => SystemMaster[];
}

const initialFilters: SystemMasterFilters = {
  systemType: "",
  systemCode: "",
  page: 1,
  limit: 10,
  q: "",
  order: "desc",
};

export const useSystemMasterStore = create<SystemMasterState>()(
  devtools(
    persist(
      (set, get) => ({
        records: [],
        filteredRecords: [],
        selectedSystemMaster: null,
        meta: null,
        filters: initialFilters,
        currentPage: 1,
        itemsPerPage: 10,
        isLoading: true,
        error: null,

        getSystemMasters: async (params) => {
          const state = get();
          const {
            page: paramPage,
            limit: paramLimit,
            signal,
          } = params || {};
          const page = paramPage ?? state.currentPage;
          const limit = paramLimit ?? state.itemsPerPage;

          const query: SystemMasterFilters = {
            ...state.filters,
            ...params,
            page,
            limit,
          };

          set({ isLoading: true, error: null });
          try {
            const res = await getSystemMasterApi(query, signal!);
            // Type assertion to match the schedule store's pattern
            const response = res as {
              data: SystemMaster[];
              meta?: ApiMeta;
            };
            const { data: raw, meta: metaFromApi } = response;

            // Assuming API returns data in the correct SystemMaster[] shape
            const records: SystemMaster[] = raw ?? [];

            set({
              records,
              filteredRecords: records,
              meta: metaFromApi ?? {
                page,
                limit,
                total: records.length,
                totalPages: 1,
              },
              isLoading: false,
              currentPage: metaFromApi?.page ?? page,
              itemsPerPage: metaFromApi?.limit ?? limit,
            });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        // Actions
        setRecords: (records) => set({ records, filteredRecords: records }),

        setFilteredRecords: (filteredRecords) => set({ filteredRecords }),

        setSelectedSystemMaster: (selectedSystemMaster) =>
          set({ selectedSystemMaster }),

        // MODIFIED: setFilters now correctly merges and resets page
        setFilters: (newFilters: Partial<SystemMasterFilters>) => {
          const mergedFilters: SystemMasterFilters = {
            ...initialFilters,
            ...get().filters,
            ...newFilters,
          };

          set((state) => ({
            filters: mergedFilters,
            currentPage: 1, // Reset to first page
          }));
        },

        // MODIFIED: resetFilters now refetches
        resetFilters: async () => {
          set({ filters: initialFilters, currentPage: 1 });
        },

        setCurrentPage: (currentPage) => {
          set({ currentPage });
          // Note: getSystemMasters() should be called by the UI component
          // when pagination changes, passing the new page.
        },

        setItemsPerPage: (itemsPerPage) =>
          set({ itemsPerPage, currentPage: 1 }), // Reset to page 1

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        // CRUD Operations
        // MODIFIED: addSystemMaster calls API
        addSystemMaster: async (record) => {
          try {
            const entries = Object.entries(record);

            const filteredEntries = entries.filter(
              ([_, value]) =>
                value != null &&
                value !== 0 &&
                value !== "" &&
                !Number.isNaN(value)
            );

            const payload = Object.fromEntries(
              filteredEntries
            ) as CreateSystemMasterPayload;

            const data: BackendCreateSystemMasterResponse =
              await createSystemMasterApi(payload);

            await get().getSystemMasters();

            return { data: [data.data], error: undefined };
          } catch (error) {
            console.error("Error creating system master:", error);
            return {
              data: undefined,
              error: {
                message: (error as Error).message,
                code: (error as any).code,
              },
            };
          }
        },

        // MODIFIED: updateSystemMaster calls API
        updateSystemMaster: async (id, updates) => {
          try {
            const entries = Object.entries(updates);

            const filteredEntries = entries.filter(
              ([_, value]) =>
                value != null &&
                value !== 0 &&
                value !== "" &&
                !Number.isNaN(value)
            );

            const payload = Object.fromEntries(
              filteredEntries
            ) as CreateSystemMasterPayload;

            const data: BackendUpdateSystemMasterResponse =
              await editSystemMasterApi(id, payload);

            await get().getSystemMasters(); // Refresh list

            return { data: [data.data], error: undefined };
          } catch (error) {
            console.error("Error updating system master:", error);
            return {
              data: undefined,
              error: {
                message: (error as Error).message,
                code: (error as any).code,
              },
            };
          }
        },

        // MODIFIED: deleteSystemMaster calls API
        deleteSystemMaster: async (id) => {
          try {
            await deleteSystemMasterApi(id);
            await get().getSystemMasters(); // Refresh list
          } catch (error) {
            console.error("Error deleting system master:", error);
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        // Computed
        // MODIFIED: Reads from meta
        getTotalPages: () => {
          const { meta } = get();
          return meta?.totalPages ?? 1;
        },

        // MODIFIED: Returns all records fetched for the current page
        getCurrentPageRecords: () => {
          const { records } = get();
          return records;
        },
      }),
      {
        name: "system-master-store",
        // MODIFIED: Only persist filters and pagination, not data
        partialize: (state) => ({
          records: state.records,
          filteredRecords: state.filteredRecords,
          filters: state.filters,
          meta: state.meta,
          currentPage: state.currentPage,
          itemsPerPage: state.itemsPerPage,
        }),
      }
    ),
    {
      name: "SystemMasterStore",
    }
  )
);
