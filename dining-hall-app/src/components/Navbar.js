import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const { currentUser, logout } = useAuth();

    return (
        <AppBar position="static" sx={{ backgroundColor: '#333333' }}>
        <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, color: '#f5c518' }}>
            Dining Status App
            </Typography>
            {currentUser && (
                <Box>
                <Button component={Link} to="/dashboard" sx={{ color: '#f5c518' }}>
                    Dashboard
                </Button>
                <Button component={Link} to="/profile" sx={{ color: '#f5c518' }}>
                    Profile
                </Button>
                <Button component={Link} to="/friends" sx={{ color: '#f5c518' }}>
                    Friends
                </Button>
                <Button component={Link} to="/report-location" sx={{ color: '#f5c518' }}>
                    Check In
                </Button>
                <Button component={Link} to="/" sx={{ color: '#f5c518'}} onClick={logout}>
                    Log Out
                </Button>
                </Box> 
            )}
        </Toolbar>
        </AppBar>
    );
};

export default Navbar;
