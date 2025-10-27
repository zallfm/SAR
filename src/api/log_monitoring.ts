import { http } from "./client";
import { BackendGetLogMonitoringResponse, BackendLogEntry } from "../types/log_montoring";
import { LogEntry } from "../services/loggingService";
import { withToken } from "./helper";
// import { LogEntry } from "@/data";

// Sekarang bisa menerima parameter query
export const getLogMonitoringApi = (params?: Record<string, any>) =>
  withToken((token) =>
    http<BackendGetLogMonitoringResponse>({
      path: "/sar/log_monitoring",
      method: "GET",
      token,
      params,
    })
  )

export const getLogByProcessIdApi = (processId: string) =>
  withToken((token) =>
    http<{ data: BackendLogEntry }>({
      path: `/sar/log_monitoring/${encodeURIComponent(processId)}`,
      method: "GET",
    })
  )

export const postLogMonitoringApi = (payload: any) =>
  withToken((token) => 
    http<{ message: string; data: any }>({
      path: "/sar/log_monitoring",
      method: "POST",
      token,
      body: payload,
    })
  )

