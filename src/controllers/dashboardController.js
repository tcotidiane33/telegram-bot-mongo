const express = require('express');

const router = express.Router();

router.get('/dashboard', async (req, res) => {
    try {
        const collections = await database.listCollections();
        res.render('dashboard', { collections });
    } catch (err) {
        console.error('Failed to retrieve collection names:', err);
        res.send('Failed to retrieve collection names. Please try again later.');
    }
});

router.post('/dashboard/update', async (req, res) => {
    const collectionName = req.body.collection;
    // Ajoute ici la logique de mise à jour selon tes besoins
    res.send(`Mise à jour réussie pour la collection ${collectionName}`);
});

router.post('/dashboard/delete', async (req, res) => {
    const collectionName = req.body.collection;
    // Ajoute ici la logique de suppression selon tes besoins
    res.send(`Suppression réussie pour la collection ${collectionName}`);
});

module.exports = router;
