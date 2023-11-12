const express = require('express');
const { connectToDBMiddleware } = require('./utils/database');
const authController = require('./controllers/authController');
const dashboardController = require('./controllers/dashboardController');
const productController = require('./controllers/productController');

const router = express.Router();

router.use(connectToDBMiddleware);

router.use('/', authController);
router.use('/', dashboardController);
router.use('/', productController);

module.exports = router;
