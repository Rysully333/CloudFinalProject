import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from "../firebase";
import {Box, Button, TextField, Typography, Link} from '@mui/material';
import { firestore } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, signInWithGoogle } = useAuth();
  const history = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      history('/dashboard');
      console.log('User signed in');
    } catch (error) {
      setError('Failed to log in');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithGoogle();
      const user = userCredential.user;
      
      // firestore reference for the user
      const userRef = doc(firestore, 'users', user.uid);

      // check if doc exists in firestore
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        // create user document in Firestore
        await setDoc(userRef, {
            email: user.email,
            name: user.displayName || '',   // use Google-provided name
            profilePicture: user.photoURL || '',    // use Google profile pic
        });
        console.log("New user document created in Firestore");
     } else {
        console.log("User document already exists in Firestore");
     }

     history('/dashboard');       // redirect to dashboard page
     console.log("User signed in:". user);
    } catch (error) {
        console.error("Error during Google sign-in:", error);
        setError('Failed to sign in with Google');
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
        }}
>
    <Typography variant="h4" gutterBottom>Login</Typography>
    {error && <Typography color="error" variant="body2" sx={{mb: 2}}>{error}</Typography>}
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
            variant="outlined"
            margin="normal"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
        />
        <Button 
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
        >
            Login
        </Button>
    </Box>
    
    <Button 
        onClick={handleGoogleSignIn}
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
        >
            Sign in with Google
        </Button>
    <Typography variant="body2">
        Don't have an account? <Link href="/signup" color="primary">Sign up</Link>
    </Typography>
    </Box>
    </Box>
  );
};

export default Login;

