const { Bot, InputFile, InlineKeyboard } = require('grammy');
const { exec } = require('child_process');
const fs = require('fs');
const http = require('http');

// ١. زانیارییە سەرەکییەکان
const bot = new Bot('7931669330:AAEKnZMBTeq6KERGZKMAGgy1bt7IfenbTx8');
const ADMIN_ID = 5158181092;
let users = new Set(); // بۆ پاشکەوتکردنی ئایدی بەکارهێنەران

// ٢. کیبۆردی کەناڵ و گەشەپێدەر
const welcomeKeyboard = new InlineKeyboard()
  .url("📢 کەناڵی فەرمی", "https://t.me/yalla_tech")
  .url("👨‍💻 گەشەپێدەر", "https://t.me/karzo55");

// ٣. سیستەمی ئاگادارکردنەوەی ئەدمین و تۆمارکردنی بەکارهێنەر
bot.on("message", async (ctx, next) => {
    if (ctx.from && !users.has(ctx.from.id)) {
        users.add(ctx.from.id);
        
        // نامە بۆ تۆ دێت کاتێک کەسێکی نوێ بۆتەکە بەکاردێنێت
        const notification = `🔔 بەکارهێنەرێکی نوێ هات!\n\n👤 ناو: ${ctx.from.first_name}\n🆔 ئایدی: ${ctx.from.id}\n🔗 یوزەرنایم: @${ctx.from.username || 'بێ یوزەرنایم'}`;
        try {
            await bot.api.sendMessage(ADMIN_ID, notification);
        } catch (e) { console.error("Error sending notification"); }
    }
    return next();
});

// ٤. فەرمانی Start
bot.command("start", (ctx) => {
    ctx.reply(`سڵاو ${ctx.from.first_name} گیان! 🌹\n\nبەخێربێیت بۆ **All Video Downloader**.\n\nتەنها لینکی ڤیدیۆ بنێرە (TikTok, Instagram, FB, YouTube) تا بۆت دابگرم. 📥`, {
        parse_mode: "Markdown",
        reply_markup: welcomeKeyboard
    });
});

// ٥. فەرمانی Stats (تەنها بۆ ئەدمین)
bot.command("stats", (ctx) => {
    if (ctx.from.id === ADMIN_ID) {
        ctx.reply(`📊 ئاماری بۆتەکەت:\n\n👥 کۆی گشتی بەکارهێنەران: ${users.size}`);
    } else {
        ctx.reply("ببورە، ئەم فەرمانە تەنها بۆ گەشەپێدەرە. 👨‍💻");
    }
});

// ٦. پڕۆسەی داگرتنی ڤیدیۆ
bot.on('message', async (ctx) => {
    const text = ctx.message.text;
    if (!text || !text.includes('http')) return;

    const waitMsg = await ctx.reply('⏳ خەریکی پشکنینی لینکەکەم، تکایە چاوەڕێ بکە...');
    const fileName = `video_${Date.now()}.mp4`;

    // بەکارهێنانی yt-dlp بۆ داگرتنی ڤیدیۆ لە هەموو سایتەکان
    exec(`yt-dlp --no-playlist --format "best[ext=mp4]/best" -o "${fileName}" "${text}"`, async (error) => {
        if (error) {
            await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
            return ctx.reply('ببورە، کێشەیەک لە داگرتنی ئەم ڤیدیۆیە هەیە. ❌');
        }

        try {
            await ctx.replyWithVideo(new InputFile(fileName), {
                caption: "✅ ڤیدیۆکەت بە سەرکەوتوویی داگیرا\n\n🆔 @KarzoDL_bot",
                reply_markup: welcomeKeyboard
            });
            await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
            if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
        } catch (e) {
            ctx.reply('ببورە، کێشەیەک لە ناردنی ڤیدیۆکە دروست بوو.');
        }
    });
});

// ٧. ڕێکخستنی پۆرت بۆ Koyeb (بۆ ئەوەی هەمیشە Healthy بێت)
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot is running on Koyeb');
}).listen(8000, '0.0.0.0');

bot.start();
