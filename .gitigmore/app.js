const Telegraf = require('telegraf');
const { MongoClient } = require('mongodb');
 
/**
 * Function to create and configure a Telegram bot associated with a MongoDB NoSQL database.
 *
 * @param {string} botToken - The token of the Telegram bot.
 * @param {string} mongoURI - The URI of the MongoDB database.
 * @returns {Telegraf} The configured Telegram bot instance.
 */
function createTelegramBot(botToken, mongoURI) {
    // Create a new instance of the Telegraf bot
    const bot = new Telegraf(botToken);
 
    // Connect to the MongoDB database
    MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
        if (err) {
            console.error('Failed to connect to MongoDB:', err);
        } else {
            console.log('Connected to MongoDB successfully');
 
            // Get the reference to the MongoDB database
            const db = client.db();
 
            // Set up the bot's commands and actions
 
            // Command: /start
            bot.start((ctx) => {
                ctx.reply('Welcome to the Telegram bot!');
            });
 
            // Command: /help
            bot.help((ctx) => {
                ctx.reply('This bot is associated with a MongoDB NoSQL database.');
            });
 
            // Command: /save
            bot.command('save', (ctx) => {
                // Get the user's message
                const message = ctx.message.text;
 
                // Save the message to the MongoDB database
                db.collection('messages').insertOne({ message }, (err, result) => {
                    if (err) {
                        console.error('Failed to save message to MongoDB:', err);
                        ctx.reply('Failed to save message. Please try again later.');
                    } else {
                        ctx.reply('Message saved successfully!');
                    }
                });
            });
 
            // Command: /get
            bot.command('get', (ctx) => {
                // Retrieve all messages from the MongoDB database
                db.collection('messages').find().toArray((err, messages) => {
                    if (err) {
                        console.error('Failed to retrieve messages from MongoDB:', err);
                        ctx.reply('Failed to retrieve messages. Please try again later.');
                    } else {
                        // Send the messages as a reply
                        ctx.reply(`Messages:\n${messages.map((m) => m.message).join('\n')}`);
                    }
                });
            });
        }
    });
 
    return bot;
}
 
// Usage Example
 
// Replace 'YOUR_BOT_TOKEN' with your actual Telegram bot token
const botToken = '6630470146:AAHKxRgt0-dkfeV4vCaGj3afshe7aONOkgI';
 
// Replace 'YOUR_MONGO_URI' with your actual MongoDB URI
const mongoURI = 'mongodb+srv://tcotidiane33:root@cluster0.fawr5tu.mongodb.net/';
 
// Create the Telegram bot
const bot = createTelegramBot(botToken, mongoURI);
 
// Start the bot
bot.launch();