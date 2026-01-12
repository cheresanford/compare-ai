import { useEffect, useState } from "react";
import { listUsers, User } from "../api/usersApi";

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchUsers() {
        setError(null);
        setLoading(true);
        try {
            const data = await listUsers();
            console.log('negrinho')
            setUsers(data);
        } catch (err: any) {
            setError(err?.message ?? "Unexpected error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    return { users, loading, error, refetch: fetchUsers };
}