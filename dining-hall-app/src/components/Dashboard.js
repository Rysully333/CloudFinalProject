import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import {Card, CardContent, Typography, LinearProgress, Box } from '@mui/material';


const Dashboard = () => {
  const [diningHalls, setDiningHalls] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'diningHalls'), snapshot => {
      const halls = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDiningHalls(halls);
    });

    return () => unsubscribe();
  }, []);

  const getOccupancyColor = (occupancy) => {
    if (occupancy <= 40) return '#3A8D15';
    if (occupancy <= 70) return '#CC5500';
    return '#800000';
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          justifyContent: 'center',
        }}
      >
        {diningHalls.map((hall) => {
          const occupancyPercentage = ((hall.occupancy / hall.capacity) * 100).toFixed(0);
          return (
            <Box
              key={hall.id}
              sx={{
                width: '300px',
                flex: '1 1 calc(25% - 16px)', // responsive behavior
                minWidth: '280px',
              }}
              >
                <Card 
                  sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                  backgroundColor: 'background.primary',
                  textAlign: 'center',
                }}>
                  <CardContent sx={{backgroundColor: 'background.primary'}}>
                    <Typography variant="h5" gutterBottom>
                      {hall.name}
                    </Typography>
                    <Box 
                      sx={{
                        width: '100%',
                        height: '20px',
                        backgroundColor: '#eee',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        position: 'relative',
                        marginBottom: 2,
                      }}>
                        <LinearProgress
                        variant="determinate"
                        value={occupancyPercentage}
                        sx={{
                          height: '100%',
                          backgroundColor: '#ddd',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getOccupancyColor(occupancyPercentage),
                          },
                        }}
                        />
                      </Box>
                      <Typography variant="body1">
                        Occupancy: {hall.occupancy} / {hall.capacity}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'primary'}}>
                        {occupancyPercentage}% Full
                      </Typography>
                  </CardContent>
                </Card>
              </Box>);
          })}
      </Box>
    </Box>
  );
};

export default Dashboard;

