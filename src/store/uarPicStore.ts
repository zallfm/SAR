import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import type { PicUser } from "../../data";
import { divisions, initialPicUsers } from "../../data";
import {
  createUarApi,
  deleteUarApi,
  editUarApi,
  getUarApi,
} from "../api/pic.api";
import {
  BackendCreateUarResponse,
  CreateUarPayload,
  EditUarPayload,
  UarPic,
} from "../types/pic";

export interface UarPicFilters {
  name: string;
  division: string;
}

export interface UarPicState {
  // Data
  pics: PicUser[];
  filteredPics: PicUser[];
  selectedPic: PicUser | null;

  // Filters
  filters: UarPicFilters;

  // Pagination
  currentPage: number;
  itemsPerPage: number;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  setPics: (pics: PicUser[]) => void;
  setFilteredPics: (pics: PicUser[]) => void;
  setSelectedPic: (pic: PicUser | null) => void;
  setFilters: (filters: Partial<UarPicFilters>) => void;
  resetFilters: () => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (size: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // CRUD Operations
  addPic: (pic: Omit<PicUser, "id">) => void;
  updatePic: (id: string, updates: Partial<PicUser>) => void;
  deletePic: (id: string) => void;
  getPics: () => Promise<void>;

  // Computed
  getTotalPages: () => number;
  getCurrentPagePics: () => PicUser[];
}

const initialFilters: UarPicFilters = {
  name: "",
  division: "",
};

export const useUarPicStore = create<UarPicState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        pics: [],
        filteredPics: [],
        selectedPic: null,
        filters: initialFilters,
        currentPage: 1,
        itemsPerPage: 10,
        isLoading: false,
        error: null,

        getPics: async () => {
          set({ isLoading: true, error: null });
          try {
            const data = await getUarApi();
            const pics: PicUser[] = data.data.map((item: UarPic) => ({
              ID: item.ID,
              PIC_NAME: item.PIC_NAME,
              DIVISION_ID: item.DIVISION_ID,
              MAIL: item.MAIL,
            }));
            set({ pics, filteredPics: pics, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        // Actions
        setPics: (pics) => set({ pics, filteredPics: pics }),

        setFilteredPics: (filteredPics) => set({ filteredPics }),

        setSelectedPic: (selectedPic) => set({ selectedPic }),

        setFilters: (newFilters) =>
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
            currentPage: 1, // Reset to first page when filters change
          })),

        resetFilters: () => set({ filters: initialFilters, currentPage: 1 }),

        setCurrentPage: (currentPage) => set({ currentPage }),

        setItemsPerPage: (itemsPerPage) =>
          set({ itemsPerPage, currentPage: 1 }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        // CRUD Operations
        addPic: async (newPic) => {
          const { pics } = get();
          const payload: CreateUarPayload = {
            PIC_NAME: newPic.PIC_NAME,
            DIVISION_ID: newPic.DIVISION_ID,
            MAIL: newPic.MAIL,
          };

          const data: BackendCreateUarResponse = await createUarApi(payload);
          const pic: PicUser = {
            ID: data.data.ID,
            PIC_NAME: data.data.PIC_NAME,
            DIVISION_ID: data.data.DIVISION_ID,
            MAIL: data.data.MAIL,
          };

          set((state) => ({
            pics: [pic, ...state.pics],
            filteredPics: [pic, ...state.filteredPics],
          }));
        },

        updatePic: async (id, updates) => {
          const payload: EditUarPayload = {
            PIC_NAME: updates.PIC_NAME,
            DIVISION_ID: updates.DIVISION_ID,
            MAIL: updates.MAIL,
          };

          const data = await editUarApi(id, payload);

          set((state) => ({
            pics: state.pics.map((pic) =>
              pic.ID === id ? { ...pic, ...data.data } : pic
            ),
            filteredPics: state.filteredPics.map((pic) =>
              pic.ID === id ? { ...pic, ...data.data } : pic
            ),
          }));
        },

        deletePic: async (id) => {
          await deleteUarApi(id);
          set((state) => ({
            pics: state.pics.filter((pic) => pic.ID !== id),
            filteredPics: state.filteredPics.filter((pic) => pic.ID !== id),
          }));
        },

        // Computed
        getTotalPages: () => {
          const { filteredPics, itemsPerPage } = get();
          return Math.ceil(filteredPics.length / itemsPerPage);
        },

        getCurrentPagePics: () => {
          const { filteredPics, currentPage, itemsPerPage } = get();
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          return filteredPics.slice(startIndex, endIndex);
        },
      }),
      {
        name: "uar-pic-store",
        // Only persist data, not UI state
        partialize: (state) => ({
          pics: state.pics,
          filters: state.filters,
          currentPage: state.currentPage,
          itemsPerPage: state.itemsPerPage,
        }),
      }
    ),
    {
      name: "UarPicStore",
    }
  )
);
