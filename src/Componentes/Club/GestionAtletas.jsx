import React, { useState, useEffect } from 'react';
import MenuItem from '@mui/material/MenuItem';
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../Autenticacion/AuthContext'; // Ajusta la ruta
import { useNavigate } from 'react-router-dom';

const GestionAtletas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [atletas, setAtletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', edad: '', contacto: '', estado: 'activo' });
  const [editIndex, setEditIndex] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [atletasSolicitudes, setAtletasSolicitudes] = useState([]);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    fetchAtletas();
    fetchSolicitudes();
  }, [user, navigate]);

  const fetchAtletas = async () => {
    try {
      setLoading(true);
      // Usar el endpoint del backend que filtra por clubId
      const response = await axios.get(`http://localhost:5000/api/registros/atletas?clubId=${user.id}`);
      setAtletas(response.data);
      setError('');
    } catch (error) {
      console.error('Error al obtener atletas:', error);
      setError('Error al cargar los atletas. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSolicitudes = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/registros/solicitudes-club?clubId=${user.id}`);
      const pendientes = res.data.filter(s => s.estado === 'pendiente');
      setSolicitudes(pendientes);
      // Obtener datos de los atletas para mostrar nombre
      const atletaIds = pendientes.map(s => s.atletaId);
      if (atletaIds.length > 0) {
        const atletasRes = await axios.get('http://localhost:5000/api/registros/atletas');
        setAtletasSolicitudes(atletasRes.data.filter(a => atletaIds.includes(a._id)));
      } else {
        setAtletasSolicitudes([]);
      }
    } catch {
      setSolicitudes([]);
      setAtletasSolicitudes([]);
    }
  };

  const handleSolicitud = async (solicitudId, estado) => {
    try {
      await axios.put(`http://localhost:5000/api/registros/solicitudes-club/${solicitudId}`, { estado });
      setError('Solicitud procesada correctamente.');
      fetchSolicitudes();
      fetchAtletas();
    } catch {
      setError('Error al procesar la solicitud. Intente de nuevo.');
    }
  };

  const handleAddOrEdit = async () => {
    try {
      const url = editIndex !== null
        ? `https://backendd-q0zc.onrender.com/api/atletas/${atletas[editIndex]._id}`
        : `https://backendd-q0zc.onrender.com/api/atletas`;
      const method = editIndex !== null ? 'put' : 'post';
      await axios({
        method,
        url,
        data: { ...formData, clubId: user.id },
        headers: { 'Content-Type': 'application/json' },
      });
      setOpenModal(false);
      setFormData({ nombre: '', edad: '', contacto: '', estado: 'activo' });
      setEditIndex(null);
      fetchAtletas();
    } catch (error) {
      console.error('Error al guardar atleta:', error);
      setError('Error al guardar el atleta. Intente de nuevo.');
    }
  };

  const handleDelete = async (index) => {
    try {
      await axios.delete(`https://backendd-q0zc.onrender.com/api/atletas/${atletas[index]._id}`);
      const newAtletas = atletas.filter((_, i) => i !== index);
      setAtletas(newAtletas);
      setError('');
    } catch (error) {
      console.error('Error al eliminar atleta:', error);
      setError('Error al eliminar el atleta. Intente de nuevo.');
    }
  };

  const handleOpenModal = (index = null) => {
    if (index !== null) {
      setFormData({ ...atletas[index] });
      setEditIndex(index);
    } else {
      setFormData({ nombre: '', edad: '', contacto: '', estado: 'activo' });
      setEditIndex(null);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({ nombre: '', edad: '', contacto: '', estado: 'activo' });
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
        Gestión de Atletas
      </Typography>

      {/* Solicitudes pendientes */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold', mb: 2 }}>
          Solicitudes de Atletas para unirse al Club
        </Typography>
        {solicitudes.length === 0 ? (
          <Typography>No hay solicitudes pendientes.</Typography>
        ) : (
          <List>
            {solicitudes.map((sol) => {
              const atleta = atletasSolicitudes.find(a => a._id === sol.atletaId);
              return (
                <ListItem key={sol._id} divider>
                  <ListItemText
                    primary={atleta ? `${atleta.nombre} ${atleta.apellidopa || ''} ${atleta.apellidoma || ''}` : 'Atleta desconocido'}
                    secondary={`Solicitud: ${sol.tipo === 'asociar' ? 'Unirse al club' : 'Ser independiente'}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton color="success" onClick={() => handleSolicitud(sol._id, 'aceptada')}><CheckIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleSolicitud(sol._id, 'rechazada')}><CloseIcon /></IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>

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
          Agregar Atleta
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 2, borderRadius: '12px', background: '#FFFFFF' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Edad</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Contacto</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {atletas.map((atleta, index) => (
              <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#FAFAFF' }, transition: 'background-color 0.3s' }}>
                <TableCell sx={{ color: '#333333' }}>{atleta.nombre}</TableCell>
                <TableCell sx={{ color: '#333333' }}>{atleta.edad}</TableCell>
                <TableCell sx={{ color: '#333333' }}>{atleta.contacto}</TableCell>
                <TableCell sx={{ color: '#333333' }}>{atleta.estado}</TableCell>
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
            {editIndex !== null ? 'Editar Atleta' : 'Agregar Atleta'}
          </Typography>
          <TextField
            fullWidth
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#FAFAFF', '&:hover fieldset': { borderColor: '#7A4069' }, '&.Mui-focused fieldset': { borderColor: '#7A4069', boxShadow: '0 0 8px rgba(122, 64, 105, 0.3)' } }, '& .MuiInputLabel-root': { color: '#7A4069', fontWeight: '500' }, '& .MuiInputLabel-root.Mui-focused': { color: '#7A4069' } }}
          />
          <TextField
            fullWidth
            label="Edad"
            name="edad"
            type="number"
            value={formData.edad}
            onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#FAFAFF', '&:hover fieldset': { borderColor: '#7A4069' }, '&.Mui-focused fieldset': { borderColor: '#7A4069', boxShadow: '0 0 8px rgba(122, 64, 105, 0.3)' } }, '& .MuiInputLabel-root': { color: '#7A4069', fontWeight: '500' }, '& .MuiInputLabel-root.Mui-focused': { color: '#7A4069' } }}
          />
          <TextField
            fullWidth
            label="Contacto"
            name="contacto"
            value={formData.contacto}
            onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#FAFAFF', '&:hover fieldset': { borderColor: '#7A4069' }, '&.Mui-focused fieldset': { borderColor: '#7A4069', boxShadow: '0 0 8px rgba(122, 64, 105, 0.3)' } }, '& .MuiInputLabel-root': { color: '#7A4069', fontWeight: '500' }, '& .MuiInputLabel-root.Mui-focused': { color: '#7A4069' } }}
          />
          <TextField
            fullWidth
            select
            label="Estado"
            name="estado"
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#FAFAFF', '&:hover fieldset': { borderColor: '#7A4069' }, '&.Mui-focused fieldset': { borderColor: '#7A4069', boxShadow: '0 0 8px rgba(122, 64, 105, 0.3)' } }, '& .MuiInputLabel-root': { color: '#7A4069', fontWeight: '500' }, '& .MuiInputLabel-root.Mui-focused': { color: '#7A4069' } }}
          >
            <MenuItem value="activo">Activo</MenuItem>
            <MenuItem value="inactivo">Inactivo</MenuItem>
          </TextField>
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
    </Container>
  );
};

export default GestionAtletas;