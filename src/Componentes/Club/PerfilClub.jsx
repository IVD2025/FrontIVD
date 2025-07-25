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
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../Autenticacion/AuthContext'; // Ajusta la ruta
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

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    fetchClubData();
  }, [user, navigate]);

  const fetchClubData = async () => {
    try {
      setLoading(true);
      // Obtener datos del club desde la colección club
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
        Perfil del Club
      </Typography>

      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity={errorMessage.includes('exitosamente') || errorMessage.includes('procesada') ? 'success' : 'error'} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        </Box>
      )}

      <Paper elevation={3} sx={{ p: 4, borderRadius: '12px', background: '#FFFFFF', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
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
    </Container>
  );
};

export default PerfilClub;