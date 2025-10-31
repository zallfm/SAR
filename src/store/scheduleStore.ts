import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";

import {
  getScheduleApi,
  createScheduleApi,
  editScheduleApi,
  deleteScheduleApi,
  updateStatusScheduleApi,
} from "../api/schedule.api";

import {
  BackendCreateScheduleResponse,
  CreateSchedulePayload,
  BackendUpdateScheduleResponse,
  UpdateSchedulePayload,
  Schedule,
  BackendGetScheduleResponse,
  ScheduleData,
  UpdateScheduleStatusPayload,
} from "../types/schedule";
import { applications } from "@/data";

type ApiMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// --- Original Types ---

export interface ScheduleFilters {
  page?: number;
  limit?: number;
  q?: string;
  order?: "asc" | "desc";
  applicationId: string;
  applicationName: string;
  status: string;
}

// Added: Response type for CRUD operations
interface ScheduleResponse {
  data: Schedule[] | undefined;
  error: { message: string; code?: number } | undefined;
}

export interface ScheduleState {
  // Data
  schedules: Schedule[];
  filteredSchedules: Schedule[]; // Kept for compatibility, will mirror 'schedules'
  selectedSchedule: Schedule | null;

  // ADDED: Meta from server
  meta: ApiMeta | null;

  // Filters
  filters: ScheduleFilters;

  // Pagination
  currentPage: number;
  itemsPerPage: number;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  setSchedules: (schedules: Schedule[]) => void;
  setFilteredSchedules: (schedules: Schedule[]) => void;
  setSelectedSchedule: (schedule: Schedule | null) => void;
  setFilters: (filters: Partial<ScheduleFilters>) => void;
  resetFilters: () => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (size: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // CRUD Operations
  // MODIFIED: All CRUD ops are now async and API-driven
  getSchedules: (params?: ScheduleFilters & { signal: AbortSignal }) => Promise<void>;
  addSchedule: (
    schedule: Omit<ScheduleData, "ID">
  ) => Promise<ScheduleResponse>;
  updateSchedule: (
    id: {
      APPLICATION_ID: string;
      SCHEDULE_SYNC_START_DT: string;
      SCHEDULE_UAR_DT: string;
    },
    updates: Partial<Schedule>
  ) => Promise<ScheduleResponse>;
  deleteSchedule: (id: string) => Promise<void>;
  updateStatusSchedule: (
    compoundId: {
      APPLICATION_ID: string;
      SCHEDULE_SYNC_START_DT: string;
      SCHEDULE_UAR_DT: string;
    },
    status: string
  ) => Promise<ScheduleResponse>;
  // Computed
  getTotalPages: () => number;
  getCurrentPageSchedules: () => Schedule[];
}

const initialFilters: ScheduleFilters = {
  applicationId: "",
  applicationName: "",
  status: "",
};

export const useScheduleStore = create<ScheduleState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        schedules: [],
        filteredSchedules: [],
        selectedSchedule: null,
        meta: null, // ADDED
        filters: initialFilters,
        currentPage: 1,
        itemsPerPage: 10,
        isLoading: false,
        error: null,

        getSchedules: async (params) => {
          const state = get();
            const {
            page: paramPage,
            limit: paramLimit,
            signal,
            ...restParams
          } = params || {};
          const page = params?.page ?? state.currentPage;
          const limit = params?.limit ?? state.itemsPerPage;

          const query: ScheduleFilters = {
            ...state.filters,
            ...restParams,
            page,
            limit,
          };

          if (query.status !== "") {
            query.status = query.status === 'Active' ? '1' : '0';
          }

          set({ isLoading: true, error: null });
          try {
            const res = await getScheduleApi(query,signal);
            const response = res as {
              data: Schedule[];
              meta?: ApiMeta;
            };
            const { data: raw, meta: metaFromApi } = response;

            const schedules: Schedule[] = (raw ?? []).map((item: Schedule) => ({
              ID: item.ID,
              APPLICATION_ID: item.APPLICATION_ID,
              APPLICATION_NAME:
                item.APPLICATION_NAME,
              SCHEDULE_STATUS: item.SCHEDULE_STATUS,
              SCHEDULE_SYNC_START_DT: item.SCHEDULE_SYNC_START_DT,
              SCHEDULE_SYNC_END_DT: item.SCHEDULE_SYNC_END_DT,
              SCHEDULE_UAR_DT: item.SCHEDULE_UAR_DT,
              CREATED_BY: item.CREATED_BY,
              CREATED_DT: item.CREATED_DT,
              CHANGED_BY: item.CHANGED_BY,
              CHANGED_DT: item.CHANGED_DT,
            }));

            set({
              schedules,
              filteredSchedules: schedules,
              meta: metaFromApi ?? {
                page,
                limit,
                total: schedules.length,
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
        setSchedules: (schedules) =>
          set({ schedules, filteredSchedules: schedules }),

        setFilteredSchedules: (filteredSchedules) => set({ filteredSchedules }),

        setSelectedSchedule: (selectedSchedule) => set({ selectedSchedule }),

        setFilters: (newFilters: Partial<ScheduleFilters>) => {
          const mergedFilters: ScheduleFilters = {
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
          // Note: You might want to call getSchedules() here if pagination is
          // *only* controlled by this, but getSchedules() already takes
          // currentPage from state, so it's usually called by the UI component.
        },

        setItemsPerPage: (itemsPerPage) =>
          set({ itemsPerPage, currentPage: 1 }), // Reset to page 1

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        // CRUD Operations
        // MODIFIED: addSchedule calls API
        addSchedule: async (newSchedule) => {
          try {
            const payload: CreateSchedulePayload = {
              APPLICATION_ID: newSchedule.APPLICATION_ID,
              SCHEDULE_SYNC_START_DT: newSchedule.SCHEDULE_SYNC_START_DT,
              SCHEDULE_SYNC_END_DT: newSchedule.SCHEDULE_SYNC_END_DT,
              SCHEDULE_UAR_DT: newSchedule.SCHEDULE_UAR_DT,
              SCHEDULE_STATUS: "1",
            };

            const data: BackendCreateScheduleResponse = await createScheduleApi(
              payload
            );

            const schedule: Schedule = {
              ID: data.data.ID,
              APPLICATION_ID: data.data.APPLICATION_ID,
              APPLICATION_NAME: data.data.APPLICATION_NAME,
              SCHEDULE_SYNC_START_DT: data.data.SCHEDULE_SYNC_START_DT,
              SCHEDULE_SYNC_END_DT: data.data.SCHEDULE_SYNC_END_DT,
              SCHEDULE_UAR_DT: data.data.SCHEDULE_UAR_DT,
              SCHEDULE_STATUS: data.data.SCHEDULE_STATUS,
              CREATED_BY: data.data.CREATED_BY,
              CREATED_DT: data.data.CREATED_DT,
              CHANGED_BY: data.data.CHANGED_BY,
              CHANGED_DT: data.data.CHANGED_DT,
            };

            await get().getSchedules();

            return { data: [schedule], error: undefined };
          } catch (error) {
            console.error("Error creating schedule:", error);
            return {
              data: undefined,
              error: {
                message: (error as Error).message,
                code: (error as any).code,
              },
            };
          }
        },

        updateSchedule: async (id, updates) => {
          try {
            const payload: UpdateSchedulePayload = {
              APPLICATION_ID: updates.APPLICATION_ID,
              SCHEDULE_SYNC_START_DT: updates.SCHEDULE_SYNC_START_DT,
              SCHEDULE_SYNC_END_DT: updates.SCHEDULE_SYNC_END_DT,
              SCHEDULE_UAR_DT: updates.SCHEDULE_UAR_DT,
              SCHEDULE_STATUS: updates.SCHEDULE_STATUS,
            };

            const data: BackendCreateScheduleResponse = await editScheduleApi(
              id,
              payload
            );

            await get().getSchedules();

            return { data: [data.data], error: undefined };
          } catch (error) {
            console.error("Error updating schedule:", error);
            return {
              data: undefined,
              error: {
                message: (error as Error).message,
                code: (error as any).code,
              },
            };
          }
        },

        updateStatusSchedule: async (id, status) => {
          try {
            const payload: UpdateScheduleStatusPayload = {
              SCHEDULE_STATUS: status,
            };

            const data: BackendCreateScheduleResponse =
              await updateStatusScheduleApi(id, payload);

            await get().getSchedules();

            return { data: [data.data], error: undefined };
          } catch (error) {
            console.error("Error updating schedule:", error);
            return {
              data: undefined,
              error: {
                message: (error as Error).message,
                code: (error as any).code,
              },
            };
          }
        },

        // MODIFIED: deleteSchedule calls API
        deleteSchedule: async (id) => {
          try {
            await deleteScheduleApi(id);
            await get().getSchedules();
          } catch (error) {
            console.error("Error deleting schedule:", error);
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        getTotalPages: () => {
          const { meta } = get();
          return meta?.totalPages ?? 1;
        },

        getCurrentPageSchedules: () => {
          const { schedules } = get();
          return schedules;
        },
      }),
      {
        name: "schedule-store",
        // Only persist filters and pagination settings
        partialize: (state) => ({
          schedules: state.schedules,
          filteredSchedules: state.filteredSchedules,
          meta: state.meta,
          filters: state.filters,
          currentPage: state.currentPage,
          itemsPerPage: state.itemsPerPage,
        }),
      }
    ),
    {
      name: "ScheduleStore",
    }
  )
);
