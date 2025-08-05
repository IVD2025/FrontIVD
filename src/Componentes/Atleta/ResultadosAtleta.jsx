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

const ResultadosAtleta = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resultados, setResultados] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirige si no está autenticado
    } else {
      fetchResultados();
    }
  }, [user, navigate]);

  const fetchResultados = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/resultados/atleta/${user.id}`);
      // Ordenar por fecha descendente
      const sortedResultados = response.data.sort((a, b) => new Date(b.fechaEvento) - new Date(a.fechaEvento));
      setResultados(sortedResultados);
      setErrorMessage('');
    } catch (error) {
      console.error('Error al obtener resultados:', error);
      setErrorMessage('Error al cargar los resultados. Intente de nuevo.');
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/atleta/resultados/${id}`); // Navega a detalles (crea esta ruta si lo deseas)
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, background: '#F5E8C7', minHeight: '100vh', fontFamily: "'Arial', 'Helvetica', sans-serif" }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: '#800020', fontWeight: 'bold' }}>
        Resultados de Eventos Recientes
      </Typography>

      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error" onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        </Box>
      )}

      <Paper elevation={3} sx={{ borderRadius: '12px', overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
        <Table sx={{ minWidth: 650 }} aria-label="resultados atleta table">
          <TableHead>
            <TableRow>
              {['Fecha', 'Evento', 'Disciplina', 'Resultado', 'Lugar', 'Acciones'].map((head) => (
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
            {resultados.map((resultado) => (
              <TableRow
                key={resultado.id}
                sx={{ '&:hover': { backgroundColor: '#FAFAFF' }, transition: 'background-color 0.3s' }}
              >
                <TableCell sx={{ color: '#333333' }}>
                  {resultado.fechaEvento ? new Date(resultado.fechaEvento).toLocaleDateString('es-ES') : 'Sin fecha'}
                </TableCell>
                <TableCell sx={{ color: '#333333' }}>{resultado.nombreEvento || 'Sin nombre'}</TableCell>
                <TableCell sx={{ color: '#333333' }}>{resultado.disciplina || 'Sin disciplina'}</TableCell>
                <TableCell sx={{ color: '#333333' }}>{resultado.resultado || 'Sin resultado'}</TableCell>
                <TableCell sx={{ color: '#333333' }}>{resultado.lugar || 'Sin lugar'}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleViewDetails(resultado.id)}
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

      {resultados.length === 0 && !errorMessage && (
        <Typography variant="body1" align="center" sx={{ mt: 2, color: '#7A4069' }}>
          No hay resultados disponibles.
        </Typography>
      )}
    </Container>
  );
};

export default ResultadosAtleta;