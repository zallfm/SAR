// Custom selector hooks for Zustand stores to optimize performance
// Using useCallback and useMemo for better memoization

import { useCallback, useMemo } from "react";
import { useAuthStore } from "../store/authStore";
import { useApplicationStore } from "../store/applicationStore";
import { useUIStore } from "../store/uiStore";
import { useUarStore } from "../store/uarStore";
import { useLoggingStore } from "../store/loggingStore";
import { useScheduleStore } from "../store/scheduleStore";
import { useUarPicStore } from "../store/uarPicStore";
import { useSystemMasterStore } from "../store/systemMasterStore";
import { useUarProgressStore } from "../store/uarProgressStore";
import type { User } from "../../types";
import type {
  Application,
  LogEntry,
  UarSystemOwnerRecord,
  UarDivisionUserRecord,
} from "../../data";
import type { Schedule } from "../../data";
import type { PicUser, SystemMasterRecord } from "../../data";
import type {
  UarProgressResponse,
  UarProgressFilters,
  UarProgressData,
} from "../services/uarProgressService";
import { ScheduleData } from "../types/schedule";
import { SystemMaster } from "../types/systemMaster";

// Auth Store Selectors
export const useAuthUser = (): User | null =>
  useAuthStore((state) => state.currentUser);
export const useAuthActions = () => {
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  return useMemo(
    () => ({
      login,
      logout,
    }),
    [login, logout]
  );
};

// Application Store Selectors
export const useApplications = (): Application[] =>
  useApplicationStore((state) => state.applications);
export const useApplicationSearch = () =>
  useApplicationStore((state) => ({
    searchTerm: state.searchTerm,
    setSearchTerm: state.setSearchTerm,
  }));
export const useApplicationPagination = () =>
  useApplicationStore((state) => ({
    currentPage: state.currentPage,
    itemsPerPage: state.itemsPerPage,
    setCurrentPage: state.setCurrentPage,
    setItemsPerPage: state.setItemsPerPage,
  }));
export const useApplicationModals = () =>
  useApplicationStore((state) => ({
    isModalOpen: state.isModalOpen,
    editingApplication: state.editingApplication,
    isStatusConfirmationOpen: state.isStatusConfirmationOpen,
    pendingStatusApplication: state.pendingStatusApplication,
    openAddModal: state.openAddModal,
    openEditModal: state.openEditModal,
    closeModal: state.closeModal,
    openStatusConfirmation: state.openStatusConfirmation,
    closeStatusConfirmation: state.closeStatusConfirmation,
  }));
export const useApplicationActions = () =>
  useApplicationStore((state) => ({
    addApplication: state.addApplication,
    updateApplication: state.updateApplication,
    setBulkApplications: state.setBulkApplications,
  }));

// UI Store Selectors
export const useActiveView = () =>
  useUIStore((state) => ({
    activeView: state.activeView,
    setActiveView: state.setActiveView,
  }));
export const useSidebar = () =>
  useUIStore((state) => ({
    sidebarOpen: state.sidebarOpen,
    toggleSidebar: state.toggleSidebar,
  }));
export const useModals = () =>
  useUIStore((state) => ({
    modals: state.modals,
    openModal: state.openModal,
    closeModal: state.closeModal,
    resetModals: state.resetModals,
  }));

// UAR Store Selectors
export const useUarSystemOwners = (): UarSystemOwnerRecord[] =>
  useUarStore((state) => state.systemOwnerRecords);
export const useUarDivisionUsers = (): UarDivisionUserRecord[] =>
  useUarStore((state) => state.divisionUserRecords);
export const useUarSelections = () =>
  useUarStore((state) => ({
    selectedSystemOwner: state.selectedSystemOwner,
    selectedDivisionUser: state.selectedDivisionUser,
    selectedLog: state.selectedLog,
    selectSystemOwner: state.selectSystemOwner,
    selectDivisionUser: state.selectDivisionUser,
    setSelectedLog: state.setSelectedLog,
    resetSelections: state.resetSelections,
  }));

// Logging Store Selectors
export const useLogs = (): LogEntry[] => useLoggingStore((state) => state.logs);
export const useFilteredLogs = (): LogEntry[] =>
  useLoggingStore((state) => state.filteredLogs);

export const useLoggingFilters = () => {
  const filters = useLoggingStore((state) => state.filters);
  const setFilters = useLoggingStore((state) => state.setFilters);
  const resetFilters = useLoggingStore((state) => state.resetFilters);

  const memoizedSetFilters = useCallback(
    (newFilters: any) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  const memoizedResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  return useMemo(
    () => ({
      filters,
      setFilters: memoizedSetFilters,
      resetFilters: memoizedResetFilters,
    }),
    [filters, memoizedSetFilters, memoizedResetFilters]
  );
};

export const useLoggingPagination = () => {
  const currentPage = useLoggingStore((state) => state.currentPage);
  const itemsPerPage = useLoggingStore((state) => state.itemsPerPage);
  const setCurrentPage = useLoggingStore((state) => state.setCurrentPage);
  const setItemsPerPage = useLoggingStore((state) => state.setItemsPerPage);
  const getTotalPages = useLoggingStore((state) => state.getTotalPages);
  const getCurrentPageLogs = useLoggingStore(
    (state) => state.getCurrentPageLogs
  );

  const memoizedSetCurrentPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  const memoizedSetItemsPerPage = useCallback(
    (size: number) => {
      setItemsPerPage(size);
    },
    [setItemsPerPage]
  );

  return useMemo(
    () => ({
      currentPage,
      itemsPerPage,
      setCurrentPage: memoizedSetCurrentPage,
      setItemsPerPage: memoizedSetItemsPerPage,
      getTotalPages,
      getCurrentPageLogs,
    }),
    [
      currentPage,
      itemsPerPage,
      memoizedSetCurrentPage,
      memoizedSetItemsPerPage,
      getTotalPages,
      getCurrentPageLogs,
    ]
  );
};

export const useLoggingActions = () => {
  const setLogs = useLoggingStore((state) => state.setLogs);
  const setFilteredLogs = useLoggingStore((state) => state.setFilteredLogs);
  const setSelectedLog = useLoggingStore((state) => state.setSelectedLog);
  const setLoading = useLoggingStore((state) => state.setLoading);
  const setError = useLoggingStore((state) => state.setError);

  return useMemo(
    () => ({
      setLogs,
      setFilteredLogs,
      setSelectedLog,
      setLoading,
      setError,
    }),
    [setLogs, setFilteredLogs, setSelectedLog, setLoading, setError]
  );
};

// Schedule Store Selectors
export const useSchedules = (): ScheduleData[] =>
  useScheduleStore((state) => state.schedules);
export const useFilteredSchedules = (): ScheduleData[] =>
  useScheduleStore((state) => state.filteredSchedules);

export const useScheduleFilters = () => {
  const filters = useScheduleStore((state) => state.filters);
  const setFilters = useScheduleStore((state) => state.setFilters);
  const resetFilters = useScheduleStore((state) => state.resetFilters);

  const memoizedSetFilters = useCallback(
    (newFilters: any) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  const memoizedResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  return useMemo(
    () => ({
      filters,
      setFilters: memoizedSetFilters,
      resetFilters: memoizedResetFilters,
    }),
    [filters, memoizedSetFilters, memoizedResetFilters]
  );
};

export const useSchedulePagination = () => {
  const currentPage = useScheduleStore((state) => state.currentPage);
  const itemsPerPage = useScheduleStore((state) => state.itemsPerPage);
  const setCurrentPage = useScheduleStore((state) => state.setCurrentPage);
  const setItemsPerPage = useScheduleStore((state) => state.setItemsPerPage);
  const getTotalPages = useScheduleStore((state) => state.getTotalPages);
  const getCurrentPageSchedules = useScheduleStore(
    (state) => state.getCurrentPageSchedules
  );

  const memoizedSetCurrentPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  const memoizedSetItemsPerPage = useCallback(
    (size: number) => {
      setItemsPerPage(size);
    },
    [setItemsPerPage]
  );

  return useMemo(
    () => ({
      currentPage,
      itemsPerPage,
      setCurrentPage: memoizedSetCurrentPage,
      setItemsPerPage: memoizedSetItemsPerPage,
      getTotalPages,
      getCurrentPageSchedules,
    }),
    [
      currentPage,
      itemsPerPage,
      memoizedSetCurrentPage,
      memoizedSetItemsPerPage,
      getTotalPages,
      getCurrentPageSchedules,
    ]
  );
};

export const useScheduleActions = () => {
  const setSchedules = useScheduleStore((state) => state.setSchedules);
  const setFilteredSchedules = useScheduleStore(
    (state) => state.setFilteredSchedules
  );
  const setSelectedSchedule = useScheduleStore(
    (state) => state.setSelectedSchedule
  );
  const addSchedule = useScheduleStore((state) => state.addSchedule);
  const updateSchedule = useScheduleStore((state) => state.updateSchedule);
  const deleteSchedule = useScheduleStore((state) => state.deleteSchedule);
  const setLoading = useScheduleStore((state) => state.setLoading);
  const setError = useScheduleStore((state) => state.setError);
  const updateStatusSchedule = useScheduleStore(
    (state) => state.updateStatusSchedule
  );
  return useMemo(
    () => ({
      setSchedules,
      setFilteredSchedules,
      setSelectedSchedule,
      addSchedule,
      updateSchedule,
      updateStatusSchedule,
      deleteSchedule,
      setLoading,
      setError,
    }),
    [
      setSchedules,
      setFilteredSchedules,
      setSelectedSchedule,
      addSchedule,
      updateSchedule,
      deleteSchedule,
      setLoading,
      setError,
    ]
  );
};

// UAR PIC Store Selectors
export const usePics = (): PicUser[] => useUarPicStore((state) => state.pics);
export const useFilteredPics = (): PicUser[] =>
  useUarPicStore((state) => state.filteredPics);

export const useUarPicFilters = () => {
  const filters = useUarPicStore((state) => state.filters);
  const setFilters = useUarPicStore((state) => state.setFilters);
  const resetFilters = useUarPicStore((state) => state.resetFilters);

  const memoizedSetFilters = useCallback(
    (newFilters: any) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  const memoizedResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  return useMemo(
    () => ({
      filters,
      setFilters: memoizedSetFilters,
      resetFilters: memoizedResetFilters,
    }),
    [filters, memoizedSetFilters, memoizedResetFilters]
  );
};

export const useUarPicPagination = () => {
  const currentPage = useUarPicStore((state) => state.currentPage);
  const itemsPerPage = useUarPicStore((state) => state.itemsPerPage);
  const setCurrentPage = useUarPicStore((state) => state.setCurrentPage);
  const setItemsPerPage = useUarPicStore((state) => state.setItemsPerPage);
  const getTotalPages = useUarPicStore((state) => state.getTotalPages);
  const getCurrentPagePics = useUarPicStore(
    (state) => state.getCurrentPagePics
  );

  const memoizedSetCurrentPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  const memoizedSetItemsPerPage = useCallback(
    (size: number) => {
      setItemsPerPage(size);
    },
    [setItemsPerPage]
  );

  return useMemo(
    () => ({
      currentPage,
      itemsPerPage,
      setCurrentPage: memoizedSetCurrentPage,
      setItemsPerPage: memoizedSetItemsPerPage,
      getTotalPages,
      getCurrentPagePics,
    }),
    [
      currentPage,
      itemsPerPage,
      memoizedSetCurrentPage,
      memoizedSetItemsPerPage,
      getTotalPages,
      getCurrentPagePics,
    ]
  );
};

export const useUarPicActions = () => {
  const setPics = useUarPicStore((state) => state.setPics);
  const getPics = useUarPicStore((state) => state.getPics);
  const setFilteredPics = useUarPicStore((state) => state.setFilteredPics);
  const setSelectedPic = useUarPicStore((state) => state.setSelectedPic);
  const addPic = useUarPicStore((state) => state.addPic);
  const updatePic = useUarPicStore((state) => state.updatePic);
  const deletePic = useUarPicStore((state) => state.deletePic);
  const setLoading = useUarPicStore((state) => state.setLoading);
  const setError = useUarPicStore((state) => state.setError);

  return useMemo(
    () => ({
      setPics,
      setFilteredPics,
      setSelectedPic,
      addPic,
      updatePic,
      deletePic,
      setLoading,
      setError,
      getPics,
    }),
    [
      setPics,
      setFilteredPics,
      setSelectedPic,
      addPic,
      updatePic,
      deletePic,
      setLoading,
      setError,
      getPics,
    ]
  );
};

// System Master Store Selectors
export const useSystemMasterRecords = (): SystemMaster[] =>
  useSystemMasterStore((state) => state.records);
export const useFilteredSystemMasterRecords = (): SystemMaster[] =>
  useSystemMasterStore((state) => state.filteredRecords);

export const useSystemMasterFilters = () => {
  const filters = useSystemMasterStore((state) => state.filters);
  const setFilters = useSystemMasterStore((state) => state.setFilters);
  const resetFilters = useSystemMasterStore((state) => state.resetFilters);

  const memoizedSetFilters = useCallback(
    (newFilters: any) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  const memoizedResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  return useMemo(
    () => ({
      filters,
      setFilters: memoizedSetFilters,
      resetFilters: memoizedResetFilters,
    }),
    [filters, memoizedSetFilters, memoizedResetFilters]
  );
};

export const useSystemMasterPagination = () => {
  const currentPage = useSystemMasterStore((state) => state.currentPage);
  const itemsPerPage = useSystemMasterStore((state) => state.itemsPerPage);
  const setCurrentPage = useSystemMasterStore((state) => state.setCurrentPage);
  const setItemsPerPage = useSystemMasterStore(
    (state) => state.setItemsPerPage
  );
  const getTotalPages = useSystemMasterStore((state) => state.getTotalPages);
  const getCurrentPageRecords = useSystemMasterStore(
    (state) => state.getCurrentPageRecords
  );

  const memoizedSetCurrentPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  const memoizedSetItemsPerPage = useCallback(
    (size: number) => {
      setItemsPerPage(size);
    },
    [setItemsPerPage]
  );

  return useMemo(
    () => ({
      currentPage,
      itemsPerPage,
      setCurrentPage: memoizedSetCurrentPage,
      setItemsPerPage: memoizedSetItemsPerPage,
      getTotalPages,
      getCurrentPageRecords,
    }),
    [
      currentPage,
      itemsPerPage,
      memoizedSetCurrentPage,
      memoizedSetItemsPerPage,
      getTotalPages,
      getCurrentPageRecords,
    ]
  );
};

export const useSystemMasterActions = () => {
  const setSystemMasterRecords = useSystemMasterStore(
    (state) => state.setRecords
  );
  const setFilteredRecords = useSystemMasterStore(
    (state) => state.setFilteredRecords
  );
  const setSelectedRecord = useSystemMasterStore(
    (state) => state.setSelectedSystemMaster
  );
  const addSystemMasterRecord = useSystemMasterStore(
    (state) => state.addSystemMaster
  );
  const updateSystemMasterRecord = useSystemMasterStore(
    (state) => state.updateSystemMaster
  );
  const deleteSystemMasterRecord = useSystemMasterStore(
    (state) => state.deleteSystemMaster
  );
  const setLoading = useSystemMasterStore((state) => state.setLoading);
  const setError = useSystemMasterStore((state) => state.setError);

  return useMemo(
    () => ({
      setSystemMasterRecords,
      setFilteredRecords,
      setSelectedRecord,
      addSystemMasterRecord,
      updateSystemMasterRecord,
      deleteSystemMasterRecord,
      setLoading,
      setError,
    }),
    [
      setSystemMasterRecords,
      setFilteredRecords,
      setSelectedRecord,
      addSystemMasterRecord,
      updateSystemMasterRecord,
      deleteSystemMasterRecord,
      setLoading,
      setError,
    ]
  );
};

// UAR Progress Store Selectors
export const useUarProgressData = (): UarProgressResponse | null =>
  useUarProgressStore((state) => state.progressData);
export const useUarProgressFilteredData = (): UarProgressResponse | null =>
  useUarProgressStore((state) => state.filteredData);

export const useUarProgressFilters = () => {
  const filters = useUarProgressStore((state) => state.filters);
  const setFilters = useUarProgressStore((state) => state.setFilters);
  const resetFilters = useUarProgressStore((state) => state.resetFilters);

  const memoizedSetFilters = useCallback(
    (newFilters: UarProgressFilters) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  const memoizedResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  return useMemo(
    () => ({
      filters,
      setFilters: memoizedSetFilters,
      resetFilters: memoizedResetFilters,
    }),
    [filters, memoizedSetFilters, memoizedResetFilters]
  );
};

export const useUarProgressUIState = () => {
  const selectedPeriod = useUarProgressStore((state) => state.selectedPeriod);
  const selectedDivisionFilter = useUarProgressStore(
    (state) => state.selectedDivisionFilter
  );
  const selectedDepartmentFilter = useUarProgressStore(
    (state) => state.selectedDepartmentFilter
  );
  const selectedSystemFilter = useUarProgressStore(
    (state) => state.selectedSystemFilter
  );
  const drilldownDivision = useUarProgressStore(
    (state) => state.drilldownDivision
  );

  const setSelectedPeriod = useUarProgressStore(
    (state) => state.setSelectedPeriod
  );
  const setSelectedDivisionFilter = useUarProgressStore(
    (state) => state.setSelectedDivisionFilter
  );
  const setSelectedDepartmentFilter = useUarProgressStore(
    (state) => state.setSelectedDepartmentFilter
  );
  const setSelectedSystemFilter = useUarProgressStore(
    (state) => state.setSelectedSystemFilter
  );
  const setDrilldownDivision = useUarProgressStore(
    (state) => state.setDrilldownDivision
  );

  const memoizedSetSelectedPeriod = useCallback(
    (period: string) => {
      setSelectedPeriod(period);
    },
    [setSelectedPeriod]
  );

  const memoizedSetSelectedDivisionFilter = useCallback(
    (division: string) => {
      setSelectedDivisionFilter(division);
    },
    [setSelectedDivisionFilter]
  );

  const memoizedSetSelectedDepartmentFilter = useCallback(
    (department: string) => {
      setSelectedDepartmentFilter(department);
    },
    [setSelectedDepartmentFilter]
  );

  const memoizedSetSelectedSystemFilter = useCallback(
    (system: string) => {
      setSelectedSystemFilter(system);
    },
    [setSelectedSystemFilter]
  );

  const memoizedSetDrilldownDivision = useCallback(
    (division: string | null) => {
      setDrilldownDivision(division);
    },
    [setDrilldownDivision]
  );

  return useMemo(
    () => ({
      selectedPeriod,
      selectedDivisionFilter,
      selectedDepartmentFilter,
      selectedSystemFilter,
      drilldownDivision,
      setSelectedPeriod: memoizedSetSelectedPeriod,
      setSelectedDivisionFilter: memoizedSetSelectedDivisionFilter,
      setSelectedDepartmentFilter: memoizedSetSelectedDepartmentFilter,
      setSelectedSystemFilter: memoizedSetSelectedSystemFilter,
      setDrilldownDivision: memoizedSetDrilldownDivision,
    }),
    [
      selectedPeriod,
      selectedDivisionFilter,
      selectedDepartmentFilter,
      selectedSystemFilter,
      drilldownDivision,
      memoizedSetSelectedPeriod,
      memoizedSetSelectedDivisionFilter,
      memoizedSetSelectedDepartmentFilter,
      memoizedSetSelectedSystemFilter,
      memoizedSetDrilldownDivision,
    ]
  );
};

export const useUarProgressActions = () => {
  const setProgressData = useUarProgressStore((state) => state.setProgressData);
  const setFilteredData = useUarProgressStore((state) => state.setFilteredData);
  const setLoading = useUarProgressStore((state) => state.setLoading);
  const setError = useUarProgressStore((state) => state.setError);
  const setIsRefreshing = useUarProgressStore((state) => state.setIsRefreshing);

  return useMemo(
    () => ({
      setProgressData,
      setFilteredData,
      setLoading,
      setError,
      setIsRefreshing,
    }),
    [setProgressData, setFilteredData, setLoading, setError, setIsRefreshing]
  );
};

export const useUarProgressComputed = () => {
  const getDivisionOptions = useUarProgressStore(
    (state) => state.getDivisionOptions
  );
  const getDivisionChartData = useUarProgressStore(
    (state) => state.getDivisionChartData
  );
  const getDepartmentOptions = useUarProgressStore(
    (state) => state.getDepartmentOptions
  );
  const getSystemOptions = useUarProgressStore(
    (state) => state.getSystemOptions
  );
  const getDepartmentChartData = useUarProgressStore(
    (state) => state.getDepartmentChartData
  );
  const getSystemChartData = useUarProgressStore(
    (state) => state.getSystemChartData
  );
  const getGrandTotal = useUarProgressStore((state) => state.getGrandTotal);

  return useMemo(
    () => ({
      getDivisionOptions,
      getDivisionChartData,
      getDepartmentOptions,
      getSystemOptions,
      getDepartmentChartData,
      getSystemChartData,
      getGrandTotal,
    }),
    [
      getDivisionOptions,
      getDivisionChartData,
      getDepartmentOptions,
      getSystemOptions,
      getDepartmentChartData,
      getSystemChartData,
      getGrandTotal,
    ]
  );
};

export const useUarProgressLoading = () => {
  const loading = useUarProgressStore((state) => state.loading);
  const error = useUarProgressStore((state) => state.error);
  const isRefreshing = useUarProgressStore((state) => state.isRefreshing);

  return useMemo(
    () => ({
      loading,
      error,
      isRefreshing,
    }),
    [loading, error, isRefreshing]
  );
};
