require("dotenv").config();
const database = require("./database.js");
const { Telegraf, Markup, Scenes, Stage, session } = require('telegraf');
const moment = require('moment-timezone');

const db = new database();
const bot = new Telegraf(process.env.TOKEN_BOT);

const words = ["Война", "Жопа", "Свинья"];

//Прослушивание сообщений в чате
bot.on('text', async (ctx) => {
    
    let isUserToDatabase = await db.trySearchUserId(ctx.message.from.id);

    if(isUserToDatabase == false){
        let user = {
            id: ctx.message.from.id,
            firstname: ctx.message.from.first_name,
            username: ctx.message.from.username
        }

        let check = await db.addNewUser(user);

        //Если успешно добавлено в базу данных
        if(check == true){
            let isStatusSet = db.setStatusUserId(user.id, "joined")
            if(isStatusSet){
                console.log(`UserId: ${user.id} - status joined to database`);
            }
            ctx.reply(`Вы явно дольше находитесь в этом чате. Это очень уважительно. Спасибо, что вы являетесь частью нашего чата! Я вас занес в базу данных.`, 
            {
                reply_to_message_id: ctx.message.message_id
            });
        }
    }


    //Разрешено ли удалаять сообщения
    let isDeleteMessage = true;

    //Делаем проверку, нет ли мута у пользователя
    let date = await db.getTimeMuteUser(ctx.message.from.id)
    if(date != "false"){
        var dateUser = moment(date);
        var currentDate = moment(new Date());
    
        console.log(dateUser);
        console.log(currentDate);
    
        //Сравниваем время в муте и текущее время. 
        //Если время в мете меньше текущего, то даем написать сообщение.
        var tes = moment(dateUser).isBefore(currentDate); 
        if(tes == false){
            ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
            return;
        } else{

            //Устанавливаем стату joined - сообщая о том, что юзер размучен и имеет все права, как и обычный вступивший
            let isStatusSet = db.setStatusUserId(ctx.message.from.id, "joined")
            if(isStatusSet){
                 console.log(`UserId: ${ctx.message.from.id} - status unmuted`);
            }

            let clearMute = await db.addTimeMuteFromUser(ctx.message.from.id, "false")
        }
    }

    //Проверяем на то, ввел ли пользовтель команду добавления/удаления запрещенного пользователя
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
        }else{
            ctx.reply(`Я удалил слово "${checkWord.word}"`);
        }
    }

    

    //Удаление сообщений запрещенных
    if(isDeleteMessage == true){
        for(let i = 0; i < words.length; i++){
            if(ctx.message.text == "" || ctx.message.text == null) continue;
    
            if(ctx.message.text.toLowerCase().includes(words[i].toLowerCase()) == true){
                ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);

                let countWordReport = await db.getWordReportCountUserId(ctx.message.from.id);
                countWordReport += 1;

                await db.setWordReportCountUserId(ctx.message.from.id, countWordReport);

                let timeMute = 0;
                if(countWordReport == 3){
                    timeMute = 1;

                }else if(countWordReport == 6){
                    timeMute = 2;
                }else if(countWordReport == 9){
                    timeMute = 3;
                }

                if(timeMute > 0){
                    let addTime = generationCurrentDateAddMinutes(new Date(), timeMute);
                    let userMuteTime = await db.addTimeMuteFromUser(ctx.message.from.id, addTime)
                    ctx.reply(`"@${ctx.message.from.username}" -> Вам дали мут на ${timeMute}мин. В следующий раз будет больше!`);
                }

                let maxCount = 3;

                if(countWordReport >= 4){
                    maxCount = 6;
                }
                if(countWordReport >= 7){
                    maxCount = 9;
                }
                

                ctx.reply(`"@${ctx.message.from.username}" -> Вы испольозвали запрещенное слово: "${words[i]}". У вас добавлено одно прогрешение [${countWordReport}/${maxCount}]`);
            }
        }
        isDeleteMessage = false;
    }

    //Ответ на сообещние пользователя
    if(ctx.message.reply_to_message != null && isDeleteMessage == false){

        //Подать жалобу на игрока
        if(ctx.message.text.includes("/report")){
            console.log(ctx.message.reply_to_message.from.username);
            ctx.reply(`"@${ctx.message.reply_to_message.from.username}" -> На вас пожаловались! Это значит вы что-то себя ведете хреново. Нужно подумать над вашем поведением. У вас добавлено жалоба [1/5]. Если наберете все 5, мы вас кикнем! Но прежде Отце проверит. Может жалоба фальшифка!`);
        }

        //Возможность мутить человека на определенное время в минутах
        if(ctx.message.text.includes("/mute")){
            let time = checkingCommandMute(ctx.message.text)
            console.log(time);
            if(isNaN(time) == false){
                let addTime = generationCurrentDateAddMinutes(new Date(), time);

                let userMuteTime = await db.addTimeMuteFromUser(ctx.message.reply_to_message.from.id, addTime)

                if(userMuteTime == true){
                    ctx.reply(`"@${ctx.message.reply_to_message.from.username}" -> Вы замучены на ${time}мин. [1/3]`);

                    //Устанавливаем стату muted - сообщая о том, что юзер замучен
                    let isStatusSet = db.setStatusUserId(ctx.message.reply_to_message.from.id, "muted")
                    if(isStatusSet){
                         console.log(`UserId: ${ctx.message.reply_to_message.from.id} - status muted`);
                    }
                }
                
            }
        }
    }
});

    //Сгенерировать текущую дату и добавить к ней количество минут
    //Выдат дату в определенном формате: "YYYY-MM-DD HH:mm:ss [GMT]ZZ"
    function generationCurrentDateAddMinutes(date, addTime) {

        date.setTime(date.getTime() + (addTime * 60 * 1000));
        date.setHours(date.getHours());
        var addTime = date, zone = "Asia/Tomsk";
        var m = moment(addTime);

        moment.fn.zoneName = function () {
            var abbr = this.zoneAbbr();
            return abbrs[abbr] || abbr;
        };

        console.log(m.format('YYYY-MM-DD HH:mm:ss [GMT]ZZ'));
        return m.format('YYYY-MM-DD HH:mm:ss [GMT]ZZ');
      }

//Проверка на добавление времени к муту пользователя
function checkingCommandMute(inputCheck){
    let isChecking = false;
    let time = "";

    for (var i = 0; i <  inputCheck.length; i++){
        if(isChecking == true){
            time += inputCheck[i];
        }

        if(isChecking == false && inputCheck[i] == " ") isChecking = true;
    }

    return parseInt(time);
}

//Проверка на добавление/удаление запрещенного слова
function checkingCommandWords(inputCheck){
    let isChecking = false;
    let isCheckingSymbol = false;
    let word = "";

    for (var i = 0; i <  inputCheck.length; i++){
        if(isChecking == true){
            if(inputCheck[i] == "+")  isCheckingSymbol = true;   //Если + стоит пред словом, значит добавляем
            else if(inputCheck[i] == "-")  isCheckingSymbol = false; //Если - стоит пред словом, значит удаляем
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

    let checkUser = await db.trySearchUserId(user.id);

    if(checkUser == true){
        ctx.reply(`О, какие люди! С возвращением! А мы уже думали что не вернетесь :)`);
    }
    else{
        let check = await db.addNewUser(user);

        //Если успешно добавлено в базу данных
        if(check == true){
            ctx.reply(`Добро пожаловать в чат!`);
        }
    }

    //Устанавливаем стату joined - сообщая о том, что юзер вступил
    let isStatusSet = db.setStatusUserId(user.id, "joined")
    if(isStatusSet){
        console.log(`UserId: ${user.id} - status joined`);
    }

    
    console.log(ctx.message.new_chat_members)
});


//Закрепил сообщение
bot.on('pinned_message', (ctx) => {
    ctx.reply(`asdasd`);
    console.log(ctx.message.pinned_message);
});

bot.on('reply_to_message', (ctx) => {
    ctx.reply(`reply_to_message`);
    console.log(ctx.message.reply_to_message);
});

//Пользователь покинул чат
bot.on('left_chat_member', (ctx) => {

    //Устанавливаем стату leaved - сообщая о том, что юзер вышел
    let isStatusSet = db.setStatusUserId(ctx.message.left_chat_member.id, "leaved")

    if(isStatusSet){
        console.log(`UserId: ${ctx.message.left_chat_member.id} - status leaved`);
    }

    ctx.reply(`Ну и пошел он лесом :) Нам и без него хорошо!`);

    console.log(ctx.message.left_chat_member)
});


bot.launch();
console.log("Started telegram bot!")