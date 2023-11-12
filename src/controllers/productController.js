const express = require('express');

const router = express.Router();

router.get('/products', async (req, res) => {
    try {
        const products = await productModel.find({});
        res.render('products', { products });
    } catch (err) {
        console.error('Failed to retrieve products:', err);
        res.send('Failed to retrieve products. Please try again later.');
    }
});

module.exports = router;
