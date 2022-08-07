require("dotenv").config();
const database = require("./database.js");
const { Telegraf, Markup, Scenes, Stage, session } = require('telegraf');

const db = new database();
const bot = new Telegraf(process.env.TOKEN_BOT);

//Прослушивание сообщений в чате
bot.on('text', (ctx) => {

    if(ctx.message.text.includes("/forbidden")){
        console.log("test");
        let isChecking = false;
        let isCheckingSymbol = false;
        let word = "";

        for (var i = 0; i <  ctx.message.text.length; i++){
            if(isChecking == true){
                if(ctx.message.text[i] == "+"){
                    isCheckingSymbol = true;
                }
                else if(ctx.message.text[i] == "-"){
                    isCheckingSymbol = false;
                }
                else{
                    word += ctx.message.text[i];
                }
            }

            if(isChecking == false && ctx.message.text[i] == " "){
                isChecking = true;
            }    
        }


        if(isCheckingSymbol){
            ctx.reply(`Я добавил слово "${word}"`);
        }else{
            ctx.reply(`Я удалил слово "${word}"`);
        }
    }
    else{
        console.log("test2");
    }

});

//Новый пользователь в чате
bot.on('new_chat_members', async (ctx) => {

    //Объект пользователя для базы данных
    let user = {
        id: ctx.message.new_chat_members[0].id,
        firstname: ctx.message.new_chat_members[0].first_name,
        username: ctx.message.new_chat_members[0].username
    }
    let check = await db.addNewUser(user);

    //Если успешно добавлено в базу данных
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