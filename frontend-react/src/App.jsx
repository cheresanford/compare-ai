// import { useState } from 'react';
// import { AppBar, Toolbar, Typography, Container, Card, CardContent, Button, Alert, CircularProgress } from '@mui/material';

// const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// function App() {
//   const [loading, setLoading] = useState(false);
//   const [response, setResponse] = useState(null);

//   const testApi = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${apiUrl}/health`);
//       const data = await res.json();
//       setResponse(data);
//     } catch (error) {
//       setResponse({ status: 'error', message: error.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <AppBar position="static" color="primary">
//         <Toolbar>
//           <Typography variant="h6" component="div">HelpDesk Lite (React + MUI)</Typography>
//         </Toolbar>
//       </AppBar>
//       <Container maxWidth="sm" sx={{ mt: 6 }}>
//         <Card elevation={6}>
//           <CardContent>
//             <Typography variant="h5" gutterBottom>Frontend B</Typography>
//             <Typography paragraph>
//               Este é o frontend B do experimento. Clique no botão para testar a API NestJS conectada ao MySQL.
//             </Typography>
//             <Button variant="contained" onClick={testApi} disabled={loading} startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}>
//               {loading ? 'Chamando...' : 'Testar API'}
//             </Button>
//             {response && (
//               <Alert severity={response.status === 'ok' ? 'success' : 'error'} sx={{ mt: 3 }}>
//                 {JSON.stringify(response)}
//               </Alert>
//             )}
//           </CardContent>
//         </Card>
//       </Container>
//     </>
//   );
// }

// export default App;
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { UsersCreatePage } from "./pages/UsersCreatePage";
import { UsersListPage } from "./pages/UsersListPage";
import { UsersEditPage } from "./pages/UsersEditPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/users" replace />} />
        <Route path="/users" element={<UsersListPage />} />
        <Route path="/users/new" element={<UsersCreatePage />} />
        <Route path="/users/:id/edit" element={<UsersEditPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/users" replace />} />
    </Routes>
  );
}


