#project-root/
|-- src/
|   |-- client/
|   |   |-- components/
|   |   |   |-- Login.js
|   |   |   |-- Signup.js
|   |   |   |-- Product.js
|   |   |   |-- Cart.js
|   |   |   |-- Order.js
|   |   |   |-- Delivery.js
|   |   |   |-- Dashboard.js
|   |   |-- App.js
|   |   |-- index.js
|   |-- server/
|   |   |-- controllers/
|   |   |   |-- authController.js
|   |   |   |-- dashboardController.js
|   |   |   |-- productController.js
|   |   |-- models/
|   |   |   |-- userModel.js
|   |   |   |-- productModel.js
|   |   |-- views/
|   |   |   |-- index.ejs
|   |   |-- routes.js
|   |   |-- script.js
|-- public/
|   |-- style.css
|-- package.json


# Telegram-Bot-MongoDB

This is a chatbot for the messaging app Telegram, written in Python using the Telethon library. The chatbot is connected to a MongoDB database to store and retrieve data.

Youtube Video: https://youtu.be/IbJEB2QvUPI

APP_ID and API_HASH for telethon: https://my.telegram.org/auth

BOT_TOKEN: Write on telegram to @BotFather and follow the instruction
# telegram-bot-mongo
# telegram-bot-mongo



#forulaire local !
/*
        // Endpoint pour afficher le formulaire
        app.get('/', (req, res) => {
            res.send(`
                <form action="/save" method="post">
                    First Name: <input type="text" name="firstName" required><br>
                    Last Name: <input type="text" name="lastName" required><br>
                    Number: <input type="number" name="number" required><br>
                    Email: <input type="email" name="email" required><br>
                    Password: <input type="password" name="password" required><br>
                    <input type="submit" value="Submit">
                </form>
            `);
        });
        
        // Endpoint pour gérer l'enregistrement des données
        app.post('/save', bodyParser.urlencoded({ extended: false }), async (req, res) => {
            const { email, number, firstName, lastName, password } = req.body;
            
            try {
                const db = await connectToMongoDB();
                const collection = db.collection('login');
                await collection.insertOne({ email, number: parseInt(number), firstName, lastName, password });
                res.send('Data saved successfully');
            } catch (err) {
                console.error('Failed to save data:', err);
                res.send('Failed to save data. Please try again later.');
            } finally {
                client.close();
            }
        });
        
        */