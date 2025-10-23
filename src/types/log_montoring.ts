export type LogMonitoring = {
  NO: number;
  PROCESS_ID: string;
  USER_ID: string;
  MODULE: string;
  FUNCTION_NAME: string;
  START_DATE: string;
  END_DATE: string;
  STATUS: 'Success' | 'Error' | 'Warning' | 'InProgress';
  DETAILS?: any[];
};

export type BackendGetLogMonitoringResponse = {
  data: LogMonitoring[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
