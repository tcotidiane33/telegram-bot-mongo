const express = require('express');

const router = express.Router();

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', async (req, res) => {
    try {
        const { email, password, firstName, lastName, number } = req.body;
        const user = await userModel.create({ email, password, firstName, lastName, number });
        res.redirect('/products');
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/signin', (req, res) => {
    res.render('signin');
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email, password });
    if (user) {
        res.redirect('/dashboard');
    } else {
        res.send('Échec de la connexion. Vérifiez vos informations d\'identification.');
    }
});

module.exports = router;
