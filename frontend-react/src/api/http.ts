export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export type ApiEnvelope<T> = {
  data: T;
  meta?: { traceId?: string; timestamp?: string };
};

export function unwrap<T>(payload: any): T {
  // aceita API “pura” ou “envelopada”
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
}
