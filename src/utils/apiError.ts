export type ApiFieldError = {
  code: string;
  message: string;
  value?: any;
};

export type ParsedApiError = {
  code?: string;
  message: string;
  status?: number;
  errors?: Record<string, ApiFieldError>; // ⬅️ tambahkan ini
};

export function parseApiError(e: unknown): ParsedApiError {
  if (typeof e === "object" && e !== null) {
    const anyErr = e as Record<string, any>;
    const code = anyErr?.response?.data?.code as string | undefined;
    const message =
      (anyErr?.response?.data?.message as string | undefined) ??
      (anyErr?.message as string | undefined) ??
      "Unknown error";
    const status = anyErr?.response?.status as number | undefined;

    // ambil field errors dari backend (kalau ada)
    const errors =
      (anyErr?.response?.data?.errors as Record<string, ApiFieldError>) ??
      (anyErr?.response?.data?.details?.errors as Record<string, ApiFieldError>) ??
      undefined;

    return { code, message, status, errors };
  }

  return { message: String(e ?? "Unknown error") };
}
