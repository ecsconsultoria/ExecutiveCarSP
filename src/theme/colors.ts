// Theme color palette - Gold, Black, White

export const colors = {
  gold: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#D4AF37', // Primary gold
    600: '#B8941F',
    700: '#92710F',
    800: '#6B5208',
    900: '#453503',
  },
  black: {
    DEFAULT: '#000000',
    light: '#1A1A1A',
    lighter: '#2D2D2D',
  },
  white: {
    DEFAULT: '#FFFFFF',
    off: '#F8F8F8',
  },
};

export type ThemeMode = 'gold' | 'dark' | 'light';
