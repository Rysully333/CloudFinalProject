import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestore } from '../firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Paper,
  Alert,
} from '@mui/material';

const LocationReporting = () => {
  const { currentUser } = useAuth();
  const [selectedDiningHall, setSelectedDiningHall] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const diningHalls = [
    { id: 'commons', name: 'Commons Dining Center' },
    { id: 'rand', name: 'Rand Dining Center' },
    { id: 'kissam', name: 'Kissam Kitchen' },
    { id: 'e_bronson_ingram', name: 'E. Bronson Ingram Dining Hall' },
    { id: 'zeppos', name: 'Nicholas S. Zeppos Dining Hall' },
    { id: 'rothschild', name: 'Rothschild Dining Hall' },
    { id: 'carmichael', name: 'Cafe Carmichael' },
    { id: 'pub', name: 'The Pub at Overcup Oak' },
    { id: 'blenz', name: 'Vandy Blenz' },
  ];

  const handleSubmit = async () => {
    setConfirmationMessage('');
    setErrorMessage('');

    if (!selectedDiningHall || !currentUser) {
      setErrorMessage('Please select a dining hall.');
      return;
    }

    try {
      const timestamp = new Date();
      await addDoc(collection(firestore, 'locationReports'), {
        userEmail: currentUser.email,
        userName: currentUser.displayName || 'Anonymous',
        diningHall: selectedDiningHall,
        timestamp,
      });

      await updateDoc(doc(firestore, 'users', currentUser.uid), {
        currentLocation: selectedDiningHall,
      });

      await updateDoc(doc(firestore, 'diningHalls', selectedDiningHall), {
        occupancy: increment(1),
      });

      setConfirmationMessage(`Successfully checked into ${diningHalls.find(hall => hall.id === selectedDiningHall)?.name}!`);
      setSelectedDiningHall('');
    } catch (error) {
      setErrorMessage('Failed to report location. Please try again.');
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
    <Typography variant="h4" gutterBottom>Location Reporting</Typography>
    <Box sx={{ display: 'flex',  justifyContent: 'center', alignItems: 'center',  minHeight: '50vh', gap: 16 }}>
      <Paper
        elevation={3}
        sx={{
          padding: 3,
          width: '100%',
          maxWidth: 400,
          textAlign: 'center',
          borderRadius: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h5" gutterBottom>
          Report Your Location
        </Typography>
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel>Select Dining Hall</InputLabel>
          <Select
            value={selectedDiningHall}
            onChange={(e) => setSelectedDiningHall(e.target.value)}
            label="Select Dining Hall"
          >
            {diningHalls.map((hall) => (
              <MenuItem key={hall.id} value={hall.id}>
                {hall.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
          sx={{ marginBottom: 2 }}
        >
          Report Location
        </Button>
        {confirmationMessage && (
          <Alert severity="success" sx={{ marginBottom: 2 }}>
            {confirmationMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {errorMessage}
          </Alert>
        )}
      </Paper>
    </Box>
    </Box>
  );
};

export default LocationReporting;
