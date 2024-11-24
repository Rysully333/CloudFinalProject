class CheckIn {
    constructor(db) {
      this.collection = db.collection('checkins'); // Reference the `checkins` collection
    }
  
    // Add a new check-in
    async createCheckIn({ vunetId, diningHall, timestamp }) {
      const result = await this.collection.insertOne({
        vunetId,
        diningHall,
        timestamp,
        isCheckedOut: false, // Default status
      });
      return result.insertedId;
    }
  
    // Fetch all check-ins (optional, useful for debugging or reporting)
    async getAllCheckIns() {
      return await this.collection.find({}).toArray();
    }
  
    // Update a check-in to mark it as checked out (if needed)
    async updateCheckOut(id) {
      const result = await this.collection.updateOne(
        { _id: id },
        { $set: { isCheckedOut: true } }
      );
      return result.modifiedCount;
    }
  }
  
  module.exports = CheckIn;
  