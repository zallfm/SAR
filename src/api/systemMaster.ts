import { http } from "./client";
import { SystemMasterFilters } from "../store/systemMasterStore";

import type {
  BackendGetSystemMasterResponse,
  BackendCreateSystemMasterResponse,
  BackendUpdateSystemMasterResponse,
  CreateSystemMasterPayload,
  UpdateSystemMasterPayload,
} from "../types/systemMaster";

export const getSystemMasterApi = (params: SystemMasterFilters, signal: AbortSignal) =>
  http<BackendGetSystemMasterResponse>({
    path: "/sar/master_config",
    method: "GET",
    params,
    signal
  });

export const createSystemMasterApi = (data: CreateSystemMasterPayload) =>
  http<BackendCreateSystemMasterResponse>({
    path: "/sar/master_config",
    method: "POST",
    body: data,
  });

export const editSystemMasterApi = (
  id: string,
  data: UpdateSystemMasterPayload
) =>
  http<BackendUpdateSystemMasterResponse>({
    path: `/sar/master_config/${id}`,
    method: "PUT",
    body: data,
  });

export const deleteSystemMasterApi = (compoundId: any) =>
  http<void>({
    path: `/sar/master_config/${compoundId.SYSTEM_TYPE}/${compoundId.SYSTEM_CD}/${compoundId.VALID_FROM_DT}`,
    method: "DELETE",
  });

export const updateStatusSystemMasterApi = (id: string, data: any) =>
  http<BackendUpdateSystemMasterResponse>({
    path: `/sar/master_config/${id}/status`,
    method: "PUT",
    body: data,
  });
