const { Bot, InputFile, InlineKeyboard, GrammyError, HttpError } = require('grammy');
const { exec } = require('child_process');
const fs = require('fs');
const http = require('http');

// 1. زانیارییەکان
const bot = new Bot('7931669330:AAEKnZMBTeq6KERGZKMAGgy1bt7IfenbTx8');
const ADMIN_ID = 5158181092;
const DB_FILE = 'users.json';

// بارکردنی داتابەیسی بەکارهێنەران بۆ ئەوەی ئامار نەبێتەوە بە سفر
let userData = { ids: [] };
if (fs.existsSync(DB_FILE)) {
    userData = JSON.parse(fs.readFileSync(DB_FILE));
}

function saveUser(id) {
    if (!userData.ids.includes(id)) {
        userData.ids.push(id);
        fs.writeFileSync(DB_FILE, JSON.stringify(userData));
        return true; // بەکارهێنەری نوێیە
    }
    return false; // پێشتر هەبووە
}

// 2. چارەسەری هەموو جۆرە هەڵەیەک (بۆ ئەوەی وەک وێنەی 6699 بۆتەکە نەوەستێت)
bot.catch((err) => {
    const e = err.error;
    console.error("Error caught:");
    if (e instanceof GrammyError) console.error("Telegram Error:", e.description);
    else if (e instanceof HttpError) console.error("Network Error:", e);
    else console.error("Unknown Error:", e);
});

const keyboard = new InlineKeyboard()
  .url("📢 کەناڵ", "https://t.me/yalla_tech")
  .url("👨‍💻 گەشەپێدەر", "https://t.me/karzo55");

// 3. سیستەمی ئاگادارکردنەوەی زیرەک
bot.on("message", async (ctx, next) => {
    if (ctx.from) {
        const isNew = saveUser(ctx.from.id);
        if (isNew) {
            try {
                await bot.api.sendMessage(ADMIN_ID, 
                    `🔔 بەکارهێنەرێکی نوێ هات!\n\n👤 ناو: ${ctx.from.first_name}\n🆔 ئایدی: ${ctx.from.id}\n🔗 @${ctx.from.username || 'بێ یوزەر'}`
                );
            } catch (e) {}
        }
    }
    return next();
});

// 4. فەرمانەکان
bot.command("start", (ctx) => ctx.reply(`سڵاو ${ctx.from.first_name}! 🌹\nبەخێربێیت، لینکی ڤیدیۆ بنێرە بۆ داگرتن.`, { reply_markup: keyboard }));

bot.command("stats", (ctx) => {
    if (ctx.from.id === ADMIN_ID) {
        ctx.reply(`📊 ئاماری گشتی:\n\n👥 کۆی بەکارهێنەرانی تۆمارکراو: ${userData.ids.length}`);
    }
});

bot.command("help", (ctx) => ctx.reply("💡 لینکەکە لێرە دابنێ و چاوەڕێ بکە تا بۆت دایدەگرم."));
bot.command("about", (ctx) => ctx.reply("🤖 بۆتی All Video Downloader\nپەرەپێدەر: @karzo55", { reply_markup: keyboard }));

// 5. داگرتنی خێرا (Optimized for speed)
bot.on('message', async (ctx) => {
    const text = ctx.message.text;
    if (!text || !text.startsWith('http')) return;

    const waitMsg = await ctx.reply('⏳ خەریکی داگرتنم، تکایە چاوەڕێ بکە...');
    const fileName = `Karzo_${Date.now()}.mp4`;

    // بەکارهێنانی yt-dlp بە ڕێکخستنی خێرا
    exec(`yt-dlp --no-playlist --no-check-certificate -f "best[ext=mp4]/best" -o "${fileName}" "${text}"`, async (error) => {
        if (error) {
            try { await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id); } catch(e){}
            return ctx.reply('❌ ببورە، ئەم لینکە دانەگیرا. ڕەنگە سێرڤەر بڵۆک کرابێت.');
        }

        try {
            await ctx.replyWithVideo(new InputFile(fileName), {
                caption: "✅ ڤیدیۆکەت بە سەرکەوتوویی داگیرا\n🆔 @KarzoDL_bot",
                reply_markup: keyboard
            });
            await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
            if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
        } catch (e) {
            ctx.reply('❌ کێشە لە ناردنی ڤیدیۆکە (ڕەنگە قەبارەی زۆر بێت).');
        }
    });
});

// 6. زیندوو هێشتنەوە لە سێرڤەر
http.createServer((req, res) => { res.end('Bot is Running'); }).listen(process.env.PORT || 8000);

bot.start();
