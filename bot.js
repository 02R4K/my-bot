const { Bot, InputFile, InlineKeyboard, GrammyError, HttpError } = require('grammy');
const { exec } = require('child_process');
const fs = require('fs');
const http = require('http');

// 1. زانیارییەکان
const bot = new Bot('7931669330:AAEKnZMBTeq6KERGZKMAGgy1bt7IfenbTx8');
const ADMIN_ID = 5158181092;
let users = new Set();

// 2. چارەسەری وەستانی بۆت (گرنگترین بەش بۆ Koyeb)
bot.catch((err) => {
    const e = err.error;
    console.error("Error detected, but bot will keep running:");
    if (e instanceof GrammyError) console.error("Telegram Error:", e.description);
    else if (e instanceof HttpError) console.error("Network Error:", e);
    else console.error("Unknown Error:", e);
});

const keyboard = new InlineKeyboard()
  .url("📢 کەناڵ", "https://t.me/yalla_tech")
  .url("👨‍💻 گەشەپێدەر", "https://t.me/karzo55");

// 3. تۆمارکردنی بەکارهێنەران
bot.on("message", async (ctx, next) => {
    if (ctx.from && !users.has(ctx.from.id)) {
        users.add(ctx.from.id);
        try {
            await bot.api.sendMessage(ADMIN_ID, `🔔 بەکارهێنەرێکی نوێ هات!\n👤 ناو: ${ctx.from.first_name}\n🆔 ئایدی: ${ctx.from.id}`);
        } catch (e) {}
    }
    return next();
});

// 4. فەرمانەکان (Commands)
bot.command("start", (ctx) => ctx.reply(`سڵاو ${ctx.from.first_name}! 🌹\nلینکی ڤیدیۆ بنێرە بۆ داگرتن.`, { reply_markup: keyboard }));

bot.command("stats", (ctx) => {
    if (ctx.from.id === ADMIN_ID) ctx.reply(`📊 ئامار:\n👥 بەکارهێنەران: ${users.size}`);
});

bot.command("help", (ctx) => ctx.reply("💡 لینکێکی (TikTok, FB, IG) بنێرە و چاوەڕێ بکە."));

bot.command("about", (ctx) => ctx.reply("🤖 بۆتی داگرتنی ڤیدیۆ\n👨‍💻 پەرەپێدەر: @karzo55", { reply_markup: keyboard }));

// 5. داگرتن (بە بێ کووکیز بۆ ئەوەی تووشی هەڵە نەبێت ئەگەر فایلت نەبوو)
bot.on('message', async (ctx) => {
    const text = ctx.message.text;
    if (!text || !text.startsWith('http')) return;

    const waitMsg = await ctx.reply('⏳ چاوەڕێ بکە... خەریکی پشکنینم');
    const fileName = `vid_${Date.now()}.mp4`;

    // بەکارهێنانی فۆرماتێکی سووک بۆ ئەوەی خێرا بێت و سێرڤەر نەوەستێت
    exec(`yt-dlp --no-playlist --no-check-certificate -f "best[ext=mp4]" -o "${fileName}" "${text}"`, async (error) => {
        if (error) {
            await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
            return ctx.reply('❌ ببورە، کێشەیەک لە داگرتن هەبوو. (ڕەنگە لینکەکە پارێزراو بێت)');
        }

        try {
            await ctx.replyWithVideo(new InputFile(fileName), { caption: "✅ فەرموو ڤیدیۆکەت" });
            await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
            if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
        } catch (e) {
            ctx.reply('❌ کێشە لە ناردنی ڤیدیۆکە.');
        }
    });
});

// 6. ڕاگرتنی بۆتەکە بە زیندوویی لە Koyeb
http.createServer((req, res) => { res.end('Bot is Alive'); }).listen(process.env.PORT || 8000);

bot.start();
