import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, onSnapshot, query, where, updateDoc, doc, getDocs, deleteDoc, getDoc } from 'firebase/firestore';
import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import Dropdown from './Dropdown';

const Dashboard = () => {
  const [diningHalls, setDiningHalls] = useState([]);
  const { currentUser } = useAuth();
  const [friendsMap, setFriendsMap] = useState({});

  const diningHallMap = {
    commons: "Commons Dining Center",
    rand: "Rand Dining Center",
    kissam: "Kissam Kitchen",
    e_bronson_ingram: "E. Bronson Ingram Dining Hall",
    zeppos: "Nicholas S. Zeppos Dining Hall",
    rothschild: "Rothschild Dining Hall",
    carmichael: "Cafe Carmichael",
    pub: "The Pub at Overcup Oak",
    blenz: "Vandy Blenz"
  };

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

  useEffect(() => {
    if (!currentUser) return;
  
    // Fetch user's friends and their locations
    const userRef = doc(firestore, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const friends = data.friends || [];
  
        const detailsPromises = friends.map(async (friendUid) => {
          const friendRef = doc(firestore, 'users', friendUid);
          const friendSnap = await getDoc(friendRef);
          if (friendSnap.exists()) {
            const friendData = friendSnap.data();
            return { 
              location: friendData.currentLocation, 
              name: friendData.name 
            };
          }
          return null;
        });
  
        const details = await Promise.all(detailsPromises);
        const newFriendsMap = {};
        details.filter(Boolean).forEach(({ location, name }) => {
          const fullLocation = diningHallMap[location];
          if (fullLocation) {
            if (!newFriendsMap[fullLocation]) {
              newFriendsMap[fullLocation] = [];
            }
            newFriendsMap[fullLocation].push(name);
          }
        });
  
        setFriendsMap(newFriendsMap);
      }
    });
  
    return () => unsubscribe();
  }, [currentUser]);

  // Update dining halls and clean up old reports
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = new Date();
      const oneHourAgo = new Date(now - 60 * 60 * 1000);
      const reportsRef = collection(firestore, 'locationReports');
      const q = query(reportsRef, where('timestamp', '>=', oneHourAgo));
      const snapshot = await getDocs(q);

      // Update dining hall occupancy
      const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const updatedHalls = diningHalls.map((hall) => {
        const filteredReports = reports.filter(report => report.diningHall === hall.id);
        return {
          ...hall,
          occupancy: filteredReports.length,
        };
      });

      setDiningHalls(updatedHalls);

      // Update user locations or set to null if no reports in the last hour
      const userReports = {};
      reports.forEach(report => {
        userReports[report.userEmail] = report.diningHall;
      });

      const userSnapshot = await getDocs(collection(firestore, 'users'));
      userSnapshot.forEach(async (userDoc) => {
        const userData = userDoc.data();
        const lastLocation = userReports[userData.email] || null;
        await updateDoc(doc(firestore, 'users', userDoc.id), {
          currentLocation: lastLocation,
        });
      });

      // Delete expired reports
      const allReports = await getDocs(reportsRef);
      allReports.forEach(async (docSnap) => {
        const timestamp = docSnap.data().timestamp.toDate();
        if (timestamp < oneHourAgo) {
          await deleteDoc(doc(firestore, 'locationReports', docSnap.id));
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [diningHalls]);

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
                  <Dropdown
                    friends={friendsMap[hall.name] || []}
                    locationName={hall.name}
                  />
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
