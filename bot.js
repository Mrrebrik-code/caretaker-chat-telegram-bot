require("dotenv").config();
const { Telegraf, Markup, Scenes, Stage, session } = require('telegraf');


const bot = new Telegraf(process.env.TOKEN_BOT);



bot.launch();
console.log("Started telegram bot!")