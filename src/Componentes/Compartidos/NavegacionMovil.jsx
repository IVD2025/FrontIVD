import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faHome, faUser, faSignOutAlt, faCog } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../Autenticacion/AuthContext';

const NavegacionMovil = ({ menuItems = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Solo mostrar en móvil
  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Botón hamburguesa */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1002,
          background: '#800020',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          fontSize: '20px'
        }}
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000
          }}
        />
      )}

      {/* Menú lateral */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: isOpen ? 0 : '-100%',
          width: '80%',
          maxWidth: '300px',
          height: '100vh',
          background: 'white',
          zIndex: 1001,
          transition: 'right 0.3s ease',
          boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
          overflowY: 'auto'
        }}
      >
        {/* Header del menú */}
        <div
          style={{
            background: '#800020',
            color: 'white',
            padding: '20px',
            textAlign: 'center'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '18px' }}>
            {user?.nombre || 'Usuario'}
          </h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.8 }}>
            {user?.rol || 'Rol'}
          </p>
        </div>

        {/* Lista de menú */}
        <nav style={{ padding: '20px 0' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {/* Inicio */}
            <li>
              <Link
                to="/"
                onClick={closeMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px 20px',
                  color: '#333',
                  textDecoration: 'none',
                  borderBottom: '1px solid #eee',
                  fontSize: '16px'
                }}
              >
                <FontAwesomeIcon icon={faHome} style={{ marginRight: '15px', color: '#800020' }} />
                Inicio
              </Link>
            </li>

            {/* Elementos del menú personalizados */}
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  onClick={closeMenu}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '15px 20px',
                    color: location.pathname === item.path ? '#800020' : '#333',
                    textDecoration: 'none',
                    borderBottom: '1px solid #eee',
                    fontSize: '16px',
                    fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                    background: location.pathname === item.path ? '#f8f9fa' : 'transparent'
                  }}
                >
                  {item.icon && (
                    <span style={{ marginRight: '15px', color: '#800020' }}>
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </Link>
              </li>
            ))}

            {/* Configuración */}
            <li>
              <Link
                to="/perfil"
                onClick={closeMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px 20px',
                  color: '#333',
                  textDecoration: 'none',
                  borderBottom: '1px solid #eee',
                  fontSize: '16px'
                }}
              >
                <FontAwesomeIcon icon={faCog} style={{ marginRight: '15px', color: '#800020' }} />
                Perfil
              </Link>
            </li>

            {/* Cerrar sesión */}
            <li>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '15px 20px',
                  color: '#d32f2f',
                  textDecoration: 'none',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '16px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '15px' }} />
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default NavegacionMovil;
