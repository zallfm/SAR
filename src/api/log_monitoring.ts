import { http } from "./client";
import { BackendGetLogMonitoringResponse, BackendLogEntry } from "../types/log_montoring";
import { LogEntry } from "../services/loggingService";
// import { LogEntry } from "@/data";

// Sekarang bisa menerima parameter query
export const getLogMonitoringApi = (params?: Record<string, any>) =>
  http<BackendGetLogMonitoringResponse>({
    path: "/sar/log_monitoring",
    method: "GET",
    params,
  });

export const getLogByProcessIdApi = (processId: string) =>
  http<{ data: BackendLogEntry }>({
    path: `/sar/log_monitoring/${encodeURIComponent(processId)}`,
    method: "GET",
  });

export const postLogMonitoringApi = (payload: any) =>
  http<{ message: string; data: any }>({
    path: "/sar/log_monitoring",
    method: "POST",
    body: payload,
  });

