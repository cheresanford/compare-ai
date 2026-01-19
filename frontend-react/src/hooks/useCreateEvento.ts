import { useState } from "react";
import { createEvento as postEvento, CreateEventoPayload } from "../api/eventosApi";

export function useCreateEvento() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    async function createEvento(input: CreateEventoPayload) {
        setError(null);
        setSuccess(false);
        setLoading(true);
        try {
            await postEvento(input);
            setSuccess(true);
        } catch (err: any) {
            setError(err?.message ?? "Unexpected error");
        } finally {
            setLoading(false);
        }
    }

    return { createEvento, loading, error, success };
}