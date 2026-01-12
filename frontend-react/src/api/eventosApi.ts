import { Dayjs } from "dayjs";
import { API_BASE_URL, unwrap } from "./http";

export type Evento = {
  id: number;
  nome_evento: string;
  data_evento: string;
  local_evento: string;
};

export type CreateEventoPayload = {
  nome_evento: string;
  data_evento: Dayjs | null;
  local_evento: string;
};

export async function createEvento(
  input: CreateEventoPayload
): Promise<Evento> {
  const body = {
    ...input,
    data_evento: input.data_evento ? input.data_evento.toISOString() : null,
  };

  const res = await fetch(`${API_BASE_URL}/eventos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      payload?.error?.message ??
      payload?.message ??
      `Falha ao criar evento (HTTP ${res.status})`;
    throw new Error(msg);
  }
  return unwrap<Evento>(payload);
}

