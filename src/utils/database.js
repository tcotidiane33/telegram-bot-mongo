const { connectToDatabase } = require('./db');
let database;

const connectToDBMiddleware = async (req, res, next) => {
    try {
        if (!database) {
            database = await connectToDatabase();
        }
        req.database = database;
        next();
    } catch (error) {
        console.error('Error connecting to the database:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    connectToDBMiddleware,
};
