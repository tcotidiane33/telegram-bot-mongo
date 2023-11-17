require('dotenv').config(); // Charger les variables d'environnement depuis un fichier .env
const { Telegraf, session, Markup } = require('telegraf');
const { MongoClient } = require('mongodb');


const botToken = process.env.BOT_TOKEN; // Récupérer le token du bot depuis les variables d'environnement
const mongoURI = process.env.MONGO_URI; // Récupérer l'URI MongoDB depuis les variables d'environnement
const dbName = process.env.MONGO_DB;
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

const bot = new Telegraf(botToken);
bot.use(session());

const connectToMongoDB = async () => {
    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    return client.db(dbName);
};

MongoClient.connect(mongoURI, { useUnifiedTopology: true })
    .then(async (client) => {
        console.log('Connected to MongoDB successfully');
        const db = client.db();

        bot.start((ctx) => {
            const keyboard = Markup.inlineKeyboard([
                Markup.button.url('Open My Website', 'https://novohub.odoo.com/'),
            ]);
            ctx.reply('Click the button below to open my website:', { markup: keyboard });
        });

        bot.help((ctx) => {
            ctx.reply('This bot is associated with a MongoDB NoSQL database.');
        });

        // ... autres commandes

        bot.command('addDocument', (ctx) => {
            ctx.reply('Please enter the following information:');
            ctx.session.state = 'collectingInfo';
        });

        bot.on('text', async (ctx) => {
            if (ctx.session.state === 'collectingInfo') {
                try {
                    const novoDb = client.db('novo');
                    const collection = novoDb.collection('login');
                    const userInput = ctx.message.text.split('\n');
                    const [email, number, firstName, lastName] = userInput;

                    await collection.insertOne({
                        email,
                        number: parseInt(number),
                        firstName,
                        lastName,
                    });

                    ctx.reply('Document added successfully.');
                    ctx.session.state = undefined;
                } catch (err) {
                    console.error('Failed to add document to the collection:', err);
                    ctx.reply('Failed to add document. Please try again later.');
                }
            }
        });

        // ...

        bot.command('addDocument', (ctx) => {
            ctx.reply('Please enter the following information:');
            ctx.session.state = 'collectingInfo'; // Garder une trace de l'état actuel de la conversation
        });
        // Gérer la saisie de l'utilisateur et insérer le document dans la collection lorsque toutes les informations sont collectées.
        bot.on('text', async (ctx) => {
            if (ctx.session.state === 'collectingInfo') {
                try {
                    const novoDb = client.db('novo'); // Accéder à la base de données 'novo'
                    const collection = novoDb.collection('login'); // Accéder à la collection "novohub"

                    // Extraire les informations saisies par l'utilisateur depuis le message
                    const userInput = ctx.message.text.split('\n');
                    const [email, number, firstName, lastName] = userInput;

                    // Insérer les informations dans la collection
                    await collection.insertOne({
                        email,
                        number: parseInt(number),
                        firstName,
                        lastName,
                    });

                    ctx.reply('Document added successfully.');
                    ctx.session.state = undefined; // Réinitialiser l'état de la conversation
                } catch (err) {
                    console.error('Failed to add document to the collection:', err);
                    ctx.reply('Failed to add document. Please try again later.');
                }
            }
        });
        app.use(bodyParser.urlencoded({ extended: false }));
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


        app.listen(port, () => {
            console.log(`Server is listening at http://localhost:${port}`);
        });

        
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
    });

bot.launch();
