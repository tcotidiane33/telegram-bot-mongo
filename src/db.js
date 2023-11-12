require('dotenv').config();

const { MongoClient } = require('mongodb');

async function connectToDatabase() {
    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    try {
        await client.connect();
        console.log('Connected to the database');
        return client.db(); // Retourne la base de données
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
}

module.exports = { connectToDatabase };
