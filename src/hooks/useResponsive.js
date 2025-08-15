import { useState, useEffect } from 'react';

// Breakpoints principales
const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1200
};

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < BREAKPOINTS.tablet);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= BREAKPOINTS.tablet && window.innerWidth < BREAKPOINTS.desktop
  );
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= BREAKPOINTS.desktop);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setWindowSize({ width, height });
      setIsMobile(width < BREAKPOINTS.tablet);
      setIsTablet(width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop);
      setIsDesktop(width >= BREAKPOINTS.desktop);
    };

    // Agregar event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Función para obtener el breakpoint actual
  const getCurrentBreakpoint = () => {
    if (windowSize.width < BREAKPOINTS.mobile) return 'mobile';
    if (windowSize.width < BREAKPOINTS.tablet) return 'tablet';
    if (windowSize.width < BREAKPOINTS.desktop) return 'desktop';
    return 'largeDesktop';
  };

  // Función para verificar si estamos en un breakpoint específico o mayor
  const isBreakpointOrGreater = (breakpoint) => {
    return windowSize.width >= BREAKPOINTS[breakpoint];
  };

  // Función para verificar si estamos en un breakpoint específico o menor
  const isBreakpointOrLess = (breakpoint) => {
    return windowSize.width <= BREAKPOINTS[breakpoint];
  };

  // Función para obtener estilos responsivos
  const getResponsiveStyles = (styles) => {
    const breakpoint = getCurrentBreakpoint();
    
    if (breakpoint === 'mobile' && styles.mobile) {
      return { ...styles.base, ...styles.mobile };
    }
    
    if (breakpoint === 'tablet' && styles.tablet) {
      return { ...styles.base, ...styles.tablet };
    }
    
    if (breakpoint === 'desktop' && styles.desktop) {
      return { ...styles.base, ...styles.desktop };
    }
    
    if (breakpoint === 'largeDesktop' && styles.largeDesktop) {
      return { ...styles.base, ...styles.largeDesktop };
    }
    
    return styles.base || {};
  };

  // Función para obtener clases CSS responsivas
  const getResponsiveClasses = (baseClass, responsiveClasses = {}) => {
    const classes = [baseClass];
    
    if (isMobile && responsiveClasses.mobile) {
      classes.push(responsiveClasses.mobile);
    }
    
    if (isTablet && responsiveClasses.tablet) {
      classes.push(responsiveClasses.tablet);
    }
    
    if (isDesktop && responsiveClasses.desktop) {
      classes.push(responsiveClasses.desktop);
    }
    
    return classes.join(' ');
  };

  return {
    // Estados
    isMobile,
    isTablet,
    isDesktop,
    
    // Dimensiones
    windowSize,
    width: windowSize.width,
    height: windowSize.height,
    
    // Breakpoints
    breakpoints: BREAKPOINTS,
    currentBreakpoint: getCurrentBreakpoint(),
    
    // Utilidades
    isBreakpointOrGreater,
    isBreakpointOrLess,
    getResponsiveStyles,
    getResponsiveClasses,
    
    // Helpers rápidos
    isSmallScreen: windowSize.width < BREAKPOINTS.tablet,
    isMediumScreen: windowSize.width >= BREAKPOINTS.tablet && windowSize.width < BREAKPOINTS.desktop,
    isLargeScreen: windowSize.width >= BREAKPOINTS.desktop,
    
    // Orientación
    isPortrait: windowSize.height > windowSize.width,
    isLandscape: windowSize.width > windowSize.height
  };
};

// Hook específico para móvil
export const useIsMobile = () => {
  const { isMobile } = useResponsive();
  return isMobile;
};

// Hook específico para tablet
export const useIsTablet = () => {
  const { isTablet } = useResponsive();
  return isTablet;
};

// Hook específico para desktop
export const useIsDesktop = () => {
  const { isDesktop } = useResponsive();
  return isDesktop;
};

// Hook para obtener estilos responsivos
export const useResponsiveStyles = (styles) => {
  const { getResponsiveStyles } = useResponsive();
  return getResponsiveStyles(styles);
};

export default useResponsive;
