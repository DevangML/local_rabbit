import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  GitHub as GitHubIcon,
  DarkMode as DarkModeIcon,
  CompareArrows as DiffIcon,
  Analytics as AnalyticsIcon,
  Speed as ImpactIcon,
  Code as QualityIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MainLayout = ({ children, onRepoPathChange }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isDrawerOpen, setIsDrawerOpen] = useState(!isMobile);
  const [repoPath, setRepoPath] = useState('');

  const menuItems = [
    { text: 'Diff Viewer', icon: <DiffIcon />, path: '/diff' },
    { text: 'AI Analyzer', icon: <AnalyticsIcon />, path: '/analyze' },
    { text: 'Impact View', icon: <ImpactIcon />, path: '/impact' },
    { text: 'Quality Check', icon: <QualityIcon />, path: '/quality' },
  ];

  const handleRepoSubmit = (e) => {
    e.preventDefault();
    onRepoPathChange?.(repoPath);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <form onSubmit={handleRepoSubmit}>
        <Box sx={{ px: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Repository Path
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="/path/to/repo"
              value={repoPath}
              onChange={(e) => setRepoPath(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            />
            <IconButton size="small" onClick={() => {/* Handle folder selection */ }}>
              <FolderIcon />
            </IconButton>
          </Box>
        </Box>
      </form>

      <Divider />

      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              button
              component={Link}
              to={item.path}
              key={item.text}
              selected={isActive}
              onClick={() => isMobile && setIsDrawerOpen(false)}
              sx={{
                py: 1.5,
                color: isActive ? 'primary.main' : 'text.primary',
                backgroundColor: isActive ? 'rgba(157, 124, 216, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(157, 124, 216, 0.08)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(157, 124, 216, 0.12)',
                  '&:hover': {
                    backgroundColor: 'rgba(157, 124, 216, 0.16)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
      color: theme.palette.text.primary,
    }}>
      <AppBar position="fixed" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={toggleDrawer}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                component={Link}
                to="/"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: theme.typography.fontFamily,
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <Box component="img" src="/logo.svg" sx={{ height: 32, mr: 2 }} />
                {!isMobile && 'Local Rabbit'}
              </Typography>
            </Box>
          </motion.div>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="github repository"
              component="a"
              href="https://github.com/yourusername/local_rabbit"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon />
            </IconButton>
            <IconButton color="inherit" aria-label="toggle theme">
              <DarkModeIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => isMobile && setIsDrawerOpen(false)}
        variant={isMobile ? 'temporary' : 'persistent'}
        sx={{
          '& .MuiDrawer-paper': {
            backgroundColor: 'background.default',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pl: !isMobile && isDrawerOpen ? '280px' : 0,
          transition: theme.transitions.create('padding', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}

        <Container maxWidth="xl" sx={{
          mt: 4,
          mb: 8,
          position: 'relative',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {children}
          </motion.div>
        </Container>

        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            backgroundColor: theme.palette.background.paper,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Container maxWidth="xl">
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} Local Rabbit. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout; 