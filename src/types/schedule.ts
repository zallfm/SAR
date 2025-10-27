export type Schedule = {
  ID: string;
  APPLICATION_ID: string;
  SCHEDULE_SYNC_START_DT: string;
  SCHEDULE_SYNC_END_DT: string;
  SCHEDULE_UAR_DT: string;
  SCHEDULE_STATUS: string;
  CREATED_BY: string;
  CREATED_DT: string;
  CHANGED_BY: string | null;
  CHANGED_DT: string | null;
};

export type ScheduleData = {
  ID: string;
  APPLICATION_ID: string;
  SCHEDULE_SYNC_START_DT: string;
  SCHEDULE_SYNC_END_DT: string;
  SCHEDULE_UAR_DT: string;
  SCHEDULE_STATUS: string;
};

export type CreateSchedulePayload = {
  APPLICATION_ID: string;
  SCHEDULE_SYNC_START_DT: string;
  SCHEDULE_SYNC_END_DT: string;
  SCHEDULE_UAR_DT: string;
  SCHEDULE_STATUS: string;
};

export type UpdateSchedulePayload = Partial<CreateSchedulePayload>;

export type BackendGetScheduleResponse = {
  requestId: string;
  data: Schedule[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type BackendCreateScheduleResponse = {
  requestId: string;
  data: Schedule;
};

export type BackendUpdateScheduleResponse = {
  requestId: string;
  data: Schedule;
};

export type UpdateScheduleStatusPayload = {
  SCHEDULE_STATUS: string;
};
