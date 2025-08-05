import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Check as CheckIcon, 
  Close as CloseIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../Autenticacion/AuthContext';
import { useNavigate } from 'react-router-dom';

const PerfilClub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clubData, setClubData] = useState({
    NombreEmpresa: '',
    Descripcion: '',
    Contacto: '',
    Logo: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [solicitudes, setSolicitudes] = useState([]);
  const [atletas, setAtletas] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [loadingAtletas, setLoadingAtletas] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [modalSolicitudOpen, setModalSolicitudOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    fetchClubData();
    fetchSolicitudes();
    fetchAtletas();
  }, [user, navigate]);

  const fetchClubData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/clubes/${user.id}`);
      const data = response.data;
      setClubData({
        nombre: data.nombre || '',
        gmail: data.gmail || '',
        telefono: data.telefono || '',
      });
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Error al cargar el perfil. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSolicitudes = async () => {
    try {
      setLoadingSolicitudes(true);
      const response = await axios.get(`http://localhost:5000/api/registros/solicitudes-club?clubId=${user.id}`);
      setSolicitudes(response.data);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      setSolicitudes([]);
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  const fetchAtletas = async () => {
    try {
      setLoadingAtletas(true);
      const response = await axios.get(`http://localhost:5000/api/registros/atletas-club?clubId=${user.id}`);
      setAtletas(response.data);
    } catch (error) {
      console.error('Error al cargar atletas:', error);
      setAtletas([]);
    } finally {
      setLoadingAtletas(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClubData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/clubes/${user.id}`, {
        nombre: clubData.nombre,
        gmail: clubData.gmail,
        telefono: clubData.telefono,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      setEditMode(false);
      setErrorMessage('Perfil actualizado exitosamente.');
      fetchClubData();
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      setErrorMessage('Error al guardar el perfil. Intente de nuevo.');
    }
  };

  const handleAceptarSolicitud = async (solicitudId) => {
    try {
      await axios.put(`http://localhost:5000/api/registros/solicitudes-club/${solicitudId}`, {
        estado: 'aceptada'
      });
      setErrorMessage('Solicitud aceptada exitosamente.');
      await fetchSolicitudes();
      await fetchAtletas();
      setModalSolicitudOpen(false);
      setSolicitudSeleccionada(null);
    } catch (error) {
      setErrorMessage('Error al aceptar la solicitud.');
    }
  };

  const handleRechazarSolicitud = async (solicitudId) => {
    try {
      await axios.put(`http://localhost:5000/api/registros/solicitudes-club/${solicitudId}`, {
        estado: 'rechazada'
      });
      setErrorMessage('Solicitud rechazada.');
      await fetchSolicitudes();
      setModalSolicitudOpen(false);
      setSolicitudSeleccionada(null);
    } catch (error) {
      setErrorMessage('Error al rechazar la solicitud.');
    }
  };

  const handleVerSolicitud = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setModalSolicitudOpen(true);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente');

  return (
    <Container maxWidth="lg" sx={{ py: 4, background: '#F5E8C7', minHeight: '100vh', fontFamily: "'Arial', 'Helvetica', sans-serif" }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: '#800020', fontWeight: 'bold' }}>
        Perfil del Club
      </Typography>

      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity={errorMessage.includes('exitosamente') || errorMessage.includes('aceptada') || errorMessage.includes('rechazada') ? 'success' : 'error'} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Información del Club */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: '12px', background: '#FFFFFF', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold', mb: 3 }}>
              Información del Club
            </Typography>

            <Box sx={{ mb: 3, textAlign: 'center' }}>
              {clubData.Logo && (
                <img src={clubData.Logo} alt="Logo del Club" style={{ width: '150px', height: '150px', borderRadius: '50%', mb: 2 }} />
              )}
            </Box>

            <TextField
              fullWidth
              label="Nombre del Club"
              name="nombre"
              value={clubData.nombre}
              onChange={handleInputChange}
              disabled={!editMode}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: editMode ? '#FAFAFF' : 'transparent', '&:hover fieldset': { borderColor: '#7A4069' }, '&.Mui-focused fieldset': { borderColor: '#7A4069', boxShadow: '0 0 8px rgba(122, 64, 105, 0.3)' } }, '& .MuiInputLabel-root': { color: '#7A4069', fontWeight: '500' }, '& .MuiInputLabel-root.Mui-focused': { color: '#7A4069' } }}
            />
            <TextField
              fullWidth
              label="Correo Electrónico"
              name="gmail"
              value={clubData.gmail}
              onChange={handleInputChange}
              disabled={!editMode}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: editMode ? '#FAFAFF' : 'transparent', '&:hover fieldset': { borderColor: '#7A4069' }, '&.Mui-focused fieldset': { borderColor: '#7A4069', boxShadow: '0 0 8px rgba(122, 64, 105, 0.3)' } }, '& .MuiInputLabel-root': { color: '#7A4069', fontWeight: '500' }, '& .MuiInputLabel-root.Mui-focused': { color: '#7A4069' } }}
            />
            <TextField
              fullWidth
              label="Teléfono"
              name="telefono"
              value={clubData.telefono}
              onChange={handleInputChange}
              disabled={!editMode}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: editMode ? '#FAFAFF' : 'transparent', '&:hover fieldset': { borderColor: '#7A4069' }, '&.Mui-focused fieldset': { borderColor: '#7A4069', boxShadow: '0 0 8px rgba(122, 64, 105, 0.3)' } }, '& .MuiInputLabel-root': { color: '#7A4069', fontWeight: '500' }, '& .MuiInputLabel-root.Mui-focused': { color: '#7A4069' } }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              {editMode ? (
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
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
              ) : (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
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
                  Editar
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Solicitudes Pendientes */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: '12px', background: '#FFFFFF', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <PersonAddIcon sx={{ color: '#800020' }} />
              <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold' }}>
                Solicitudes Pendientes
              </Typography>
              {solicitudesPendientes.length > 0 && (
                <Chip 
                  label={solicitudesPendientes.length} 
                  color="warning" 
                  size="small"
                />
              )}
            </Box>

            {loadingSolicitudes ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={30} />
              </Box>
            ) : solicitudesPendientes.length === 0 ? (
              <Alert severity="info">
                No hay solicitudes pendientes en este momento.
              </Alert>
            ) : (
              <List>
                {solicitudesPendientes.map((solicitud) => (
                  <ListItem 
                    key={solicitud._id} 
                    sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '8px', 
                      mb: 1,
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#800020' }}>
                            {solicitud.datosAtleta?.nombre?.charAt(0) || 'A'}
                          </Avatar>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {solicitud.datosAtleta?.nombreCompleto || 'Atleta'}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Edad:</strong> {solicitud.datosAtleta?.edad || 'N/A'} años
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Género:</strong> {solicitud.datosAtleta?.genero || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Fecha:</strong> {formatearFecha(solicitud.fechaSolicitud)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          color="success"
                          onClick={() => handleAceptarSolicitud(solicitud._id)}
                          title="Aceptar solicitud"
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleRechazarSolicitud(solicitud._id)}
                          title="Rechazar solicitud"
                        >
                          <CloseIcon />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => handleVerSolicitud(solicitud)}
                          title="Ver detalles"
                        >
                          <GroupIcon />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Atletas Miembros */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: '12px', background: '#FFFFFF', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <PeopleIcon sx={{ color: '#800020' }} />
              <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold' }}>
                Atletas Miembros
              </Typography>
              {atletas.length > 0 && (
                <Chip 
                  label={atletas.length} 
                  color="success" 
                  size="small"
                />
              )}
            </Box>

            {loadingAtletas ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={30} />
              </Box>
            ) : atletas.length === 0 ? (
              <Alert severity="info">
                No hay atletas registrados en este club.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {atletas.map((atleta) => (
                  <Grid item xs={12} sm={6} md={4} key={atleta._id}>
                    <Card variant="outlined" sx={{ borderColor: '#800020' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar sx={{ width: 48, height: 48, bgcolor: '#800020' }}>
                            {atleta.nombre?.charAt(0) || 'A'}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#800020' }}>
                              {atleta.nombre} {atleta.apellidopa}
                            </Typography>
                            <Chip 
                              icon={<CheckCircleIcon />}
                              label="Miembro Activo" 
                              color="success" 
                              size="small"
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Edad:</strong> {atleta.edad || 'N/A'} años
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Género:</strong> {atleta.sexo || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Teléfono:</strong> {atleta.telefono || 'N/A'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Modal de Detalles de Solicitud */}
      <Dialog 
        open={modalSolicitudOpen} 
        onClose={() => setModalSolicitudOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold' }}>
            Detalles de la Solicitud
          </Typography>
        </DialogTitle>
        <DialogContent>
          {solicitudSeleccionada && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: '#800020' }}>
                      {solicitudSeleccionada.datosAtleta?.nombre?.charAt(0) || 'A'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {solicitudSeleccionada.datosAtleta?.nombreCompleto || 'Atleta'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Solicitud para unirse al club
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Edad:</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {solicitudSeleccionada.datosAtleta?.edad || 'N/A'} años
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Género:</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {solicitudSeleccionada.datosAtleta?.genero || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Fecha de Solicitud:</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {formatearFecha(solicitudSeleccionada.fechaSolicitud)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>CURP:</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {solicitudSeleccionada.datosAtleta?.curp || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => handleRechazarSolicitud(solicitudSeleccionada?._id)}
            color="error"
            startIcon={<CancelIcon />}
          >
            Rechazar
          </Button>
          <Button 
            onClick={() => handleAceptarSolicitud(solicitudSeleccionada?._id)}
            color="success"
            startIcon={<CheckIcon />}
            variant="contained"
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PerfilClub;