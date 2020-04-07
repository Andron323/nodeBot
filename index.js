const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");

const TOKEN = "868091765:AAHtw0_MYyHSugZkbmcsKxz1AvQEJRb1f68";
const server = express();
const bot = new TelegramBot(TOKEN, { polling: true } );

const port = process.env.PORT || 80;
const gameName = "Billionaire";

const queries = {};

bot.onText(/\/echo (.+)/, function (msg, match) {
    var fromId = msg.from.id; // Получаем ID отправителя
    var resp = match[1]; // Получаем текст после /echo
    bot.sendMessage(fromId, resp);
});

bot.onText(/help/, (msg) => bot.sendMessage(msg.from.id, "This bot implements a Billionaire game. Say /game if you want to play."));
bot.onText(/start|game/, (msg) => bot.sendGame(msg.from.id, gameName));
bot.on("callback_query", function (query) {
    if (query.game_short_name !== gameName) {
        bot.answerCallbackQuery(query.id, "Sorry, '" + query.game_short_name + "' is not available.");
    } else {
        queries[query.id] = query;
        // let gameurl = "https://trexgame.herokuapp.com/index.html?id="+query.id;
        let gameurl = "http://92.53.120.10/TyGZKPcs?af_siteid={source_game_id}";
        bot.answerCallbackQuery({
            callback_query_id: query.id,
            url: gameurl
        });
    }
});
bot.on("inline_query", function(iq) {
      bot.answerInlineQuery(iq.id, [ { type: "game", id: "0", game_short_name: gameName } ] );
});

server.use(express.static(path.join(__dirname, 'public')));

server.get("/highscore/:score", function(req, res, next) {
    if (!Object.hasOwnProperty.call(queries, req.query.id)) return next();
    let query = queries[req.query.id];
    let options;
    if (query.message) {
        options = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
        };
    } else {
        options = {
            inline_message_id: query.inline_message_id
        };
    }
    bot.setGameScore(query.from.id, parseInt(req.params.score), options, 
        function (err, result) {});
});
server.listen(port, ()=> {
    console.log("Server has been started")
});
