import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { AnimatePresence } from "framer-motion";
import { Link as RouterLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { EventsApiProvider } from "./features/events/providers/EventsApiProvider";
import { EventsListPage } from "./features/events/pages/EventsListPage";
import { EventFormPage } from "./features/events/pages/EventFormPage";
import { EventDetailPage } from "./features/events/pages/EventDetailPage";
import { CategoriesPage } from "./features/categories/pages/CategoriesPage";

function Shell({ children }) {
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            TeamMeet Planner
          </Typography>

          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/events">
            Eventos
          </Button>
          <Button color="inherit" component={RouterLink} to="/categories">
            Categorias
          </Button>
          <Button color="inherit" component={RouterLink} to="/events/new">
            Criar Evento
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <EventsApiProvider>
      <Shell>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events/new" element={<EventFormPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/events/:id/edit" element={<EventFormPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="*" element={<Navigate to="/events" replace />} />
          </Routes>
        </AnimatePresence>
      </Shell>
    </EventsApiProvider>
  );
}

