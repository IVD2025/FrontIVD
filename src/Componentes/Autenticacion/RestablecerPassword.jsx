import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const API_BASE_URL = 'http://localhost:5000';

const RestablecerPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { gmail, code } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      Swal.fire({ icon: 'error', title: 'Campos vacíos', text: 'Completa ambos campos.' });
      return;
    }
    if (newPassword.length < 6) {
      Swal.fire({ icon: 'error', title: 'Contraseña débil', text: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire({ icon: 'error', title: 'No coinciden', text: 'Las contraseñas no coinciden.' });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/recuperar/reset-password`, { gmail, code, newPassword });
      Swal.fire({
        icon: 'success',
        title: 'Contraseña restablecida',
        text: 'Tu contraseña ha sido actualizada. Ahora puedes iniciar sesión.',
      });
      navigate('/login');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'No se pudo restablecer la contraseña. Intenta de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!gmail || !code) {
    return (
      <div style={{ maxWidth: 400, margin: '40px auto', background: '#F5E8C7', padding: 24, borderRadius: 12 }}>
        <h2 style={{ color: '#800020', textAlign: 'center' }}>Restablecer Contraseña</h2>
        <p style={{ color: '#800020', textAlign: 'center' }}>Acceso inválido. Por favor, inicia el proceso de recuperación desde tu correo.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', background: '#F5E8C7', padding: 24, borderRadius: 12 }}>
      <h2 style={{ color: '#800020', textAlign: 'center' }}>Restablecer Contraseña</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ccc', marginBottom: 16 }}
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ccc', marginBottom: 16 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', background: '#800020', color: '#fff', padding: 12, border: 'none', borderRadius: 6, fontWeight: 'bold' }}
        >
          {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
        </button>
      </form>
    </div>
  );
};

export default RestablecerPassword; 