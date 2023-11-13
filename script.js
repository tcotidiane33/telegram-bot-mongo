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

// Initialisez le bot Telegram
const bot = new Telegraf(botToken);
bot.use(session());
const connectToMongoDB = async () => {
    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    return client.db(dbName);
};
const getCollections = async () => {
    const db = await connectToMongoDB();
    return db.listCollections().toArray();
};


MongoClient.connect(mongoURI, { useUnifiedTopology: true })
    .then((client) => {
        console.log('Connected to MongoDB successfully');
        const db = client.db();

        // Récupérez les collections de la base de données
        const collections = db.listCollections().toArray();

        bot.start((ctx) => {
            ctx.reply(`Welcome to the Telegram bot! \n
                Commands:
                - To start collecting information, use the command /addDocument. The bot will prompt you to send the required information as separate lines (email, number, firstName, lastName). Once all information is collected, the bot will insert it into the 'login' collection of the 'novo' database.
                - To access the 'login' collection of the 'novo' database, use the command /accessCollection.
                - To get database statistics, use the command /dbstats. The bot will provide statistics for the 'novo' database and the 'login' collection.`);
        });
        

        bot.help((ctx) => {
            ctx.reply('This bot is associated with a MongoDB NoSQL database.');
        });

        bot.command('save', (ctx) => {
            const message = ctx.message.text;

            db.collection('messages').insertOne({ message })
                .then((result) => {
                    ctx.reply('Message saved successfully!');
                })
                .catch((err) => {
                    console.error('Failed to save message to MongoDB:', err);
                    ctx.reply('Failed to save message. Please try again later.');
                });
        });

        bot.command('get', (ctx) => {
            db.collection('messages').find().toArray()
                .then((messages) => {
                    const messageText = messages.map((m) => m.message).join('\n');
                    ctx.reply(`Messages:\n${messageText}`);
                })
                .catch((err) => {
                    console.error('Failed to retrieve messages from MongoDB:', err);
                    ctx.reply('Failed to retrieve messages. Please try again later.');
                });
        });
        bot.command('collections', (ctx) => {
            collections
                .then((collectionNames) => {
                    const collectionNamesString = collectionNames.map((collection) => collection.name).join('\n');
                    ctx.reply(`Collections:\n${collectionNamesString}`);
                })
                .catch((err) => {
                    console.error('Failed to retrieve collection names:', err);
                    ctx.reply('Failed to retrieve collection names. Please try again later.');
                });
        });
        bot.command('dbstats', async (ctx) => {
            try {
                const novoDb = client.db('novo'); // Accède à la base de données 'novo'
                const stats = await novoDb.command({ dbStats: 1, scale: 1024 }); // Utilise la commande dbStats pour obtenir des statistiques
        
                const response = `
                    Database Name: ${stats.db}
                    Collections: ${stats.collections}
                    Objects: ${stats.objects}
                    Data Size (KB): ${stats.dataSize}
                    Storage Size (KB): ${stats.storageSize}
                `;

                ctx.reply(response);
            } catch (err) {
                console.error('Failed to retrieve database stats:', err);
                ctx.reply('Failed to retrieve database stats. Please try again later.');
            }
        });
        bot.command('accessCollection', async (ctx) => {
            const collectionName = ctx.message.text.split(' ')[1];
            
            try {
                const db = await connectToMongoDB();
                const collection = db.collection(collectionName);
                const documents = await collection.find({}).toArray();
                const response = `Documents in '${collectionName}' collection:\n${JSON.stringify(documents, null, 2)}`;
                ctx.reply(response);
            } catch (err) {
                console.error(`Failed to access the collection '${collectionName}':`, err);
                ctx.reply(`Failed to access the collection '${collectionName}'. Please try again later.`);
            }
        });
        // ...

        bot.command('accessCarts', async (ctx) => {
            try {
                const novoDb = client.db('novo');
                const collection = novoDb.collection('carts');

                const documents = await collection.find({}).toArray();

                const response = `Documents in 'carts' collection:\n${JSON.stringify(documents, null, 2)}`;
                ctx.reply(response);
            } catch (err) {
                console.error('Failed to access the collection "carts":', err);
                ctx.reply('Failed to access the collection "carts". Please try again later.');
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


        app.listen(port, () => {
            console.log(`Server is listening at http://localhost:${port}`);
        });

        
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
    });

bot.launch();
