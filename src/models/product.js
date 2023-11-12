const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    stock: Number,
    category: String,
    brand: String,
    model: String,
    imageLink: String,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
