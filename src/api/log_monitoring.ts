import { http } from "./client";
import { BackendGetLogMonitoringResponse } from "../types/log_montoring";

export const getLogMonitoringApi = () =>
  http<BackendGetLogMonitoringResponse>({
    path: "/sar/log_monitoring",
    method: "GET",
  });
