import { useEffect, useState } from "react";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { listUsers, User } from "../api/usersApi";

export function UsersListPage() {
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const data = await listUsers();
      setRows(data);
    } catch (err: any) {
      setError(err?.message ?? "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const columns: GridColDef<User>[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Nome", flex: 1, minWidth: 160 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 220 },
    {
      field: "nickname",
      headerName: "Nickname",
      flex: 1,
      minWidth: 140,
      valueGetter: (v, row) => row.nickname ?? "-",
    },
    {
      field: "is_active",
      headerName: "Ativo",
      width: 110,
      type: "boolean",
    },
    {
      field: "actions",
      headerName: "",
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Button
          size="small"
          component={RouterLink}
          to={`/users/${params.row.id}/edit`}
        >
          Editar
        </Button>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">Usuários</Typography>
        <Button variant="contained" component={RouterLink} to="/users/new">
          Criar usuário
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={load}>
              Tentar de novo
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Paper sx={{ height: 520 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          disableRowSelectionOnClick
        />
      </Paper>
    </Stack>
  );
}
