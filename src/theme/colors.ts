// Theme colors configuration

export const colors = {
  gold: {
    50: '#FEFCF3',
    100: '#FDF9E7',
    200: '#FAF0C3',
    300: '#F7E79F',
    400: '#F1D557',
    500: '#D4AF37', // Main gold
    600: '#B8962E',
    700: '#9A7D26',
    800: '#7C641E',
    900: '#5E4B16',
  },
  black: {
    DEFAULT: '#000000',
    50: '#F5F5F5',
    100: '#E0E0E0',
    200: '#BDBDBD',
    300: '#9E9E9E',
    400: '#757575',
    500: '#616161',
    600: '#424242',
    700: '#303030',
    800: '#212121',
    900: '#000000',
  },
  white: {
    DEFAULT: '#FFFFFF',
  },
};

export const brandColors = {
  primary: colors.gold[500],
  secondary: colors.black[900],
  accent: colors.white.DEFAULT,
};
