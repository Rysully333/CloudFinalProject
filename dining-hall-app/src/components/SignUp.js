import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {Box, Button, TextField, Typography, Link} from '@mui/material';
import { firestore } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const history = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.endsWith('@vanderbilt.edu')) {
      console.log('Email entered:', email)
      return setError('Please use a Vanderbilt email address');
    }
    
    if (password !== confirmPassword) {
      console.log('Password entered:', password)
      console.log('Confirm password entered:', confirmPassword)
      return setError('Passwords do not match');
    }
    
    try {
      const userCredential = await signup(email, password);
      const user = userCredential.user;

      // firestore reference for the user
      const userRef = doc(firestore, 'users', user.uid);

      // check if doc exists in firestore
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        // create user document in Firestore
        await setDoc(userRef, {
            email: user.email,
            name: name || '',   // use Google-provided name
            profilePicture: user.photoURL || '',    // use Google profile pic
        });
        console.log("New user document created in Firestore");
     } else {
        console.log("User document already exists in Firestore");
     }

      history('/dashboard')

      console.log('User signed up');
    } catch (error) {
      setError('Failed to create an account:', error);
      console.log(error);
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
            label="Full Name"
            type="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
        />
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

