const { ObjectId } = require('mongodb');
const CheckIn = require('../models/CheckIn');

const checkInController = (db) => {
  const checkInModel = new CheckIn(db);

  // Handle check-in requests
  const createCheckIn = async (req, res) => {
    const { vunetId, diningHall, timestamp } = req.body;

    if (!vunetId || !diningHall || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const id = await checkInModel.createCheckIn({ vunetId, diningHall, timestamp });
      console.log('Check-in created:', id);
      res.status(201).json({ message: 'Check-in logged successfully', id });
    } catch (err) {
      console.error('Error creating check-in:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Handle fetching all check-ins
  const getAllCheckIns = async (req, res) => {
    try {
      const checkIns = await checkInModel.getAllCheckIns();
      console.log('Fetched Check-Ins:', checkIns);
      res.status(200).json(checkIns);
    } catch (err) {
      console.error('Error fetching check-ins:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Handle check-out updates
  const checkOut = async (req, res) => {
    const { id } = req.params;

    try {
      const modifiedCount = await checkInModel.updateCheckOut(new ObjectId(id));
      if (modifiedCount === 0) {
        return res.status(404).json({ error: 'Check-in not found' });
      }
      res.status(200).json({ message: 'Check-out updated successfully' });
    } catch (err) {
      console.error('Error updating check-out:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  return {
    createCheckIn,
    getAllCheckIns, // Optional
    checkOut, // Optional
  };
};

module.exports = checkInController;
