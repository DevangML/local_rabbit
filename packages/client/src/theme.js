import { createTheme } from '@mui/material/styles';
import { lightTheme } from './theme/index';

// Create a theme instance using MUI's createTheme with our lightTheme values
export const theme = createTheme({
  palette: {
    primary: {
      main: lightTheme.accent,
      dark: lightTheme.accentHover,
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: lightTheme.bgPrimary,
      paper: lightTheme.surface,
    },
    text: {
      primary: lightTheme.textPrimary,
      secondary: lightTheme.textSecondary,
    },
    divider: lightTheme.border,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: lightTheme.bgPrimary,
          color: lightTheme.textPrimary,
        },
      },
    },
  },
});

export default theme; 