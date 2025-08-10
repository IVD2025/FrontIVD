import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAuth } from './AuthContext'; 
import { FaEye, FaEyeSlash } from 'react-icons/fa';  
import { TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const MySwal = withReactContent(Swal);

// URL base del backend
const API_BASE_URL = "http://localhost:5000";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [rol, setRol] = useState("atleta");
  const [curp, setCurp] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Datos enviados al backend:", { rol, curp, correo, password });

    if (Object.keys(formErrors).length > 0) {
      MySwal.fire({
        icon: "error",
        title: "Errores en el formulario",
        text: "Por favor, corrige los errores antes de continuar.",
      });
      return;
    }

    try {
      let payload;
      if (rol === "atleta") {
        payload = { rol, curp, password };
      } else {
        payload = { rol, correo, password };
      }

      const response = await axios.post(`${API_BASE_URL}/api/login`, payload, {
        withCredentials: true
      });

      console.log("Respuesta del backend:", response.data);
      const { message, tipo, user } = response.data;

      if (message === 'Inicio de sesión exitoso') {
        login(user.curp, tipo, user);
        let ruta;
        switch (tipo.toLowerCase()) {
          case 'atleta':
            ruta = '/atleta';
            break;
          case 'club':
            ruta = '/club';
            break;
          case 'entrenador':
            ruta = '/entrenador';
            break;
          case 'administrador':
            ruta = '/administrador';
            break;
          default:
            ruta = '/';
        }
        navigate(ruta); 
        MySwal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Inicio de sesión exitoso',
        });
      }
    } catch (error) {
      console.error("Error en el login:", error.response ? error.response.data : error.message);
      if (error.response) {
        const { error: serverError } = error.response.data;

        if (serverError === 'Usuario no encontrado') {
          MySwal.fire({
            icon: 'error',
            title: 'Usuario No Encontrado',
            text: rol === 'atleta' ? 'La CURP ingresada no existe.' : 'El correo ingresado no existe.',
          });
        } else if (serverError === 'Rol no válido o no definido') {
          MySwal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El rol asociado al usuario no es válido.',
          });
        } else if (serverError === 'Usuario o contraseña incorrecta') {
          MySwal.fire({
            icon: 'error',
            title: 'Error',
            text: serverError,
          });
        } else {
          MySwal.fire({
            icon: 'error',
            title: 'Error',
            text: serverError || 'Error al iniciar sesión. Inténtalo de nuevo.',
          });
        }
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al iniciar sesión. Inténtalo de nuevo más tarde.',
        });
      }
    }
  };

  const estilos = {
    contenedorPrincipal: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#FFFFFF', // Fondo blanco puro en lugar de imagen
      padding: '20px',
    },
    contenedorLogin: {
      backgroundColor: '#F5E8C7', // Beige claro para el contenedor
      borderRadius: '8px',
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      maxWidth: '400px',
      width: '100%',
      padding: '25px',
      flexDirection: 'column',
    },
    contenedorFormulario: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    titulo: {
      fontSize: '24px',
      marginBottom: '20px',
      color: '#800020', // Granada/vino para el título
      textAlign: 'center',
      fontWeight: '600',
      fontFamily: "'Arial', 'Helvetica', sans-serif",
    },
    campo: {
      marginBottom: '15px',
      position: 'relative',
    },
    etiqueta: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: '500',
      color: '#333333',
      fontFamily: "'Arial', 'Helvetica', sans-serif",
    },
    input: {
      width: '100%',
      padding: '10px 40px 10px 10px',
      borderRadius: '5px',
      border: '1px solid #B0BEC5',
      fontSize: '14px',
      boxSizing: 'border-box',
      fontFamily: "'Arial', 'Helvetica', sans-serif",
    },
    boton: {
      backgroundColor: '#800020', // Granada/vino para el botón
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '5px',
      padding: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      fontFamily: "'Arial', 'Helvetica', sans-serif",
      '&:hover': {
        backgroundColor: '#A52A2A', // Tono más claro para hover
      },
    },
    enlace: {
      display: 'block',
      marginTop: '12px',
      textDecoration: 'none',
      color: '#7A4069', // Morado medio para enlaces
      fontSize: '12px',
      textAlign: 'center',
      fontFamily: "'Arial', 'Helvetica', sans-serif",
    },
    error: {
      color: '#D32F2F', // Rojo oscuro para errores
      fontSize: '12px',
      marginTop: '5px',
      fontFamily: "'Arial', 'Helvetica', sans-serif",
    },
    icono: {
      position: 'absolute',
      top: '50%',
      right: '12px',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      color: '#666',
    },
  };

  return (
    <div style={estilos.contenedorPrincipal}>
      <div style={estilos.contenedorLogin}>
        <div style={estilos.contenedorFormulario}>
          <h2 style={estilos.titulo}>Iniciar Sesión</h2>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mb: 2, '& .MuiInputLabel-root': { color: '#7A4069', fontFamily: "'Arial', 'Helvetica', sans-serif" }, '& .MuiInputLabel-root.Mui-focused': { color: '#800020' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#7A4069' }, '&:hover fieldset': { borderColor: '#800020' }, '&.Mui-focused fieldset': { borderColor: '#800020' } } }}>
              <InputLabel>Rol</InputLabel>
              <Select value={rol} onChange={e => setRol(e.target.value)} label="Rol" sx={{ fontFamily: "'Arial', 'Helvetica', sans-serif", color: '#7A4069' }}>
                <MenuItem value="atleta">Atleta</MenuItem>
                <MenuItem value="club">Club</MenuItem>
                <MenuItem value="entrenador">Entrenador</MenuItem>
                <MenuItem value="administrador">Administrador</MenuItem>
              </Select>
            </FormControl>
            {rol === "atleta" ? (
              <TextField
                fullWidth
                label="CURP"
                value={curp}
                onChange={e => setCurp(e.target.value)}
                sx={{ mb: 2, background: '#FFF', '& .MuiInputLabel-root': { color: '#7A4069', fontFamily: "'Arial', 'Helvetica', sans-serif" }, '& .MuiInputLabel-root.Mui-focused': { color: '#800020' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#7A4069' }, '&:hover fieldset': { borderColor: '#800020' }, '&.Mui-focused fieldset': { borderColor: '#800020' }, color: '#7A4069', fontFamily: "'Arial', 'Helvetica', sans-serif" } }}
                required
              />
            ) : (
              <TextField
                fullWidth
                label="Correo"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                sx={{ mb: 2, background: '#FFF', '& .MuiInputLabel-root': { color: '#7A4069', fontFamily: "'Arial', 'Helvetica', sans-serif" }, '& .MuiInputLabel-root.Mui-focused': { color: '#800020' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#7A4069' }, '&:hover fieldset': { borderColor: '#800020' }, '&.Mui-focused fieldset': { borderColor: '#800020' }, color: '#7A4069', fontFamily: "'Arial', 'Helvetica', sans-serif" } }}
                required
                type="email"
              />
            )}
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              sx={{ mb: 2, '& .MuiInputLabel-root': { color: '#7A4069', fontFamily: "'Arial', 'Helvetica', sans-serif" }, '& .MuiInputLabel-root.Mui-focused': { color: '#800020' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#7A4069' }, '&:hover fieldset': { borderColor: '#800020' }, '&.Mui-focused fieldset': { borderColor: '#800020' }, color: '#7A4069', fontFamily: "'Arial', 'Helvetica', sans-serif" } }}
              required
              InputProps={{
                endAdornment: (
                  <span style={{ cursor: 'pointer' }} onClick={handleTogglePasswordVisibility}>
                    {showPassword ? <FaEyeSlash color="#800020" /> : <FaEye color="#800020" />}
                  </span>
                ),
              }}
            />
            <Button type="submit" variant="contained" fullWidth style={estilos.boton}>
              Iniciar Sesión
            </Button>
            <Link to="/recuperar-correo" style={{
              display: 'block',
              marginTop: 16,
              color: '#7A4069',
              textAlign: 'center',
              fontWeight: 'bold',
              fontFamily: "'Arial', 'Helvetica', sans-serif",
              fontSize: '14px',
              textDecoration: 'underline',
            }}>
              ¿Olvidaste tu contraseña?
            </Link>
            <Link to="/registro" style={estilos.enlace}>Regístrate</Link>
            <Link to="/registro-entrenador" style={estilos.enlace}>Registrar Entrenador</Link>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;