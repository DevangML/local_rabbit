import { createTheme } from '@mui/material/styles';

const lunarTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9d7cd8',
      light: '#bb9af7',
      dark: '#7aa2f7',
    },
    secondary: {
      main: '#7dcfff',
      light: '#89ddff',
      dark: '#565f89',
    },
    background: {
      default: '#1a1b26',
      paper: '#24283b',
    },
    text: {
      primary: '#c0caf5',
      secondary: '#a9b1d6',
    },
    error: {
      main: '#f7768e',
    },
    warning: {
      main: '#e0af68',
    },
    success: {
      main: '#9ece6a',
    },
    info: {
      main: '#7aa2f7',
    },
  },
  typography: {
    fontFamily: '"JetBrains Mono", "Roboto Mono", monospace',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    code: {
      fontFamily: '"JetBrains Mono", "Roboto Mono", monospace',
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'transparent',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(192, 202, 245, 0.1)',
        },
      },
    },
  },
});

export default lunarTheme; 