import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, onSnapshot, query, where, updateDoc, doc, getDocs, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material';

const Dashboard = () => {
  const [diningHalls, setDiningHalls] = useState([]);
  const [checkIns, setCheckIns] = useState([]);

  // Fetch dining hall data
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'diningHalls'), snapshot => {
      const halls = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDiningHalls(halls);
    });

    return () => unsubscribe();
  }, []);

  // Fetch location reports and update dining halls every hour
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = new Date();
      const oneHourAgo = new Date(now - 60 * 60 * 1000); // 1 hour ago
      const checkInRef = collection(firestore, 'locationReports');
      const q = query(checkInRef, where('timestamp', '>=', oneHourAgo));
      const snapshot = await getDocs(q);
      const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCheckIns(reports);

      // Update dining halls occupancy based on the reports from the last hour
      diningHalls.forEach(async (hall) => {
        // Get all reports for this dining hall in the last hour
        console.log(hall.id)
        const filteredReports = reports.filter(report => report.diningHall === hall.id);
        const occupancyCount = filteredReports.length; // Count of reports in the last hour

        const diningHallRef = doc(firestore, 'diningHalls', hall.id);

        // Update the dining hall's occupancy to the count of reports
        await updateDoc(diningHallRef, {
          occupancy: occupancyCount,
        });
      });

      // Optionally, remove expired location reports
      reports.forEach(async (report) => {
        const checkInTimestamp = report.timestamp.toDate();
        if (checkInTimestamp < oneHourAgo) {
          await deleteDoc(doc(firestore, 'locationReports', report.id)); // Remove expired report
        }
      });
    }, 60000); // check every minute

    return () => clearInterval(interval);
  }, [diningHalls]); // Re-run when diningHalls changes

  const getOccupancyColor = (occupancy) => {
    if (occupancy <= 40) return '#3A8D15';
    if (occupancy <= 70) return '#CC5500';
    return '#800000';
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
        {diningHalls.map((hall) => {
          const occupancyPercentage = ((hall.occupancy / hall.capacity) * 100).toFixed(0);
          return (
            <Box key={hall.id} sx={{ width: '300px', flex: '1 1 calc(25% - 16px)', minWidth: '280px' }}>
              <Card sx={{ boxShadow: 3, borderRadius: 2, backgroundColor: 'background.primary', textAlign: 'center' }}>
                <CardContent sx={{ backgroundColor: 'background.primary' }}>
                  <Typography variant="h5" gutterBottom>{hall.name}</Typography>
                  <Box sx={{ width: '100%', height: '20px', backgroundColor: '#eee', borderRadius: '10px', overflow: 'hidden', position: 'relative', marginBottom: 2 }}>
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
                  <Typography variant="body2" sx={{ color: 'primary' }}>
                    {occupancyPercentage}% Full
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default Dashboard;

