import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestore } from '../firebase';
import {
  doc, getDoc, updateDoc, query, collection, where,
  getDocs, arrayUnion, arrayRemove, onSnapshot,
} from 'firebase/firestore';
import {
  Box, TextField, Button, Typography, List,
  ListItem, ListItemText, Divider, Card, CardContent,
} from '@mui/material';

const FriendManagement = () => {
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendDetails, setFriendDetails] = useState([]);

  const diningHallMap = {
    commons: "Commons Dining Center",
    rand: "Rand Dining Center",
    kissam: "Kissam Kitchen",
    e_bronson_ingram: "E. Bronson Ingram Dining Hall",
    zeppos: "Nicholas S. Zeppos Dining Hall",
    rothschild: "Rothschild Dining Hall",
    carmichael: "Cafe Carmichael",
    pub: "The Pub at Overcup Oak",
    blenz: "Vandy Blenz",
  };

  // Subscribe to user data
  useEffect(() => {
    if (currentUser) {
      const userRef = doc(firestore, 'users', currentUser.uid);

      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFriendRequests(data.friendRequests || []);
          setFriends(data.friends || []);
        }
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  // Fetch friend details
  useEffect(() => {
    const fetchFriendDetails = async () => {
      const detailsPromises = friends.map(async (friendUid) => {
        const friendRef = doc(firestore, 'users', friendUid);
        const friendSnap = await getDoc(friendRef);
        if (friendSnap.exists()) {
          return { uid: friendUid, ...friendSnap.data() };
        }
        return null;
      });

      const details = await Promise.all(detailsPromises);
      setFriendDetails(details.filter((detail) => detail !== null));
    };

    if (friends.length > 0) {
      fetchFriendDetails();
    } else {
      setFriendDetails([]);
    }
  }, [friends]);

  const handleSearch = async () => {
    const sanitizedInput = searchInput.trim();
    if (!sanitizedInput) return;

    const usersRef = collection(firestore, 'users');
    const searchQuery = sanitizedInput.includes('@')
      ? query(usersRef, where('email', '==', sanitizedInput))
      : query(usersRef, where('name', '==', sanitizedInput));

    try {
      const querySnapshot = await getDocs(searchQuery);
      setSearchResults(querySnapshot.empty ? [] : querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })));
    } catch (e) {
      console.error("Error searching users:", e);
    }
  };

  const sendFriendRequest = async (friend) => {
    if (!currentUser) return;
    const friendRef = doc(firestore, 'users', friend.uid);

    try {
      await updateDoc(friendRef, {
        friendRequests: arrayUnion({
          from: currentUser.uid,
          email: currentUser.email,
          status: 'pending',
          timestamp: new Date().toISOString(),
        }),
      });
      alert('Friend request sent!');
    } catch (e) {
      console.error('Error sending friend request:', e);
    }
  };

  const handleAcceptRequest = async (request) => {
    const userRef = doc(firestore, 'users', currentUser.uid);
    const requesterRef = doc(firestore, 'users', request.from);

    try {
      await updateDoc(userRef, {
        friends: arrayUnion(request.from),
        friendRequests: arrayRemove(request),
      });
      await updateDoc(requesterRef, {
        friends: arrayUnion(currentUser.uid),
      });
      setFriendRequests((prev) => prev.filter((req) => req.from !== request.from));
      setFriends((prev) => [...prev, request.from]);
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleDenyRequest = async (request) => {
    const userRef = doc(firestore, 'users', currentUser.uid);

    try {
      await updateDoc(userRef, {
        friendRequests: arrayRemove(request),
      });
      setFriendRequests((prev) => prev.filter((req) => req.from !== request.from));
    } catch (error) {
      console.error('Error denying friend request:', error);
    }
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: 'background.default' }}>
      <Typography variant="h4" gutterBottom>Manage Friends</Typography>
      <Divider sx={{ my: 2 }} />

      <Card sx={{ marginBottom: 4, backgroundColor: '#333333'}}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Search Friends</Typography>
          <TextField
            label="Search by Name or Email"
            variant="outlined"
            fullWidth
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleSearch}
          >
            Search
          </Button>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <Card sx={{ marginBottom: 4, backgroundColor: '#333333' }}>
          <CardContent>
            <Typography variant="h6">Search Results</Typography>
            <List>
              {searchResults.map((result) => (
                <ListItem key={result.uid}>
                  <ListItemText primary={result.name || 'No Name'} secondary={result.email} />
                  <Button variant="contained" onClick={() => sendFriendRequest(result)}>Add Friend</Button>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      <Card sx={{ marginBottom: 4, backgroundColor: '#333333'}}>
        <CardContent>
          <Typography variant="h6">Friend Requests</Typography>
          <List>
            {friendRequests.map((request) => (
              <ListItem key={request.from}>
                <ListItemText
                  primary={request.email}
                  secondary={new Date(request.timestamp).toLocaleString()}
                />
                <Button onClick={() => handleAcceptRequest(request)} sx={{ mr: 2 }} variant="contained">Accept</Button>
                <Button onClick={() => handleDenyRequest(request)} variant="outlined" color="error">Deny</Button>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card sx={{backgroundColor: '#333333'}}>
        <CardContent>
          <Typography variant="h6">Your Friends</Typography>
          <List>
            {friendDetails.map((friend) => (
              <ListItem key={friend.uid}>
                <ListItemText
                  primary={friend.name || 'Unknown'}
                  secondary={
                    <Typography variant="body2">
                      Email: {friend.email}<br />
                      Location: {friend.currentLocation ? diningHallMap[friend.currentLocation] : "None"}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FriendManagement;
