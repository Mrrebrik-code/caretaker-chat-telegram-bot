require("dotenv").config();
const database = require("./database.js");
const { Telegraf, Markup, Scenes, Stage, session } = require('telegraf');

const db = new database();
const bot = new Telegraf(process.env.TOKEN_BOT);

//Прослушивание сообщений в чате
bot.on('text', (ctx) => {


    //Проверяем на то, ввел ли пользовтель команду добавления/удаления запрещенного пользователя
    if(ctx.message.text.includes("/forbidden")){

        let checkWord = checkingCommandWords(ctx.message.text)

        if(checkWord.isAdd == true){
            ctx.reply(`Я добавил слово "${checkWord.word}"`);
        }else{
            ctx.reply(`Я удалил слово "${checkWord.word}"`);
        }
    }

});

//Проверка на добавление/удаление запрещенного слова
function checkingCommandWords(inputCheck){
    let isChecking = false;
    let isCheckingSymbol = false;
    let word = "";

    for (var i = 0; i <  inputCheck.length; i++){
        if(isChecking == true){
            if(inputCheck[i] == "+")  isCheckingSymbol = true;   //Если + стоит пред словом, значит добавляем
            else if(inputCheck[i] == "-")  isCheckingSymbol = false; //Если + стоит пред словом, значит удаляем
            else word += inputCheck[i];
        }

        if(isChecking == false && inputCheck[i] == " ") isChecking = true;
    }

    let data = {
        isAdd: isCheckingSymbol,
        word: word
    }
    
    return data
}

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