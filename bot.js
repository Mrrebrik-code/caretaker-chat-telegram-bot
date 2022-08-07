require("dotenv").config();
const { Telegraf, Markup, Scenes, Stage, session } = require('telegraf');


const bot = new Telegraf(process.env.TOKEN_BOT);

//Прослушивание сообщений в чате
bot.on('text', (ctx) => {
    console.log(ctx);
    ctx.reply(`Hello ${ctx.message.text}`)
});

//Новый пользователь в чате
bot.on('new_chat_members', (ctx) => {
    ctx.reply(`Добро пожаловать в чат!`);
    console.log(ctx.message.new_chat_members)
});

bot.on('left_chat_member', (ctx) => {
    ctx.reply(`Ну и пошел он лесом :) Нам и без него хорошо!`);
    console.log(ctx.message.left_chat_member)
});

bot.launch();
console.log("Started telegram bot!")