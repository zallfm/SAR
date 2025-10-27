import { http } from "./client";
import { UarPicFilters } from "../store/uarPicStore";

import type {
  BackendGetUarResponse,
  BackendCreateUarResponse,
  BackendEditUarResponse,
  CreateUarPayload,
  EditUarPayload,
} from "../types/pic";

export const getUarApi = (params: UarPicFilters) =>
  http<BackendGetUarResponse>({
    path: "/sar/uarpic",
    method: "GET",
    params,
  });

export const createUarApi = (data: CreateUarPayload) =>
  http<BackendCreateUarResponse>({
    path: "/sar/uarpic",
    method: "POST",
    body: data,
  });

export const editUarApi = (id: string, data: EditUarPayload) =>
  http<BackendEditUarResponse>({
    path: `/sar/uarpic/${id}`,
    method: "PUT",
    body: data,
  });

export const deleteUarApi = (id: string) =>
  http<void>({
    path: `/sar/uarpic/${id}`,
    method: "DELETE",
  });
