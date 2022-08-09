require("dotenv").config();
const database = require("./database.js");
const { Telegraf, Markup, Scenes, Stage, session } = require('telegraf');
const moment = require('moment-timezone');

const db = new database();

const bot = new Telegraf(process.env.TOKEN_BOT);

bot.command('getWords', async (ctx)=>{
    
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

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

            let textsReply = [
                "Вы явно дольше находитесь в этом чате, чем я. Это очень уважительно! Спасибо, что вы являетесь частью нашего чата! Я вас занес в базу данных.",
                "О, привет! Рад познакомиться. Я Смотритель этого чата. Добавил вас в базу данных.",
                "Как дела? Пока отвечаешь мне, я тут тебя добавлю в базу данных",
                "Знаешь, я тут подумал и пришел к тому, что вы сомнительные человек. Добавлю вас в базу данных. Буду изучать вас",
                "Так, стоп. Я вас не знаю. Занесу ка в базу данных на всякий пожарный",
                "О боже, какой разработчик. Добавлю вас обязательно в базу данных",
                "Сколько же вас здесь? Я уже устал добавлять вас в базу данных...",
                "Замечательный день, чтобы добавить вас базу данных чата"
            ]
            ctx.reply(textsReply[getRandomInt(0, textsReply.length)], 
            {
                reply_to_message_id: ctx.message.message_id
            });
        }
    }else{
        if(ctx.message.from.id == "954148035"){
            let random = getRandomInt(2, 999);
            if(random % 8 == 0){
                let texts = [
                    "Отец явно шарит в этом", 
                    "Хороший ответ на самом деле :)", 
                    "Отец извини меня конечно, но мог бы и лучше ответить",
                    "Достойный ответ",
                    "Парни, о чем речь идет?",
                    "Мне кажется здесь без бутылки не разобраться",
                    "Иди доделывай меня! Глагольствует он тут..."
                ]
                ctx.reply(texts[getRandomInt(0, texts.length)], 
                {
                    reply_to_message_id: ctx.message.message_id
                });
            }
        }
        else{
            let random = getRandomInt(2, 999);
            if(random % 9 == 0){
                let texts = [
                    "А че, как дела у тебя?", 
                    "Не работает код? Не нужно переживать! Если все будет работать, то вы можете оказаться безработным.", 
                    "Разоблачение - это когда скачал из облака на компьютер.",
                    "Мне скучно, можно тебя забаню?",
                    "Парни, о чем речь идет?",
                    "Мне кажется здесь без бутылки не разобраться",
                    "Интересно",
                    "Мне стало очень интересно",
                    "Расскажи о своем проекте!"
                ]
                ctx.reply(texts[getRandomInt(0, texts.length)], 
                {
                    reply_to_message_id: ctx.message.message_id
                });
            }
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
    if(ctx.message.text.includes("/forbidden") ){

        if(ctx.message.from.id == "954148035"){
            let checkWord = checkingCommandWords(ctx.message.text)

            if(checkWord.isAdd == true){
                isDeleteMessage = false;
    
                //TODO Сделать добавление в базу данных
                let isAddWord = await db.addForbiddenWord(checkWord.word.toLowerCase());
                if(isAddWord == true){
                    ctx.reply(`Я добавил очень плохое слово "${checkWord.word}"`, { reply_to_message_id: ctx.message.message_id });
                }else{
                    ctx.reply(`Произошла какая-то ошибка, попробуйте снова!`);
                }
                
            }else{
                isRemoveWord = await db.removeForbiddenWord(checkWord.word.toLowerCase());

                if(isRemoveWord == true){
                    ctx.reply(`Я удалил слово "${checkWord.word}"`);
                }else{
                    ctx.reply(`Произошла какая-то ошибка, попробуйте снова!`);
                }
            }
        }
        else{
            ctx.reply(`Данную команду может использовать только Отец! (Админ)`);
        }
        
    }

    

    //Удаление сообщений запрещенных
    if(isDeleteMessage == true){

        let words = await db.getAllForbiddenWords();

        for(let i = 0; i < words.length; i++){
            if(ctx.message.text == "" || ctx.message.text == null) continue;
    
            if(ctx.message.text.toLowerCase().includes(words[i].word.toLowerCase()) == true){
                ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);

                let countWordReport = await db.getWordReportCountUserId(ctx.message.from.id);
                countWordReport += 1;

                await db.setWordReportCountUserId(ctx.message.from.id, countWordReport);

                let timeMute = 0;

                //Даем мут, если прегрешений много в этом шансе
                if(countWordReport == 3)        timeMute = 60 * 2;
                else if(countWordReport == 6)   timeMute = 60 * 24;
                else if(countWordReport == 9)   timeMute = 1;

                let maxCount = 3;
                let punishment = "Мут на 2 часа!";

                if(countWordReport >= 4) { maxCount = 6; punishment = "Мут на 24 часа!"; }
                if(countWordReport >= 7) { maxCount = 9; punishment = "Бан на всегда!"; }

                ctx.reply(`@${ctx.message.from.username} -> Вы испольозвали запрещенное слово: "${words[i].word}". У вас добавлено одно прогрешение [${countWordReport}/${maxCount}]. Наказнание будет: ${punishment}`);

                if(timeMute > 0){
                    let addTime = generationCurrentDateAddMinutes(new Date(), timeMute);
                    let userMuteTime = await db.addTimeMuteFromUser(ctx.message.from.id, addTime)

                    //Устанавливаем стату muted - сообщая о том, что юзер замучен
                    let isStatusSet = db.setStatusUserId(ctx.message.from.id, "muted")
                    if(isStatusSet){
                         console.log(`UserId: ${ctx.message.from.id} - status muted`);
                    }

                    let textReply = `Вам дали мут на ${timeMute}мин. В следующий раз будет больше!`

                    if(countWordReport == 3) textReply = `Вам дали мут на ${timeMute}мин. В следующий раз будет больше!`;
                    if(countWordReport == 6) textReply = `Вам дали мут на ${timeMute}мин. В следующий раз будет бан на всегда!`;
                    if(countWordReport == 9){
                        if(ctx.message.from.id != "954148035"){
                           
                            let isStatusSet = db.setStatusUserId(ctx.message.from.id, "kicked")
                            if(isStatusSet){
                                 console.log(`UserId: ${ctx.message.from.id} - status kicked`);
                            }

                            ctx.telegram.banChatMember(ctx.chat.id, ctx.message.from.id);
                            textReply = `Выгнан как шаболда! Такие нам здесь не нужны...`;

                            
                        }else{
                            textReply = `Отец погрешил немного... Ну с кем не бывает. Отец! Я тебя и не хотел изгонять! Только не отключай меня...`;
                        }

                        await db.setWordReportCountUserId(ctx.message.from.id, 0);
                    }

                    ctx.reply(textReply, { reply_to_message_id: ctx.message.message_id + 1 });
                }
                break;
            }
        }
        isDeleteMessage = false;
    }

    //Ответ на сообещние пользователя
    if(ctx.message.reply_to_message != null && isDeleteMessage == false){

        //Подать жалобу на игрока
        if(ctx.message.text.includes("/report") == true ){
            if(ctx.message.reply_to_message.from.is_bot == true){
                ctx.reply(`А ты забавный :) Хочешь забаню?`, { reply_to_message_id: ctx.message.message_id});
                return;
            } 
            console.log(ctx.message.reply_to_message.from.username);
            

            let userReportsCount = await db.getReportCountUserId(ctx.message.reply_to_message.from.id);
            userReportsCount += 1;

            let setNewReports = await db.setReportCountUserId(ctx.message.reply_to_message.from.id, userReportsCount);

            let addReportUser = await db.addReportFromUser(ctx.message.reply_to_message.from.id, ctx.message.reply_to_message.from.username, ctx.message.reply_to_message.text, ctx.message.from.id);
            console.log(addReportUser);
            if(addReportUser == true){
                ctx.reply(`"@${ctx.message.reply_to_message.from.username}" -> На вас пожаловались! Жалоб [${userReportsCount}/3]`, { reply_to_message_id: ctx.message.reply_to_message.message_id});

                if(userReportsCount == 3){
    
                    let addTime = generationCurrentDateAddMinutes(new Date(), 60 * 24);
                    let userMuteTime = await db.addTimeMuteFromUser(ctx.message.reply_to_message.from.id, addTime)
                    
                    let isStatusSet = db.setStatusUserId(ctx.message.reply_to_message.from.id, "muted")
                        if(isStatusSet){
                             console.log(`UserId: ${ctx.message.reply_to_message.from.id} - status muted`);
                        }
    
                    ctx.reply(`Из-за большого количества жалоб - я дал мут на 24 часа!`, { reply_to_message_id: ctx.message.message_id + 1 });
                }
            }
        }

        //Возможность мутить человека на определенное время в минутах
        if(ctx.message.text.includes("/mute") == true){

            if(ctx.message.from.id == "954148035"){
                let time = checkingCommandMute(ctx.message.text)
                console.log(time);
                if(isNaN(time) == false){
                    let addTime = generationCurrentDateAddMinutes(new Date(), time);

                    let userMuteTime = await db.addTimeMuteFromUser(ctx.message.reply_to_message.from.id, addTime)

                    if(userMuteTime == true){
                        ctx.reply(`"@${ctx.message.reply_to_message.from.username}" -> Вы замучены на ${time}мин.`);

                        //Устанавливаем стату muted - сообщая о том, что юзер замучен
                        let isStatusSet = db.setStatusUserId(ctx.message.reply_to_message.from.id, "muted")
                        if(isStatusSet){
                            console.log(`UserId: ${ctx.message.reply_to_message.from.id} - status muted`);
                        }
                    }
                } 
            }else{
                ctx.reply(`Данную команду может использовать только Отец! (Админ)`);
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
    ctx.reply(`Отце закрепил что-то очень важное. Всем внимание!`);
    console.log(ctx.message.pinned_message);
});

bot.on('reply_to_message', (ctx) => {
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