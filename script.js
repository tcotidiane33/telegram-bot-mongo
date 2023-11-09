require('dotenv').config(); // Charger les variables d'environnement depuis un fichier .env
const { Telegraf, session, Markup } = require('telegraf');
const { MongoClient } = require('mongodb');


const botToken = process.env.BOT_TOKEN; // Récupérer le token du bot depuis les variables d'environnement
const mongoURI = process.env.MONGO_URI; // Récupérer l'URI MongoDB depuis les variables d'environnement

const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

// Initialisez le bot Telegram
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((client) => {
        console.log('Connected to MongoDB successfully');
        const db = client.db();

        // Récupérez les collections de la base de données
        const collections = db.listCollections().toArray();

        bot.start((ctx) => {
            ctx.reply('Welcome to the Telegram bot! \n Commands:lorsque l\'utilisateur envoie la commande /addDocument, le bot commencera à collecter les informations requises sous forme de texte. Les utilisateurs devront envoyer les informations séparées par des sauts de ligne (une information par ligne, dans l\'ordre : email, number, firstName, lastName). Une fois que toutes les informations sont collectées, le bot les insérera dans la collection *novohub* de la base de données *novo* \b -Pour accéder à la collection "novohub" de la base de données "novo" lorsque l\'utilisateur envoie la commande /accessCollection  \b   lorsque tu exécutes la commande /dbstats, le bot enverra les statistiques pour la base de données *novo* et les collections *novohub* et *carts*.');
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
        try {
            const novoDb = client.db('novo'); // Accède à la base de données 'novo'
            const collection = novoDb.collection('novohub'); // Accède à la collection "novohub"

            // Ici, tu peux effectuer des opérations sur la collection, par exemple, récupérer des documents, les mettre à jour, etc.
            const documents = await collection.find({}).toArray();

            const response = `Documents in 'novohub' collection:\n${JSON.stringify(documents, null, 2)}`;
            ctx.reply(response);
        } catch (err) {
                console.error('Failed to access the collection:', err);
                ctx.reply('Failed to access the collection. Please try again later.');
            }
        });
        bot.command('addDocument', (ctx) => {
            ctx.reply('Please enter the following information:');
            ctx.session.state = 'collectingInfo'; // Garder une trace de l'état actuel de la conversation
        });
        // Gérer la saisie de l'utilisateur et insérer le document dans la collection lorsque toutes les informations sont collectées.
        bot.on('text', async (ctx) => {
            if (ctx.session.state === 'collectingInfo') {
                try {
                    const novoDb = client.db('novo'); // Accéder à la base de données 'novo'
                    const collection = novoDb.collection('novohub'); // Accéder à la collection "novohub"

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
                    Email: <input type="text" name="email"><br>
                    Number: <input type="number" name="number"><br>
                    First Name: <input type="text" name="firstName"><br>
                    Last Name: <input type="text" name="lastName"><br>
                    <input type="submit" value="Submit">
                </form>
            `);
        });
        // Endpoint pour gérer l'enregistrement des données
        app.post('/save', async (req, res) => {
            const { email, number, firstName, lastName } = req.body;
            
            // Insérer les données dans la collection MongoDB
            const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
            try {
                await client.connect();
                const novoDb = client.db('novo');
                const collection = novoDb.collection('novohub');
                await collection.insertOne({ email, number: parseInt(number), firstName, lastName });
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
