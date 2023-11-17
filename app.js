require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const botToken = process.env.BOT_TOKEN;
const bot = new Telegraf(botToken);

const webAppUrl = 'https://novohub.odoo.com/';

const ARTICLE_TYPE = 'article';
const ARTICLE_ID = '1';

bot.on('inline_query', (ctx) => {
    const result = [{
        type: ARTICLE_TYPE,
        id: ARTICLE_ID,
        title: 'Open Web App',
        description: 'Click to open the web app in Telegram',
        input_message_content: {
            message_text: `Click here to open the web app in Telegram: ${webAppUrl}`,
        },
    }];

    ctx.answerInlineQuery(result);
});

bot.start((ctx) => {
    const welcomeMessage = `Welcome to the Web App Bot! Use the command /openwebapp to get a link to the web app.`;
    ctx.reply(welcomeMessage);
});

bot.command('openwebapp', (ctx) => {
    const linkMessage = `Click here to open the web app in Telegram: ${webAppUrl}`;
    ctx.reply(linkMessage);
});

bot.launch().then(() => {
    console.log('Le bot est en ligne!');
}).catch((err) => {
    console.error('Erreur lors du démarrage du bot:', err);
});
    