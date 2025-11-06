// src/components/layout/NavBar.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }} onClick={() => navigate('/')}>
          Group Book Reading
        </Typography>
        {user ? (
          <Box>
            <Typography variant="body1" sx={{ display: 'inline', mr: 2, color: 'white' }}>
              Welcome, {user.username}!
            </Typography>
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </Box>
        ) : (
          <>
            <Button color="inherit" href="/register">Sign Up</Button>
            <Button color="inherit" href="/login">Login</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}