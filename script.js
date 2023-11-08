require('dotenv').config(); // Charger les variables d'environnement depuis un fichier .env

const { Telegraf, session, Markup } = require('telegraf');
const { MongoClient } = require('mongodb');


const botToken = process.env.BOT_TOKEN; // Récupérer le token du bot depuis les variables d'environnement
const mongoURI = process.env.MONGO_URI; // Récupérer l'URI MongoDB depuis les variables d'environnement

//const bot = new Telegraf(botToken);

// Initialisez le bot Telegram
const bot = new Telegraf(process.env.BOT_TOKEN);


MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((client) => {
        console.log('Connected to MongoDB successfully');
        const db = client.db();

        // Récupérez les collections de la base de données
        const collections = db.listCollections().toArray();

        bot.start((ctx) => {
            ctx.reply('Welcome to the Telegram bot!');
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
        
        
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
    });

bot.launch();
