import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {Box, Button, TextField, Typography, Link} from '@mui/material';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const history = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.endsWith('@vanderbilt.edu')) {
      return setError('Please use a Vanderbilt email address');
    }
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      await signup(email, password);
      history.push('/dashboard');
    } catch (error) {
      setError('Failed to create an account');
    }
  };

  return (
    <Box sx={{
        backgroundColor: 'background.default',
        color: 'text.primary',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }}>
        <Box sx={{
        backgroundColor: '#333333',
        padding: 4,
        borderRadius: 2,
        boxShadow: 3,
        width: 400,
        textAlign: 'center',
        }}>
      <Typography variant="h4" gutterBottom>Sign Up</Typography>
      {error && <Typography color="error" variant="body2">{error}</Typography>}
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
        <TextField
            fullWidth
            variant="outlined"
            margin="normal"
            label="Vanderbilt Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
        />
        <TextField
            fullWidth
            varient="outlined"
            margin="normal"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
        />
        <TextField
            fullWidth
            varient="outlined"
            margin="normal"
            label="Confirm Password"
            type="password"  
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
        />
        <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mb: 2 }}
        >
            Sign Up
        </Button>
      </Box>
      <Typography variant="body2">
        Already have an account? <Link href="/">Login</Link>
      </Typography>
      </Box>
    </Box>
  );
};

export default SignUp;

