import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Container,
  Button,
  IconButton,
  Alert,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility'; // Para ver detalles
import { useAuth } from '../Autenticacion/AuthContext'; // Ajusta la ruta
import { useNavigate } from 'react-router-dom';

const EventosAtleta = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirige si no está autenticado
    } else {
      fetchEventos();
    }
  }, [user, navigate]);

  const fetchEventos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/eventos/atleta'); // Endpoint para atletas
      setEventos(response.data);
      setErrorMessage('');
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      setErrorMessage('Error al cargar los eventos. Intente de nuevo.');
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/atleta/eventos/${id}`); // Navega a detalles (crea esta ruta si lo deseas)
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, background: '#F5E8C7', minHeight: '100vh', fontFamily: "'Arial', 'Helvetica', sans-serif" }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: '#800020', fontWeight: 'bold' }}>
        Próximos Eventos
      </Typography>

      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error" onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        </Box>
      )}

      <Paper elevation={3} sx={{ borderRadius: '12px', overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
        <Table sx={{ minWidth: 650 }} aria-label="eventos atleta table">
          <TableHead>
            <TableRow>
              {['Fecha', 'Dirección', 'Disciplina', 'Horario', 'Lugar', 'Acciones'].map((head) => (
                <TableCell
                  key={head}
                  sx={{ fontWeight: 'bold', color: '#800020', fontSize: '1rem', padding: '16px' }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {eventos.map((evento) => (
              <TableRow
                key={evento.id}
                sx={{ '&:hover': { backgroundColor: '#FAFAFF' }, transition: 'background-color 0.3s' }}
              >
                <TableCell sx={{ color: '#333333' }}>
                  {evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-ES') : 'Sin fecha'}
                </TableCell>
                <TableCell sx={{ color: '#333333' }}>{evento.direccion || 'Sin dirección'}</TableCell>
                <TableCell sx={{ color: '#333333' }}>{evento.disciplina || 'Sin disciplina'}</TableCell>
                <TableCell sx={{ color: '#333333' }}>{evento.horario || 'Sin horario'}</TableCell>
                <TableCell sx={{ color: '#333333' }}>{evento.lugar || 'Sin lugar'}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleViewDetails(evento.id)}
                    sx={{ '&:hover': { backgroundColor: 'rgba(128, 0, 32, 0.1)' } }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {eventos.length === 0 && !errorMessage && (
        <Typography variant="body1" align="center" sx={{ mt: 2, color: '#7A4069' }}>
          No hay eventos disponibles.
        </Typography>
      )}
    </Container>
  );
};

export default EventosAtleta;