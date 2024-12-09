import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestore } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { Box, Typography, Avatar, Button, TextField, Divider } from '@mui/material';


const Profile = () => {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  useEffect(() => {
    if (currentUser) {
      const userRef = doc(firestore, 'users', currentUser.uid);
      getDoc(userRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');   // set name or default to empty string
          setProfilePicture(data.profilePicture || '');
        }
      });
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentUser) {
      const userRef = doc(firestore, 'users', currentUser.uid);
      
      try {
        // check if document exists
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            await updateDoc(userRef, {
                name,                           // save updated name
                profilePicture                  // save updated profile picture URL
            });
        } else {
            await setDoc(userRef, {
                name,
                profilePicture
            })
        }
        alert('Profile updated successfully!')
        
    } catch (e) {
        console.error('Error updating profile: ', e);
        alert('Failed to update profile. Please try again.');
    }
    }
  };

  return (
    <Box 
    sx={{
        backgroundColor: 'background.default',
        color: 'text.primary',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
      }}>
        <Box 
            sx={{
                backgroundColor: '#333333',
                padding: 4,
                borderRadius: 2,
                boxShadow: 3,
                maxWidth: 500,
                width: '100%',
                textAlign: 'center',
            }}>
                <Avatar
                sx={{
                    width: 100,
                    height: 100,
                    margin: '0 auto',
                    bgcolor: '#f5c518',
                    color: '#000000',
                    fontSize: 40,
                  }}
                  src={profilePicture}>
                    {!profilePicture && name ? name[0].toUpperCase() : ''}
                  </Avatar>
            <Typography varaint="h5" gutterBottom sx={{ mt: 2 }}>Profile</Typography>
            <Box component="form" onSubmit={handleSubmit} sz={{ mb: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    margin="Normal"
                    label="Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ mb: 1}}
                />
                <TextField
                    fullWidth
                    variant="outlined"
                    margin="Normal"
                    label="Profile Picture URL"
                    type="text"
                    value={profilePicture}
                    onChange={(e) => setProfilePicture(e.target.value)}
                    sx={{ mb: 2}}
                />
                <Button 
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                >
                    Update Profile
                </Button>
            </Box>
            <Divider sx={{ my: 3, backgroundColor: '#f5c518' }} />
            <Box>
                <Typography variant="body1" sx={{ mb: 1}}>
                    <strong>Email:</strong> {currentUser?.email}
                </Typography>
                <Typography variant="body1">
                    <strong>Account Created:</strong>{' '}
                    {new Date(currentUser?.metadata.creationTime).toLocaleDateString()}
                </Typography>
            </Box>
        </Box>
    </Box>
  );
};

export default Profile;

