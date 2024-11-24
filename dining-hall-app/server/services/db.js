const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://tutkudnazli:7WNfwfG8wRtyBr5p@cluster0.jv6k8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connectToDatabase = async () => {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        return client.db("dining_hall_app");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};

module.exports = connectToDatabase;
