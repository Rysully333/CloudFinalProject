import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestore } from '../firebase';
import { collection, addDoc, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { Box, Typography, Select, MenuItem, Button, FormControl, InputLabel } from '@mui/material';

const LocationReporting = () => {
  const { currentUser } = useAuth();
  const [selectedDiningHall, setSelectedDiningHall] = useState('');
  const [diningHalls1] = useState([
    'Rand',
    'Commons',
    'E. Bronson Ingram',
    'Nicholas S. Zeppos',
    'Rothschild',
    'The Pub',
    'Kissam',
    'Cafe Carmichael',
    'Vandy Blenz'
  ]);
  const diningHalls = [
    { id: 'commons', name: 'Commons Dining Center' },
    { id: 'rand', name: 'Rand Dining Center' },
    { id: 'kissam', name: 'Kissam Kitchen' },
    { id: 'e_bronson_ingram', name: 'E. Bronson Ingram Dining Hall' },
    { id: 'zeppos', name: 'Nicholas S. Zeppos Dining Hall' },
    { id: 'rothschild', name: 'Rothschild Dining Hall'},
    { id: 'carmichael', name: 'Cafe Carmichael'},
    { id: 'pub', name: 'The Pub at Overcup Oak'},
    { id: 'blenz', name: 'Vandy Blenz'}
  ];
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDiningHall) {
        setConfirmationMessage("Please select a dining hall before reporting a location.");
        return;
    }
    const timestamp = new Date();
    try {
        if (currentUser && selectedDiningHall) {
        await addDoc(collection(firestore, 'locationReports'), {
            userEmail: currentUser.email,
            userName: currentUser.displayName || 'Anonymous',
            diningHall: selectedDiningHall,
            timestamp: timestamp
        });

        // Update user's current location
        const userRef = doc(firestore, 'users', currentUser.uid);
        await setDoc(
            userRef, 
            {
                currentLocation: selectedDiningHall
            },
            {merge: true}
        );

        // Update dining hall occupancy (this is a simplified version)
        const diningHallRef = doc(firestore, 'diningHalls', selectedDiningHall);
        const diningHallSnap = await getDoc(diningHallRef);

        if (diningHallSnap.exists()) {
            await updateDoc(diningHallRef, {
                occupancy: increment(1)
            });
        } else {
            await setDoc(diningHallRef, {
                name: diningHalls.find((hall) => hall.id === selectedDiningHall).name,
                occupancy: 1,
            });
        }

        // Reset selection and show confirmation
        setSelectedDiningHall('');
        const friendlyName = diningHalls.find((hall) => hall.id === selectedDiningHall)?.name || 'Unknown Dining Hall';
        setConfirmationMessage(`Successfully checked into ${friendlyName}!`);
        } 
    } catch (e) {
        // error
        console.error("Error during check-in:", e);
        setConfirmationMessage("Failed to report location. Please try again.");
    }
  };

  return (
    <Box sx={{
        backgroundColor: 'background.default',
        color: 'text.primary',
        height: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }}>
        <Box sx={{
        backgroundColor: '#333333',
        padding: 4,
        borderRadius: 2,
        boxShadow: 3,
        width: 600,
        textAlign: 'center',
        }}
    >
        <Typography variant="h4" gutterBottom>Report Your Location</Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
            Select your current dining hall and click the button to check in.
        </Typography>
        <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="dining-hall-label">Dining Hall</InputLabel>
            <Select
                labelId="dining-hall-label"
                id="dining-hall-select"
                value={selectedDiningHall}
                onChange={(e) => setSelectedDiningHall(e.target.value)} label="Dining Hall">
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
            onClick={handleSubmit}
            sx={{ mb: 2 }}
            >
                Report Location
            </Button>
            {confirmationMessage && (
                <Typography variant="body2" sx={{ mt: 2, color: 'primary'}}>
                    {confirmationMessage}
                </Typography>
            )}
        </Box>
    </Box>
  );
};

export default LocationReporting;

