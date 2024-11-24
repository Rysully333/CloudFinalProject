import React, { useState } from 'react';
import { sendCheckInData } from '../services/api'; // Import the API call function

const CheckInForm = () => {
  const [vunetId, setVunetId] = useState('');
  const [diningHall, setDiningHall] = useState('Charmichael');
  const [loading, setLoading] = useState(false);

  const diningHalls = ['Commons', 'E. Bronson Ingram', 'Rothschild Dining Hall', 'Nicholas S. Zeppos', 'Rand Dining Center', 'The Pub at Overcup Oak', 'Kitchen at Kissam', 'Cafe Carmichael'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const timestamp = new Date().toISOString();
    const payload = { vunetId, diningHall, timestamp };

    try {
      const result = await sendCheckInData(payload); // Use the API utility function
      console.log('Server Response:', result);
      alert('Check-in successful!');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Dining Hall Check-In</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="vunetId" className="form-label">
                VUNetID
              </label>
              <input
                type="text"
                id="vunetId"
                className="form-control"
                placeholder="Enter your VUNetID"
                value={vunetId}
                onChange={(e) => setVunetId(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="diningHall" className="form-label">
                Select Dining Hall
              </label>
              <select
                id="diningHall"
                className="form-select"
                value={diningHall}
                onChange={(e) => setDiningHall(e.target.value)}
                required
              >
                {diningHalls.map((hall) => (
                  <option key={hall} value={hall}>
                    {hall}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Checking In...' : 'Check In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckInForm;
