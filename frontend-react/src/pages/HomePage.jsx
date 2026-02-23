import { Alert, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function HomePage() {
  return (
    <Card elevation={4}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h4">TeamMeet Planner</Typography>
          <Typography color="text.secondary">
            Módulo de eventos disponível com listagem, busca, paginação, ordenação e CRUD.
          </Typography>

          <Alert severity="info">
            Use a navegação acima para acessar lista, cadastro, edição, detalhe e exclusão.
          </Alert>

          <Stack direction="row" spacing={1}>
            <Button variant="contained" component={RouterLink} to="/events">
              Ir para lista de eventos
            </Button>
            <Button variant="outlined" component={RouterLink} to="/events/new">
              Cadastrar evento
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

