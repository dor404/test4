import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Slide,
  useScrollTrigger,
} from '@mui/material';
import {
  Home as HomeIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  MenuBook as MenuBookIcon,
  AdminPanelSettings as AdminIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const userMenuOpen = Boolean(userMenuAnchor);
  const [scrollThreshold, setScrollThreshold] = useState(0);
  
  // Set the scroll threshold on mount and when window resizes
  useEffect(() => {
    const calculateThreshold = () => {
      // 1/10 of the page height
      setScrollThreshold(window.innerHeight / 10);
    };
    
    calculateThreshold();
    window.addEventListener('resize', calculateThreshold);
    
    return () => {
      window.removeEventListener('resize', calculateThreshold);
    };
  }, []);
  
  // Custom scroll trigger that uses our specific threshold
  const trigger = useScrollTrigger({
    threshold: scrollThreshold,
    disableHysteresis: false,
  });

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Learn Git', icon: <SchoolIcon />, path: '/learn' },
    { text: 'Training', icon: <MenuBookIcon />, path: '/training' },
    { text: 'Exercises', icon: <AssignmentIcon />, path: '/exercises' },
    { text: 'Progress', icon: <TimelineIcon />, path: '/progress' },
    { text: 'About Us', icon: <InfoIcon />, path: '/about' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Slide appear={false} direction="down" in={!trigger}>
        <AppBar position="fixed">
          <Toolbar>
            <Typography
              variant="h3"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                flexGrow: 1,
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '2rem' },
              }}
            >
              Git Mastery
            </Typography>

            {isAuthenticated ? (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleUserMenuClick}
                  sx={{ ml: 2 }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.dark',
                      height: 32,
                      width: 32,
                      fontSize: '1rem',
                      fontWeight: 500,
                    }}
                    src={user?.avatar}
                  >
                    {!user?.avatar && user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={userMenuOpen}
                  onClose={handleUserMenuClose}
                  onClick={handleUserMenuClose}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={() => navigate('/profile')}>
                    <ListItemIcon>
                      <AccountCircleIcon />
                    </ListItemIcon>
                    <ListItemText primary="My Profile" secondary={user?.username} />
                  </MenuItem>
                  {user?.role === 'admin' && (
                    <MenuItem onClick={() => navigate('/admin')}>
                      <ListItemIcon>
                        <AdminIcon />
                      </ListItemIcon>
                      <ListItemText primary="Admin Dashboard" />
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/register"
                  sx={{
                    borderRadius: '20px',
                    px: 2,
                    mr: 2,
                    border: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Register
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/login"
                  sx={{
                    borderRadius: '20px',
                    px: 2,
                    border: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Login
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
      </Slide>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          height: '100%',
          pt: { xs: 8, sm: 9 },
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'auto'
        }}
      >
        {children}
      </Box>
      
      <Footer />
    </Box>
  );
};

export default Layout; 