const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // Importe mongoose

const { connectToDatabase } = require('./models/db');
const User = require('./models/user');
const Product = require('./models/product');

const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
let database;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware de gestion des erreurs global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});


app.use(async (req, res, next) => {
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
});

const renderPage = (res, page, data = {}) => {
    res.render(page, data);
};

app.get('/signup', (req, res) => renderPage(res, 'signup'));
app.post('/signup', async (req, res) => {
    try {
        const { email, password, firstName, lastName, number } = req.body;

        const newUser = new User({ email, password, firstName, lastName, number });
        await newUser.save();

        res.redirect('/products');
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/signin', (req, res) => renderPage(res, 'signin'));
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
        res.redirect('/dashboard');
    } else {
        res.send('Échec de la connexion. Vérifiez vos informations d\'identification.');
    }
});

app.get('/dashboard', async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        renderPage(res, 'dashboard', { collections });
    } catch (err) {
        console.error('Failed to retrieve collection names:', err);
        res.send('Failed to retrieve collection names. Please try again later.');
    }
});

// Endpoint pour obtenir la disponibilité des stocks
app.get('/api/stock/:collectionName', async (req, res) => {
    const { collectionName } = req.params;

    try {
        const Collection = mongoose.model(collectionName);
        const count = await Collection.countDocuments({});
        res.json({ stock: count });
    } catch (error) {
        console.error(`Erreur lors de la récupération de la disponibilité des stocks pour la collection ${collectionName}: ${error.message}`);
        res.status(500).json({ error: 'Erreur de récupération des stocks' });
    }
});

// Endpoint pour la mise à jour d'une collection
app.post('/dashboard/update', async (req, res) => {
    const collectionName = req.body.collection;

    try {
        const Collection = mongoose.model(collectionName);

        // Ajoute ici la logique de mise à jour selon tes besoins
        // Par exemple, mettre à jour la propriété 'someProperty' à une nouvelle valeur
        await Collection.updateMany({}, { $set: { someProperty: 'nouvelleValeur' } });

        res.send(`Mise à jour réussie pour la collection ${collectionName}`);
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de la collection ${collectionName}: ${error.message}`);
        res.status(500).send(`Erreur lors de la mise à jour de la collection ${collectionName}`);
    }
});

// Endpoint pour la suppression d'une collection
app.post('/dashboard/delete', async (req, res) => {
    const collectionName = req.body.collection;

    try {
        const Collection = mongoose.model(collectionName);

        // Ajoute ici la logique de suppression selon tes besoins
        // Par exemple, supprimer tous les documents de la collection
        await Collection.deleteMany({});

        res.send(`Suppression réussie pour la collection ${collectionName}`);
    } catch (error) {
        console.error(`Erreur lors de la suppression de la collection ${collectionName}: ${error.message}`);
        res.status(500).send(`Erreur lors de la suppression de la collection ${collectionName}`);
    }
});

app.get('/products', async (req, res) => {
    try {
        const products = await Product.find({}).exec();
        renderPage(res, 'products', { products });
    } catch (err) {
        console.error('Failed to retrieve products:', err);
        res.send('Failed to retrieve products. Please try again later.');
    }
});

// Endpoint pour obtenir la disponibilité des stocks
app.get('/api/stock/:collectionName', async (req, res) => {
    const { collectionName } = req.params;

    try {
        const Collection = mongoose.model(collectionName);
        const count = await Collection.countDocuments({});
        res.json({ stock: count });
    } catch (error) {
        console.error(`Erreur lors de la récupération de la disponibilité des stocks pour la collection ${collectionName}: ${error.message}`);
        res.status(500).json({ error: 'Erreur de récupération des stocks' });
    }
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});


// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connecté à MongoDB');
        // ... autres initialisations si nécessaire ...
    })
    .catch(err => console.error('Erreur de connexion à MongoDB:', err));

