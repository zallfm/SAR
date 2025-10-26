export type ApiError = {
  response?: {
    status?: number;
    data?: {
      code?: string;
      message?: string;
      [k: string]: unknown;
    };
  };
  message?: string;
};

export function parseApiError(e: unknown): { code?: string; message: string; status?: number } {
  // aman untuk semua jenis error (fetch, axios, Error biasa)
  if (typeof e === "object" && e !== null) {
    const anyErr = e as Record<string, any>;
    const code = anyErr?.response?.data?.code as string | undefined;
    const message =
      (anyErr?.response?.data?.message as string | undefined) ??
      (anyErr?.message as string | undefined) ??
      "Unknown error";
    const status = anyErr?.response?.status as number | undefined;
    return { code, message, status };
  }
  // primitive error
  return { message: String(e ?? "Unknown error") };
}
