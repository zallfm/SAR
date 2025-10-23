import { http } from "./client";
import { BackendGetLogMonitoringResponse } from "../types/log_montoring";

// Sekarang bisa menerima parameter query
export const getLogMonitoringApi = (params?: Record<string, any>) =>
  http<BackendGetLogMonitoringResponse>({
    path: "/sar/log_monitoring",
    method: "GET",
    params, // ← kirim semua param ke server
  });
