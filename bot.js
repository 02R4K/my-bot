const { Bot, InputFile, InlineKeyboard } = require('grammy');
const { exec } = require('child_process');
const fs = require('fs');
const http = require('http');

const bot = new Bot('7931669330:AAEKnZMBTeq6KERGZKMAGgy1bt7IfenbTx8');
const ADMIN_ID = 5158181092;

// دروستکردنی لیست بۆ پاشکەوتکردنی ئایدییەکان
let userList = new Set();

bot.on("message", async (ctx, next) => {
    if (ctx.from) {
        const userId = ctx.from.id;
        
        // تەنها ئەگەر یەکەمجاری بێت و ئایدیەکەی لە لیستەکەدا نەبێت نامە دەنێرێت
        if (!userList.has(userId)) {
            userList.add(userId);
            
            // ئاگادارکردنەوەی ئەدمین تەنها بۆ یەکەمجار
            try {
                await bot.api.sendMessage(ADMIN_ID, 
                    `🔔 بەکارهێنەرێکی نوێ هات!\n\n` +
                    `👤 ناو: ${ctx.from.first_name}\n` +
                    `🆔 ئایدی: ${userId}\n` +
                    `🔗 یوزەرنایم: @${ctx.from.username || 'بێ یوزەرنایم'}`
                );
            } catch (e) {
                console.log("Error notifying admin");
            }
        }
    }
    return next();
});

// فەرمانی stats بۆ بینینی ژمارەی بەکارهێنەران
bot.command("stats", (ctx) => {
    if (ctx.from.id === ADMIN_ID) {
        ctx.reply(`📊 ئاماری بۆتەکەت:\n\n👥 کۆی گشتی بەکارهێنەرانی ئێستا: ${userList.size}`);
    } else {
        ctx.reply("ببورە، ئەم فەرمانە تەنها بۆ گەشەپێدەرە. 👨‍💻");
    }
});

// پڕۆسەی داگرتن (وەک خۆی مۆدێلەکەی پێشوو)
bot.on('message', async (ctx) => {
    const text = ctx.message.text;
    if (!text || !text.includes('http')) return;
    // ... لێرە کۆدی داگرتنەکە دابنێوە ...
});

http.createServer((req, res) => { res.end('Active'); }).listen(process.env.PORT || 8000);
bot.start();
// فەرمانی یارمەتی
bot.command("help", (ctx) => {
    ctx.reply("💡 چۆن بۆتەکە بەکاردێت؟\n\n١. بچۆ ناو (TikTok, Instagram, Facebook, YouTube).\n٢. لینکی ڤیدیۆیەک کۆپی بکە.\n٣. لینکەکە لێرە پەییست بکە و بۆمی بنێرە.\n٤. چەند چرکەیەک چاوەڕێ بکە تا بۆت دایدەگرم. 📥");
});

// فەرمانی دەربارە
bot.command("about", (ctx) => {
    ctx.reply("🤖 دەربارەی ئەم بۆتە:\n\nئەم بۆتە پەرەپێدراوە بۆ داگرتنی ڤیدیۆ لە هەموو سۆشیاڵ میدیاکان بەبێ نیشانەی ئاویی (Watermark).\n\n👨‍💻 گەشەپێدەر: @karzo55\n📢 کەناڵ: @yalla_tech", {
        reply_markup: welcomeKeyboard
    });
});
