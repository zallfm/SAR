import { http } from "./client";
import { BackendCreateApplicationResponse, BackendEditApplicationResponse, BackendGetApplicationResponse, SystemUser } from "../types/application";
// import { LogEntry } from "@/data";

export type GetSystemUsersResp = { data: SystemUser[]; total?: number };
export type GetSecurityCentersResp = { data: string[] };

// Sekarang bisa menerima parameter query
export const getApplicationApi = (params?: Record<string, any>) =>
  http<BackendGetApplicationResponse>({
    path: "/sar/application",
    method: "GET",
    params,
  });

export const postApplicationApi = (payload: any) =>
  http<BackendCreateApplicationResponse>({
    path: "/sar/application",
    method: "POST",
    body: payload,
  });

export const editApplicationApi = (id: string, payload: any) => {
  return http<BackendEditApplicationResponse>({
    path: `/sar/application/${id}`,
    method: "PUT",
    body: payload
  })
}

export const getSystemUsersApi = (params?: { q?: string; limit?: number; offset?: number }) =>
  http<GetSystemUsersResp>({
    path: "/sar/application/masters/system-users",
    method: 'GET',
    params,
  })

export const getSecurityCentersApi = (params?: { q?: string; limit?: number; offset?: number }) =>
  http<GetSecurityCentersResp>({
    path: "/sar/application/masters/security-centers",
    method: "GET",
    params
  });
