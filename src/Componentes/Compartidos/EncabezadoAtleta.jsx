import React, { useState, useRef, useEffect } from 'react';
import { HomeOutlined, LogoutOutlined, UserOutlined, ShopOutlined, TrophyOutlined, NotificationOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../Autenticacion/AuthContext'; // Importa useAuth

const EncabezadoCliente = () => {
  const [active, setActive] = useState('inicio');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const { logout } = useAuth(); // Obtén la función logout del contexto

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/perfilEmpresa');
        const data = response.data;
        setNombreEmpresa(data.nombreEmpresa || 'Nombre no disponible');
        setLogoUrl(data.logo || '');
      } catch (error) {
        console.error('Error al obtener datos del perfil:', error);
      }
    };

    fetchPerfil();
  }, []);

  const handleClick = (option) => {
    setActive(option);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuClick = async (key) => {
    switch (key) {
      case 'home':
        navigate('/atleta');
        break;
      case 'eventos':
        navigate('/atleta/eventos');
        break;
      case 'resultadosA':
        navigate('/atleta/resultados');
        break;
      case 'convocatoria':
        navigate('/atleta/convocatoria');
        break;
      case 'perfilA':
        navigate('/atleta/perfil');
        break;
      case 'cerrarSesion':
        try {
          await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          localStorage.removeItem('user'); // Elimina el usuario del localStorage
          sessionStorage.removeItem('token'); // Elimina el token de la sesión
          logout(); // Actualiza el estado en AuthContext
          navigate('/'); // Redirige a la pantalla pública
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
        }
        break;
      default:
        console.log('Opción no reconocida:', key);
    }
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <style>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background-color: #800020; /* Granada/vino */
          color: #FFFFFF; /* Blanco */
          font-family: 'Arial', 'Helvetica', sans-serif; /* Tipografía aplicada al header */
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .logo {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .logo img {
          width: 100px; /* Aumentado para mejor visibilidad */
          height: 100px; /* Aumentado para mejor visibilidad */
          max-width: 100%; /* Ajuste dinámico */
          max-height: 100px; /* Límite máximo */
          margin-right: 10px; /* Espacio ajustado */
          object-fit: contain; /* Asegura que no se corte */
          border: none; /* Eliminamos el borde */
          box-shadow: none; /* Eliminamos la sombra */
        }

        .logo h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #FFFFFF; /* Blanco */
          margin: 0;
          font-family: 'Arial', 'Helvetica', sans-serif; /* Tipografía explícita */
        }

        .menu ul {
          display: flex;
          gap: 15px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .menu ul li {
          font-size: 1rem;
          cursor: pointer;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #FFFFFF; /* Blanco */
          transition: background-color 0.3s ease;
        }

        .menu ul li:hover {
          background-color: #F5E8C7; /* Beige claro */
          color: #333333; /* Gris oscuro */
          border-radius: 5px;
        }

        .menu ul li.active {
          background-color: #7A4069; /* Morado medio */
          color: #FFFFFF; /* Blanco */
          border-radius: 5px;
        }

        .mobile-menu-icon {
          display: none;
          flex-direction: column;
          cursor: pointer;
          gap: 4px;
        }

        .hamburger {
          width: 25px;
          height: 3px;
          background-color: #FFFFFF; /* Blanco */
          transition: background-color 0.3s ease;
        }

        @media (max-width: 768px) {
          .menu ul {
            display: none;
            flex-direction: column;
            position: fixed;
            top: 110px; /* Ajustado para el logo más grande */
            left: -100%;
            width: 70%;
            height: calc(100% - 110px); /* Ajustado para el logo */
            background-color: #800020; /* Granada/vino */
            padding: 20px;
            transition: left 0.3s ease-in-out;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.5);
            z-index: 999;
          }

          .menu.menu-open ul {
            display: flex;
            left: 0;
          }

          .mobile-menu-icon {
            display: flex;
          }

          .logo img {
            width: 80px; /* Ajustado para móvil */
            height: 80px; /* Ajustado para móvil */
            max-height: 80px; /* Límite máximo */
            margin-right: 10px; /* Espacio ajustado */
            border: none; /* Eliminamos el borde */
            box-shadow: none; /* Eliminamos la sombra */
          }

          .logo h3 {
            font-size: 1rem; /* Ajustado para móvil */
            font-family: 'Arial', 'Helvetica', sans-serif; /* Tipografía explícita en móvil */
          }
        }
      `}</style>

      <header className="header">
        <div className="logo">
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo de la Empresa"
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '50%',
                border: '3px solid #800020',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                marginRight: '10px',
              }}
            />
          )}
          <h3>{nombreEmpresa}</h3>
        </div>
        <nav className={`menu ${isMobileMenuOpen ? 'menu-open' : ''}`} ref={menuRef}>
          <ul>
            <li className={active === 'home' ? 'active' : ''} onClick={() => { handleClick('home'); handleMenuClick('home'); }}>
              <HomeOutlined style={{ color: '#FFFFFF', marginRight: '8px' }} />
              Inicio
            </li>
            <li className={active === 'eventos' ? 'active' : ''} onClick={() => { handleClick('eventos'); handleMenuClick('eventos'); }}>
              <ShopOutlined style={{ color: '#FFFFFF', marginRight: '8px' }} />
              Eventos
            </li>
            <li className={active === 'resultadosA' ? 'active' : ''} onClick={() => { handleClick('resultadosA'); handleMenuClick('resultadosA'); }}>
              <TrophyOutlined style={{ color: '#FFFFFF', marginRight: '8px' }} />
              Resultados
            </li>
            <li className={active === 'convocatoria' ? 'active' : ''} onClick={() => { handleClick('convocatoria'); handleMenuClick('convocatoria'); }}>
              <NotificationOutlined style={{ color: '#FFFFFF', marginRight: '8px' }} />
              Convocatoria
            </li>
            <li className={active === 'perfilA' ? 'active' : ''} onClick={() => { handleClick('perfilA'); handleMenuClick('perfilA'); }}>
              <UserOutlined style={{ color: '#FFFFFF', marginRight: '8px' }} />
              Perfil
            </li>
            <li className={active === 'cerrarSesion' ? 'active' : ''} onClick={() => { handleClick('cerrarSesion'); handleMenuClick('cerrarSesion'); }}>
              <LogoutOutlined style={{ color: '#FFFFFF', marginRight: '8px' }} />
              Cerrar Sesión
            </li>
          </ul>
        </nav>
        <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
          <div className="hamburger"></div>
          <div className="hamburger"></div>
          <div className="hamburger"></div>
        </div>
      </header>
    </>
  );
};

export default EncabezadoCliente;