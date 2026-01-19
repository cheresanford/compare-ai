import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink, Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            TCC - Users
          </Typography>

          <Button color="inherit" component={RouterLink} to="/users">
            Lista
          </Button>
          <Button color="inherit" component={RouterLink} to="/users/new">
            Criar
          </Button>

          <Button color="inherit" component={RouterLink} to="/eventos">
            Eventos
          </Button>
          <Button color="inherit" component={RouterLink} to="/eventos/new">
            Criar Evento
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
