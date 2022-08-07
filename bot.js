require("dotenv").config();
const database = require("./database.js");
const { Telegraf, Markup, Scenes, Stage, session } = require('telegraf');

const db = new database();
const bot = new Telegraf(process.env.TOKEN_BOT);

//Прослушивание сообщений в чате
bot.on('text', (ctx) => {
    console.log(ctx);
    ctx.reply(`Hello ${ctx.message.text}`)
});

//Новый пользователь в чате
bot.on('new_chat_members', async (ctx) => {
    let user = {
        id: ctx.message.new_chat_members[0].id,
        firstname: ctx.message.new_chat_members[0].first_name,
        username: ctx.message.new_chat_members[0].username
    }
    let check = await db.addNewUser(user);

    if(check == true){
        ctx.reply(`Добро пожаловать в чат!`);
    }

    
    console.log(ctx.message.new_chat_members)
});

//Пользователь покинул чат
bot.on('left_chat_member', (ctx) => {
    ctx.reply(`Ну и пошел он лесом :) Нам и без него хорошо!`);
    console.log(ctx.message.left_chat_member)
});


bot.launch();
console.log("Started telegram bot!")