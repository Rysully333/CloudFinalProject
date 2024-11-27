import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestore } from '../firebase';
import { doc, getDoc, updateDoc, query, collection, where, getDocs, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { Box, TextField, Button, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

const FriendManagement = () => {
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendDetails, setFriendDetails] = useState([]);

  // fetch friend requests and friends from Firestore
  useEffect(() => {
    if (currentUser) {
      const userRef = doc(firestore, 'users', currentUser.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFriendRequests(data.friendRequests || []);
          setFriends(data.friends || []);
        }
      });

      const unsubscribe = onSnapshot(collection(firestore, 'users', currentUser.uid, 'friends'), snapshot => {
        const friendsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFriends(friendsList);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const fetchFriends = async () => {
        const userRef = doc(firestore, 'users', currentUser.uid);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFriends(data.friends || []);
          }
        });
  
        return () => unsubscribe();
      };
  
      fetchFriends();
    }
  }, [currentUser]);
  
  // Fetch details for each friend
  useEffect(() => {
      const fetchFriendDetails = async () => {
        const detailsPromises = friends.map(async (friendUid) => {
          const friendRef = doc(firestore, 'users', friendUid);
          const friendSnap = await getDoc(friendRef);
          if (friendSnap.exists()) {
            return { uid: friendUid, ...friendSnap.data() };
          } else {
            console.error(`Friend document does not exist: ${friendUid}`);
            return null;
          }
        });

        const details = await Promise.all(detailsPromises);
        setFriendDetails(details.filter((detail) => detail !== null)); // Filter out nulls
      };

      if (friends.length > 0) {
        fetchFriendDetails();
      } else {
        setFriendDetails([]);
      }
  }, [friends]);

  // search for users by email
  const handleSearch = async () => {
    // ensure searchInput is a string and trim whitespace
    const sanitizedInput = searchInput.trim();
    
    if (!sanitizedInput) {
      alert('Please enter a valid search input.');
      return;
    }

    const usersRef = collection(firestore, 'users');
    let searchQuery;

    if (sanitizedInput.includes('@')) {
      // search by email (exact match)
      searchQuery = query(usersRef, where('email', '==', sanitizedInput));
    } else {
      // search by name (partial match, case-insensitive)
      const lowerCaseInput = sanitizedInput.toLowerCase();
      searchQuery = query(
        usersRef,
        where('name', '==', sanitizedInput));
        // where('name', '>=', lowerCaseInput), 
        // where('name', '<', lowerCaseInput + '\uf8ff'));
    }

    try {
      const querySnapshot = await getDocs(searchQuery);

      if (!querySnapshot.empty) {
        const results = querySnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }));
        console.log('Search results:', results);
        setSearchResults(results);    // save results to state
      } else {

        setSearchResults([]);         // clear results if nothing found
      }
    } catch (e) {
      console.error("Error searching users:", e);
      alert('Failed to search. Please try again.');
    }

    // const q = query(usersRef, where('email', '==', searchEmail));
    // const snapshot = await getDocs(q);
    // if (!snapshot.empty) {
    //   const user = snapshot.docs[0];
    //   setSearchResults({uid: user.id, ...user.data() });
    // } else {
    //   setSearchResults([]);
    // }
  };

  // send a friend request
  const sendFriendRequest = async (friendId) => {
    console.log(friendId.uid);
    if (currentUser) {
      if (!friendId.uid || typeof friendId.uid !== 'string') {
        console.error("Invalid recipient UID:", friendId.uid);
        alert('Invalid recipient information.');
        return;
      }

      const friendRequestRef = doc(firestore, 'users', friendId.uid);
      console.log('Recipient Document Path:', friendRequestRef.path);
      try {
        
        await updateDoc(friendRequestRef, {
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
        alert('Request not sent. Please try again.');
      }
    }
  };

  // accept friend request
  const handleAcceptRequest = async (request) => {
    const userRef = doc(firestore, 'users', currentUser.uid);
    const requesterRef = doc(firestore, 'users', request.from);

    try {
      // Add to current user's friends
      await updateDoc(userRef, {
        friends: arrayUnion(request.from),
        friendRequests: arrayRemove(request),
      });

      // Add to requester's friends
      await updateDoc(requesterRef, {
        friends: arrayUnion(currentUser.uid),
      });

      // Update UI
      setFriendRequests((prev) => prev.filter((req) => req.from !== request.from));
      setFriends((prev) => [...prev, request.from]);
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  // deny a friend request
  const handleDenyRequest = async (request) => {
    const userRef = doc(firestore, 'users', currentUser.uid);
    try {
      await updateDoc(userRef, {
        friendRequests: arrayRemove(request),
      });

      // Update UI
      setFriendRequests((prev) => prev.filter((req) => req.from !== request.from));
    } catch (error) {
      console.error('Error denying friend request:', error);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant='h4' gutterBottom>Friends</Typography>
      <Divider sx={{ my: 2 }}/>
      <Box sx={{ mb: 4}}>
        <TextField
          label="Search by Name or Email"
          variant="outlined"
          fullWidth
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Button onClick={handleSearch} varaint="contained" sx={{ mt: 2}}>Search</Button>
        {searchResults.length > 0 ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Search Results</Typography>
            <List>
              {searchResults.map((result) => (
                <ListItem key={result.uid} sx={{display: 'flex', justifyContent: 'space-between' }}>
                  <ListItemText 
                    primary={result.name || 'No Name'}
                    secondary={result.email} />
                  <Button 
                    onClick={() => sendFriendRequest(result)}
                    variant="outlined"
                    sx={{ ml: 2 }}>
                      Send Friend Request
                    </Button>
                </ListItem>
              ))}
            </List>
            </Box>) : (
              <Typography variant="body2" sx={{ mt: 2 }}>
                No results found.
              </Typography>
            )}
            </Box>
      <Divider sx={{ my: 2}} />
      <Typography variant="h5">Friend Requests</Typography>
      <List>
        {friendRequests.map((request) => (
          <ListItem key={request.from} sx={{display: 'flex', justifyContent: 'space-between' }}>
            <ListItemText
              primary={request.email}
              secondary={new Date(request.timestamp).toLocaleString()}/>
          <Box>
            <Button onClick={() => handleAcceptRequest(request)} variant="contained" sx={{ mr: 1 }}>
              Accept
            </Button>
            <Button onClick={() => handleDenyRequest(request)} variant="outlined" color="error">
              Deny
            </Button>
          </Box>
          </ListItem>
        ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5">Friends</Typography>
        <List>
          {friendDetails.map((friendId) => (
            <ListItem key={friendId.uid}>
              <ListItemText 
                primary={friendId.name || 'Unknown'}
                secondary={friendId.email}/>
            </ListItem>
          ))}
      </List>
    </Box>
  );
};

export default FriendManagement;

