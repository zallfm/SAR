import { http } from "./client";
import { UarPicFilters } from "../store/uarPicStore";

import type {
  BackendGetUarResponse,
  BackendCreateUarResponse,
  BackendEditUarResponse,
  CreateUarPayload,
  EditUarPayload,
} from "../types/pic";
import { withToken } from "./helper";

export const getUarApi = (params?: UarPicFilters) =>
  withToken((token) =>
    http<BackendGetUarResponse>({
      path: "/sar/uarpic",
      method: "GET",
      token,
      params,
    })
  );

export const createUarApi = (data: CreateUarPayload) =>
  withToken((token) =>
    http<BackendCreateUarResponse>({
      path: "/sar/uarpic",
      method: "POST",
      token,
      body: data,
    })
  );

export const editUarApi = (id: string, data: EditUarPayload) =>
  withToken((token) =>
    http<BackendEditUarResponse>({
      path: `/sar/uarpic/${id}`,
      method: "PUT",
      token,
      body: data,
    })
  );

export const deleteUarApi = (id: string) =>
  withToken((token) =>
    http<void>({
      path: `/sar/uarpic/${id}`,
      method: "DELETE",
      token,
    })
  );
