import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, onSnapshot, query, where, updateDoc, doc, getDocs, deleteDoc, getDoc } from 'firebase/firestore';
import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material';

import { useAuth } from '../contexts/AuthContext';

import Dropdown from './Dropdown';

const Dashboard = () => {
  const [diningHalls, setDiningHalls] = useState([]);
  const [checkIns, setCheckIns] = useState([]);

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
  
    // Subscribe to changes in the current user's friends list
    const userRef = doc(firestore, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const friends = data.friends || []; // Default to empty array if no friends
  
        // Fetch details for each friend and build the map
        const detailsPromises = friends.map(async (friendUid) => {
          const friendRef = doc(firestore, 'users', friendUid);
          const friendSnap = await getDoc(friendRef);
  
          if (friendSnap.exists()) {
            const friendData = friendSnap.data();
            return { 
              location: friendData.currentLocation, 
              name: friendData.name 
            };
          } else {
            console.error(`Friend document does not exist: ${friendUid}`);
            return null;
          }
        });
  
        const details = await Promise.all(detailsPromises);
  
        // Transform the details into a map of locationName -> friendName
        const newFriendsMap = {};
        details.filter((detail) => detail !== null).forEach(({ location, name }) => {
          const fullLocation = diningHallMap[location];
          if (fullLocation) {
            // Append to the map (can handle multiple friends at the same fullLocation)
            if (!newFriendsMap[fullLocation]) {
              newFriendsMap[fullLocation] = [];
            }
            newFriendsMap[fullLocation].push(name);
          }
        });
  
        console.log("Current friends map: ", friendsMap);
        setFriendsMap(newFriendsMap);
        console.log("New friends map: ", newFriendsMap);
      }
    });
  
    return () => unsubscribe();
  }, [currentUser]);
  
  useEffect(() => {
    console.log("Updated friendsMap: ", friendsMap);
  }, [friendsMap]);

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

