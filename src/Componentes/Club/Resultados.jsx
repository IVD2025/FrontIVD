import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Modal,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { es } from 'date-fns/locale';
import axios from 'axios';
import { useAuth } from '../Autenticacion/AuthContext'; // Ajusta la ruta
import { useNavigate } from 'react-router-dom';

const Resultados = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({ evento: '', atleta: '', posicion: '', tiempo: '', fecha: null });
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    fetchResultados();
  }, [user, navigate]);

  const fetchResultados = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://backendd-q0zc.onrender.com/api/resultados?clubId=${user.id}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      setResultados(response.data);
      setError('');
    } catch (error) {
      console.error('Error al obtener resultados:', error);
      setError('Error al cargar los resultados. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrEdit = async () => {
    try {
      const url = editIndex !== null
        ? `https://backendd-q0zc.onrender.com/api/resultados/${resultados[editIndex]._id}`
        : `https://backendd-q0zc.onrender.com/api/resultados`;
      const method = editIndex !== null ? 'put' : 'post';
      await axios({
        method,
        url,
        data: { ...formData, clubId: user.id },
        headers: { 'Content-Type': 'application/json' },
      });
      setOpenModal(false);
      setFormData({ evento: '', atleta: '', posicion: '', tiempo: '', fecha: null });
      setEditIndex(null);
      fetchResultados();
    } catch (error) {
      console.error('Error al guardar resultado:', error);
      setError('Error al guardar el resultado. Intente de nuevo.');
    }
  };

  const handleDelete = async (index) => {
    try {
      await axios.delete(`https://backendd-q0zc.onrender.com/api/resultados/${resultados[index]._id}`);
      const newResultados = resultados.filter((_, i) => i !== index);
      setResultados(newResultados);
      setError('');
    } catch (error) {
      console.error('Error al eliminar resultado:', error);
      setError('Error al eliminar el resultado. Intente de nuevo.');
    }
  };

  const handleOpenModal = (index = null) => {
    if (index !== null) {
      setFormData({ ...resultados[index] });
      setEditIndex(index);
    } else {
      setFormData({ evento: '', atleta: '', posicion: '', tiempo: '', fecha: null });
      setEditIndex(null);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({ evento: '', atleta: '', posicion: '', tiempo: '', fecha: null });
    setEditIndex(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, background: '#F5E8C7', minHeight: '100vh', fontFamily: "'Arial', 'Helvetica', sans-serif" }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: '#800020', fontWeight: 'bold' }}>
        Gestión de Resultados
      </Typography>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Box>
      )}

      <Box sx={{ mb: 2, textAlign: 'right' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{
            background: '#800020',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            '&:hover': {
              background: '#7A4069',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(122, 64, 105, 0.3)',
            },
          }}
        >
          Agregar Resultado
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 2, borderRadius: '12px', background: '#FFFFFF' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Evento</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Atleta</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Posición</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Tiempo</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resultados.map((resultado, index) => (
              <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#FAFAFF' }, transition: 'background-color 0.3s' }}>
                <TableCell sx={{ color: '#333333' }}>{resultado.evento}</TableCell>
                <TableCell sx={{ color: '#333333' }}>{resultado.atleta}</TableCell>
                <TableCell sx={{ color: '#333333' }}>{resultado.posicion}</TableCell>
                <TableCell sx={{ color: '#333333' }}>{resultado.tiempo}</TableCell>
                <TableCell sx={{ color: '#333333' }}>{new Date(resultado.fecha).toLocaleDateString('es-ES')}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenModal(index)} color="primary" sx={{ '&:hover': { backgroundColor: 'rgba(128, 0, 32, 0.1)' } }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(index)} color="error" sx={{ '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' } }}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
              p: 4,
              borderRadius: '12px',
              fontFamily: "'Arial', 'Helvetica', sans-serif",
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: '#800020', fontWeight: 'bold' }}>
              {editIndex !== null ? 'Editar Resultado' : 'Agregar Resultado'}
            </Typography>
            <TextField
              fullWidth
              label="Evento"
              name="evento"
              value={formData.evento}
              onChange={(e) => setFormData({ ...formData, evento: e.target.value })}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#FAFAFF', '&:hover fieldset': { borderColor: '#7A4069' }, '&.Mui-focused fieldset': { borderColor: '#7A4069', boxShadow: '0 0 8px rgba(122, 64, 105, 0.3)' } }, '& .MuiInputLabel-root': { color: '#7A4069', fontWeight: '500' }, '& .MuiInputLabel-root.Mui-focused': { color: '#7A4069' } }}
            />
            <TextField
              fullWidth
              label="Atleta"
              name="atleta"
              value={formData.atleta}
              onChange={(e) => setFormData({ ...formData, atleta: e.target.value })}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#FAFAFF', '&:hover fieldset': { borderColor: '#7A4069' }, '&.Mui-focused fieldset': { borderColor: '#7A4069', boxShadow: '0 0 8px rgba(122, 64, 105, 0.3)' } }, '& .MuiInputLabel-root': { color: '#7A4069', fontWeight: '500' }, '& .MuiInputLabel-root.Mui-focused': { color: '#7A4069' } }}
            />
            <TextField
              fullWidth
              label="Posición"
              name="posicion"
              value={formData.posicion}
              onChange={(e) => setFormData({ ...formData, posicion: e.target.value })}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#FAFAFF', '&:hover fieldset': { borderColor: '#7A4069' }, '&.Mui-focused fieldset': { borderColor: '#7A4069', boxShadow: '0 0 8px rgba(122, 64, 105, 0.3)' } }, '& .MuiInputLabel-root': { color: '#7A4069', fontWeight: '500' }, '& .MuiInputLabel-root.Mui-focused': { color: '#7A4069' } }}
            />
            <TextField
              fullWidth
              label="Tiempo (ej. 1:23.45)"
              name="tiempo"
              value={formData.tiempo}
              onChange={(e) => setFormData({ ...formData, tiempo: e.target.value })}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#FAFAFF', '&:hover fieldset': { borderColor: '#7A4069' }, '&.Mui-focused fieldset': { borderColor: '#7A4069', boxShadow: '0 0 8px rgba(122, 64, 105, 0.3)' } }, '& .MuiInputLabel-root': { color: '#7A4069', fontWeight: '500' }, '& .MuiInputLabel-root.Mui-focused': { color: '#7A4069' } }}
            />
            <DatePicker
              label="Fecha"
              value={formData.fecha ? new Date(formData.fecha) : null}
              onChange={(newValue) => setFormData({ ...formData, fecha: newValue })}
              slotProps={{ textField: { fullWidth: true, sx: { mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#FAFAFF', '&:hover fieldset': { borderColor: '#7A4069' }, '&.Mui-focused fieldset': { borderColor: '#7A4069', boxShadow: '0 0 8px rgba(122, 64, 105, 0.3)' } }, '& .MuiInputLabel-root': { color: '#7A4069', fontWeight: '500' }, '& .MuiInputLabel-root.Mui-focused': { color: '#7A4069' } } }}}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={handleCloseModal} variant="outlined" sx={{ color: '#7A4069', borderColor: '#7A4069', '&:hover': { borderColor: '#D32F2F', color: '#D32F2F' } }}>
                Cancelar
              </Button>
              <Button
                onClick={handleAddOrEdit}
                variant="contained"
                sx={{
                  background: '#800020',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: '#7A4069',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(122, 64, 105, 0.3)',
                  },
                }}
              >
                Guardar
              </Button>
            </Box>
          </Box>
        </Modal>
      </LocalizationProvider>
    </Container>
  );
};

export default Resultados;