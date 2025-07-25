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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, People as PeopleIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { es } from 'date-fns/locale';
import axios from 'axios';
import { useAuth } from '../Autenticacion/AuthContext'; // Ajusta la ruta
import { useNavigate } from 'react-router-dom';

const Eventos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', fecha: null, tipo: '', participantes: 1 });
  const [editIndex, setEditIndex] = useState(null);
  const [modalInscritosOpen, setModalInscritosOpen] = useState(false);
  const [inscritos, setInscritos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [loadingInscritos, setLoadingInscritos] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    fetchEventos();
  }, [user, navigate]);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://backendd-q0zc.onrender.com/api/eventos?clubId=${user.id}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      setEventos(response.data);
      setError('');
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      setError('Error al cargar los eventos. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrEdit = async () => {
    try {
      const url = editIndex !== null
        ? `https://backendd-q0zc.onrender.com/api/eventos/${eventos[editIndex]._id}`
        : `https://backendd-q0zc.onrender.com/api/eventos`;
      const method = editIndex !== null ? 'put' : 'post';
      await axios({
        method,
        url,
        data: { ...formData, clubId: user.id },
        headers: { 'Content-Type': 'application/json' },
      });
      setOpenModal(false);
      setFormData({ nombre: '', fecha: null, tipo: '', participantes: 1 });
      setEditIndex(null);
      fetchEventos();
    } catch (error) {
      console.error('Error al guardar evento:', error);
      setError('Error al guardar el evento. Intente de nuevo.');
    }
  };

  const handleDelete = async (index) => {
    try {
      await axios.delete(`https://backendd-q0zc.onrender.com/api/eventos/${eventos[index]._id}`);
      const newEventos = eventos.filter((_, i) => i !== index);
      setEventos(newEventos);
      setError('');
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      setError('Error al eliminar el evento. Intente de nuevo.');
    }
  };

  const handleOpenModal = (index = null) => {
    if (index !== null) {
      setFormData({ ...eventos[index] });
      setEditIndex(index);
    } else {
      setFormData({ nombre: '', fecha: null, tipo: '', participantes: 1 });
      setEditIndex(null);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({ nombre: '', fecha: null, tipo: '', participantes: 1 });
    setEditIndex(null);
  };

  const handleVerInscritos = async (evento) => {
    setEventoSeleccionado(evento);
    setModalInscritosOpen(true);
    setLoadingInscritos(true);
    try {
      const response = await axios.get(`https://backendd-q0zc.onrender.com/api/inscripciones?eventoId=${evento._id}`);
      // Filtrar solo los atletas cuyo club coincida con el club logueado
      const soloClub = response.data.filter(i => (i.datosAtleta?.club || '').toLowerCase() === (user.nombre || '').toLowerCase() || (i.datosAtleta?.clubId === user.id));
      setInscritos(soloClub);
    } catch (error) {
      setInscritos([]);
    } finally {
      setLoadingInscritos(false);
    }
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
        Gestión de Eventos
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
          Agregar Evento
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 2, borderRadius: '12px', background: '#FFFFFF' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Participantes</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#800020' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {eventos.map((evento, index) => (
              <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#FAFAFF' }, transition: 'background-color 0.3s' }}>
                <TableCell sx={{ color: '#333333' }}>{evento.nombre}</TableCell>
                <TableCell sx={{ color: '#333333' }}>{new Date(evento.fecha).toLocaleDateString('es-ES')}</TableCell>
                <TableCell sx={{ color: '#333333' }}>{evento.tipo}</TableCell>
                <TableCell sx={{ color: '#333333' }}>{evento.participantes}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenModal(index)} color="primary" sx={{ '&:hover': { backgroundColor: 'rgba(128, 0, 32, 0.1)' } }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(index)} color="error" sx={{ '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' } }}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton onClick={() => handleVerInscritos(evento)} color="success" title="Ver Inscritos" sx={{ ml: 1 }}>
                    <PeopleIcon />
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
              {editIndex !== null ? 'Editar Evento' : 'Agregar Evento'}
            </Typography>
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#FAFAFF', '&:hover fieldset': { borderColor: '#7A4069' }, '&.Mui-focused fieldset': { borderColor: '#7A4069', boxShadow: '0 0 8px rgba(122, 64, 105, 0.3)' } }, '& .MuiInputLabel-root': { color: '#7A4069', fontWeight: '500' }, '& .MuiInputLabel-root.Mui-focused': { color: '#7A4069' } }}
            />
            <DatePicker
              label="Fecha"
              value={formData.fecha ? new Date(formData.fecha) : null}
              onChange={(newValue) => setFormData({ ...formData, fecha: newValue })}
              slotProps={{ textField: { fullWidth: true, sx: { mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#FAFAFF', '&:hover fieldset': { borderColor: '#7A4069' }, '&.Mui-focused fieldset': { borderColor: '#7A4069', boxShadow: '0 0 8px rgba(122, 64, 105, 0.3)' } }, '& .MuiInputLabel-root': { color: '#7A4069', fontWeight: '500' }, '& .MuiInputLabel-root.Mui-focused': { color: '#7A4069' } } }}}
            />
            <TextField
              fullWidth
              select
              label="Tipo"
              name="tipo"
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#FAFAFF', '&:hover fieldset': { borderColor: '#7A4069' }, '&.Mui-focused fieldset': { borderColor: '#7A4069', boxShadow: '0 0 8px rgba(122, 64, 105, 0.3)' } }, '& .MuiInputLabel-root': { color: '#7A4069', fontWeight: '500' }, '& .MuiInputLabel-root.Mui-focused': { color: '#7A4069' } }}
            >
              <MenuItem value="Torneo">Torneo</MenuItem>
              <MenuItem value="Entrenamiento">Entrenamiento</MenuItem>
              <MenuItem value="Reunión">Reunión</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Participantes"
              name="participantes"
              type="number"
              value={formData.participantes}
              onChange={(e) => setFormData({ ...formData, participantes: e.target.value })}
              inputProps={{ min: 1, max: 100 }}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#FAFAFF', '&:hover fieldset': { borderColor: '#7A4069' }, '&.Mui-focused fieldset': { borderColor: '#7A4069', boxShadow: '0 0 8px rgba(122, 64, 105, 0.3)' } }, '& .MuiInputLabel-root': { color: '#7A4069', fontWeight: '500' }, '& .MuiInputLabel-root.Mui-focused': { color: '#7A4069' } }}
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

      {/* Modal de Inscritos */}
      <Dialog open={modalInscritosOpen} onClose={() => setModalInscritosOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Atletas inscritos de tu club en "{eventoSeleccionado?.nombre}"</DialogTitle>
        <DialogContent>
          {loadingInscritos ? (
            <CircularProgress />
          ) : inscritos.length === 0 ? (
            <Typography variant="body2">No hay atletas de tu club inscritos en este evento.</Typography>
          ) : (
            <List>
              {inscritos.map((p, idx) => (
                <ListItem key={idx} divider>
                  <ListItemText
                    primary={`${p.datosAtleta?.nombre || ''} ${p.datosAtleta?.apellidopa || ''} ${p.datosAtleta?.apellidoma || ''}`}
                    secondary={
                      <>
                        <b>CURP:</b> {p.datosAtleta?.curp || ''} <br />
                        <b>Sexo:</b> {p.datosAtleta?.sexo || ''} <br />
                        <b>Fecha de Nacimiento:</b> {p.datosAtleta?.fechaNacimiento || ''}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalInscritosOpen(false)} color="secondary">Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Eventos;