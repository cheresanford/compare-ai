import { useEffect, useState } from "react";
import { Alert, Button, Card, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { listUsers, User } from "../api/usersApi";
import { useUsers } from "../hooks/useUsers";
import { PageTransition } from "../PageTransition";
import { AnimatePresence } from "framer-motion";
export function UsersListPage() {
  const { users: rows, loading, error, refetch: load } = useUsers();

  const [testText, setTestText] = useState<string>("Testandooo");

  function changeTestTextValue() {
    setTestText("Valor alterado");
  }

  const [showCard, setShowCard] = useState<boolean>(false);

  function showAnotherCard() {
    if (!showCard) {
      setShowCard(true);
    } else {
      setShowCard(false);
    }
  }
  

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
        <Button variant="outlined" onClick={changeTestTextValue}>
          Alterar Teste
        </Button>
        <Button variant="contained" component={RouterLink} to="/users/new">
          Criar usuário {testText}
        </Button>
        {testText === "Testandooo" ? (
          <LinearProgress sx={{ width: 200 }} />
        ) : (
          <Typography>O valor foi alterado</Typography>
        )}
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
      <Card sx={{ p: 2 }}>
        <Typography variant="body2">
          <Button onClick={showAnotherCard}>Mostrar Cartão</Button>
        </Typography>
      </Card>
      <AnimatePresence mode="wait">
      {showCard && (
        <PageTransition>
          <Card sx={{ p: 2 }}>
          <Typography variant="body2">
            Este é um cartão adicional exibido ao clicar no botão.
          </Typography>
          </Card>
        </PageTransition>
      )}

      </AnimatePresence>
    </Stack>
  );
}
