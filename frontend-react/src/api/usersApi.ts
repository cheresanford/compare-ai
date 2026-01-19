import { API_BASE_URL, unwrap } from "./http";

export type User = {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  nickname?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateUserInput = {
  email: string;
  name: string;
  is_active?: boolean;
  nickname?: string;
};

export async function createUser(input: CreateUserInput): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    // tenta extrair erro padronizado do backend
    const msg =
      payload?.error?.message ??
      payload?.message ??
      `Falha ao criar usuário (HTTP ${res.status})`;
    const details = payload?.error?.details;
    const detailsText = Array.isArray(details) ? `\n${details.join("\n")}` : "";
    throw new Error(msg + detailsText);
  }

  return unwrap<User>(payload);
}



export async function listUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE_URL}/users`);
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      payload?.error?.message ??
      payload?.message ??
      `Falha ao listar usuários (HTTP ${res.status})`;
    throw new Error(msg);
  }

  return unwrap<User[]>(payload);
}

export async function getUser(id: number): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users/${id}`);
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      payload?.error?.message ??
      payload?.message ??
      `Falha ao carregar usuário (HTTP ${res.status})`;
    throw new Error(msg);
  }

  return unwrap<User>(payload);
}

export type UpdateUserInput = {
  email?: string;
  name?: string;
  is_active?: boolean;
  nickname?: string | null;
};

export async function updateUser(id: number, input: UpdateUserInput): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      payload?.error?.message ??
      payload?.message ??
      `Falha ao atualizar usuário (HTTP ${res.status})`;
    const details = payload?.error?.details;
    const detailsText = Array.isArray(details) ? `\n${details.join("\n")}` : "";
    throw new Error(msg + detailsText);
  }

  return unwrap<User>(payload);
}
