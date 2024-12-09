const API_BASE_URL = 'http://localhost:5001'; // Adjust this based on your backend setup

export const sendCheckInData = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorDetails = await response.text(); // Retrieve backend error message
      console.error('API Error:', errorDetails);
      throw new Error(`Failed to check in: ${response.status} ${response.statusText}`);
    }

    return response.json(); // Return parsed JSON if successful
  } catch (err) {
    console.error('Network/API call failed:', err.message);
    throw err; // Re-throw error for the calling code to handle
  }
};
