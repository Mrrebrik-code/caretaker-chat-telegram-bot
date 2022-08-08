require("dotenv").config();
const database = require("./database.js");
const { Telegraf, Markup, Scenes, Stage, session } = require('telegraf');

const db = new database();
const bot = new Telegraf(process.env.TOKEN_BOT);

const words = ["Война", "Жопа", "Свинья"];

//Прослушивание сообщений в чате
bot.on('text', (ctx) => {
    //Проверяем на то, ввел ли пользовтель команду добавления/удаления запрещенного пользователя

    let isDeleteMessage = true;

    if(ctx.message.text.includes("/forbidden")){

        let checkWord = checkingCommandWords(ctx.message.text)

        if(checkWord.isAdd == true){
            isDeleteMessage = false;
            
            //TODO Сделать добавление в базу данных
            if(ctx.message.from.id == "954148035"){
                ctx.reply(`Отец! Я добавил очень плохое слово "${checkWord.word}"`, {
                    reply_to_message_id: ctx.message.message_id
                });
            }
            else{
                ctx.reply(`Я добавил очень плохое слово "${checkWord.word}"`, {
                    reply_to_message_id: ctx.message.message_id
                });
            }
            
            //ctx.reply(`Я добавил слово "${checkWord.word}"`);
        }else{
            ctx.reply(`Я удалил слово "${checkWord.word}"`);
        }
    }


    if(isDeleteMessage == true){
        for(let i = 0; i < words.length; i++){
            if(ctx.message.text == "" || ctx.message.text == null) continue;
    
            if(ctx.message.text.toLowerCase().includes(words[i].toLowerCase()) == true){
                ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
                ctx.reply(`"@${ctx.message.from.username}" -> Вы испольозвали запрещенное слово: "${words[i]}". У вас добавлено одно прогрешение [1/3]`);
            }
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


//Закрепил сообщение
bot.on('pinned_message', (ctx) => {
    ctx.reply(`asdasd`);
    console.log(ctx.message.pinned_message);
});

bot.on('forward_from_chat', (ctx) => {
    ctx.reply(`forward_from_chat`);
    console.log(ctx.message.forward_from_chat);
});

//Пользователь покинул чат
bot.on('left_chat_member', (ctx) => {
    ctx.reply(`Ну и пошел он лесом :) Нам и без него хорошо!`);

    console.log(ctx.message.left_chat_member)
});


bot.launch();
console.log("Started telegram bot!")