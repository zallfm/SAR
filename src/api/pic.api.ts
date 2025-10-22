import { http } from "./client";
import type {
  BackendGetUarResponse,
  BackendCreateUarResponse,
  BackendEditUarResponse,
  CreateUarPayload,
  EditUarPayload,
} from "../types/pic";

export const getUarApi = () =>
  http<BackendGetUarResponse>({
    path: "/uarpic",
    method: "GET",
  });

export const createUarApi = (data: CreateUarPayload) =>
  http<BackendCreateUarResponse>({
    path: "/uarpic",
    method: "POST",
    body: data,
  });

export const editUarApi = (id: string, data: EditUarPayload) =>
  http<BackendEditUarResponse>({
    path: `/uarpic/${id}`,
    method: "PUT",
    body: data,
  });

export const deleteUarApi = (id: string) =>
  http<void>({
    path: `/uarpic/${id}`,
    method: "DELETE",
  });
