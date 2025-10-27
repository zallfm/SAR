import { http } from "./client";
import { BackendCreateApplicationResponse, BackendEditApplicationResponse, BackendGetApplicationResponse, SystemUser } from "../types/application";
import { withToken } from "./helper";
// import { LogEntry } from "@/data";

export type GetSystemUsersResp = { data: SystemUser[]; total?: number };
export type GetSecurityCentersResp = { data: string[] };

// Sekarang bisa menerima parameter query
export const getApplicationApi = (params?: Record<string, any>) =>
  withToken((token) =>
    http<BackendGetApplicationResponse>({
      path: "/sar/application",
      method: "GET",
      token,
      params,
    })
  )

export const postApplicationApi = (payload: any) =>
  withToken((token) => 
    http<BackendCreateApplicationResponse>({
      path: "/sar/application",
      method: "POST",
      token,
      body: payload,
    })
  )

export const editApplicationApi = (id: string, payload: any) =>
  withToken((token) =>
    http<BackendEditApplicationResponse>({
      path: `/sar/application/${id}`,
      method: "PUT",
      token,                 // ← tambahkan token
      body: payload,
    })
  );

export const getSystemUsersApi = (params?: { q?: string; limit?: number; offset?: number }) =>
  withToken((token) =>
    http<GetSystemUsersResp>({
      path: "/sar/application/masters/system-users",
      method: "GET",
      token,                 // ← tambahkan token
      params,
    })
  );

export const getSecurityCentersApi = (params?: { q?: string; limit?: number; offset?: number }) =>
  withToken((token) => 
    http<GetSecurityCentersResp>({
      path: "/sar/application/masters/security-centers",
      method: "GET",
      token,
      params
    })
  )
