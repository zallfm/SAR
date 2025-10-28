export type SystemMaster = {
  SYSTEM_TYPE: string;
  SYSTEM_CD: string;
  VALID_FROM_DT: string;
  VALID_TO_DT: string;
  NEW_VALID_FROM_DT?: string | null;
  VALUE_TEXT: string | null;
  VALUE_NUM: number | null;
  VALUE_TIME: string | null;
  CREATED_BY: string;
  CREATED_DT: string;
  CHANGED_BY: string;
  CHANGED_DT: string;
};

export type CreateSystemMasterPayload = {
  SYSTEM_TYPE: string;
  VALID_FROM_DT: string;
  VALID_TO_DT: string;
  NEW_VALID_FROM_DT?: string | null;
  VALUE_TEXT: string | null;
  VALUE_NUM: number | null;
  VALUE_TIME: string | null;
};

export type UpdateSystemMasterPayload = Omit<
  CreateSystemMasterPayload,
  "SYSTEM_TYPE"
>;

export type BackendGetSystemMasterResponse = {
  requestId: string;
  data: SystemMaster[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type BackendCreateSystemMasterResponse = {
  requestId: string;
  data: SystemMaster;
};

export type BackendUpdateSystemMasterResponse = {
  requestId: string;
  data: SystemMaster;
};
