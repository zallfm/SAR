import { http } from "./client";
import { withToken } from "./helper";
import { ScheduleFilters } from "../store/scheduleStore";

import type {
  BackendGetScheduleResponse,
  BackendCreateScheduleResponse,
  BackendUpdateScheduleResponse,
  CreateSchedulePayload,
  UpdateSchedulePayload,
} from "../types/schedule";

export const getScheduleApi = (params?: ScheduleFilters) =>
  withToken((token) =>
    http<BackendGetScheduleResponse>({
      path: "/sar/schedules",
      method: "GET",
      token,
      params,
    })
  );

export const createScheduleApi = (data: CreateSchedulePayload) =>
  withToken((token) =>
    http<BackendCreateScheduleResponse>({
      path: "/sar/schedules",
      method: "POST",
      token,
      body: data,
    })
  );

export const editScheduleApi = (id: {
  APPLICATION_ID: string;
  SCHEDULE_SYNC_START_DT: string;
  SCHEDULE_UAR_DT: string;
}, data: UpdateSchedulePayload) =>
  withToken((token) =>
    http<BackendUpdateScheduleResponse>({
      path: `/sar/schedules/${id.APPLICATION_ID}/${id.SCHEDULE_SYNC_START_DT}/${id.SCHEDULE_UAR_DT}`,
      method: "PUT",
      token,
      body: data,
    })
  );

export const deleteScheduleApi = (id: string) =>
  withToken((token) =>
    http<void>({
      path: `/sar/schedules/${id}`,
      method: "DELETE",
      token,
    })
  );

export const updateStatusScheduleApi = (
  id: {
    APPLICATION_ID: string;
    SCHEDULE_SYNC_START_DT: string;
    SCHEDULE_UAR_DT: string;
  },
  data: any
) =>
  withToken((token) =>
    http<BackendUpdateScheduleResponse>({
      path: `/sar/schedules/${id.APPLICATION_ID}/${id.SCHEDULE_SYNC_START_DT}/${id.SCHEDULE_UAR_DT}/status`,
      method: "PUT",
      token,
      body: data,
    })
  );
