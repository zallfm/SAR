import { http } from "./client";
import { ScheduleFilters } from "../store/scheduleStore";

import type {
  BackendGetScheduleResponse,
  BackendCreateScheduleResponse,
  BackendUpdateScheduleResponse,
  CreateSchedulePayload,
  UpdateSchedulePayload,
} from "../types/schedule";

export const getScheduleApi = (params: ScheduleFilters) =>
  http<BackendGetScheduleResponse>({
    path: "/sar/schedules",
    method: "GET",
    params,
  });

export const createScheduleApi = (data: CreateSchedulePayload) =>
  http<BackendCreateScheduleResponse>({
    path: "/sar/schedules",
    method: "POST",
    body: data,
  });

export const editScheduleApi = (id: string, data: UpdateSchedulePayload) =>
  http<BackendUpdateScheduleResponse>({
    path: `/sar/schedules/${id}`,
    method: "PUT",
    body: data,
  });

export const deleteScheduleApi = (id: string) =>
  http<void>({
    path: `/sar/schedules/${id}`,
    method: "DELETE",
  });

export const updateStatusScheduleApi = (id: string, data: any) =>
  http<BackendUpdateScheduleResponse>({
    path: `/sar/schedules/${id}/status`,
    method: "PUT",
    body: data,
  });
