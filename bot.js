const { Bot, InputFile, InlineKeyboard } = require('grammy');
const { exec } = require('child_process');
const fs = require('fs');
const http = require('http');

// 1. زانیارییە سەرەکییەکان
const bot = new Bot('7931669330:AAEKnZMBTeq6KERGZKMAGgy1bt7IfenbTx8');
const ADMIN_ID = 5158181092;
let users = new Set();

const keyboard = new InlineKeyboard()
  .url("📢 کەناڵی فەرمی", "https://t.me/yalla_tech")
  .url("👨‍💻 گەشەپێدەر", "https://t.me/karzo55");

// 2. سیستەمی ئامار و ئاگادارکردنەوەی ئەدمین
bot.on("message", async (ctx, next) => {
    if (ctx.from && !users.has(ctx.from.id)) {
        users.add(ctx.from.id);
        const notification = `🔔 بەکارهێنەرێکی نوێ هات!\n\n👤 ناو: ${ctx.from.first_name}\n🆔 ئایدی: ${ctx.from.id}\n🔗 @${ctx.from.username || 'بێ یوزەرنایم'}`;
        try {
            await bot.api.sendMessage(ADMIN_ID, notification);
        } catch (e) { console.error("Admin notification failed"); }
    }
    return next();
});

// 3. فەرمانی دەستپێک
bot.command("start", (ctx) => {
    ctx.reply(`سڵاو ${ctx.from.first_name} گیان! 🌹\nبەخێربێیت بۆ **All Video Downloader**.\n\nتەنها لینکی ڤیدیۆ بنێرە بۆ داگرتن (FB, Insta, TikTok, YT).`, {
        parse_mode: "Markdown",
        reply_markup: keyboard
    });
});

// 4. فەرمانی ئامار (بۆ ئەدمین)
bot.command("stats", (ctx) => {
    if (ctx.from.id === ADMIN_ID) {
        ctx.reply(`📊 ئاماری بۆتەکەت:\n\n👥 تێکڕای بەکارهێنەران: ${users.size}`);
    } else {
        ctx.reply("ببورە، ئەم فەرمانە تەنها بۆ گەشەپێدەرە. 👨‍💻");
    }
});

// 5. پڕۆسەی داگرتنی ڤیدیۆ (خێراکراو + کووکیز)
bot.on('message', async (ctx) => {
    const text = ctx.message.text;
    if (!text || !text.startsWith('http')) return;

    const waitMsg = await ctx.reply('⏳ خەریکی داگرتنی ڤیدیۆکەم، تکایە چاوەڕێ بکە...');
    const fileName = `KarzoDL_${Date.now()}.mp4`;

    // بەکارهێنانی yt-dlp بە کووکیز و فۆرماتی باشتر
    // تێبینی: دەبێت فایلی cookies.txt لە گیتهەبەکەت هەبێت
    const downloadCmd = `yt-dlp --no-playlist --cookies cookies.txt --no-check-certificate --format "best[ext=mp4]/best" -o "${fileName}" "${text}"`;

    exec(downloadCmd, async (error) => {
        if (error) {
            console.error(error);
            await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
            return ctx.reply('❌ ببورە، کێشەیەک لە داگرتن دروست بوو. ڕەنگە سێرڤەر بڵۆک کرابێت یان کووکیزەکان بەسەرچووبن.');
        }

        try {
            await ctx.replyWithVideo(new InputFile(fileName), {
                caption: "✅ ڤیدیۆکەت بە سەرکەوتوویی داگیرا\n\n🆔 @KarzoDL_bot",
                reply_markup: keyboard
            });
            await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
            if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
        } catch (e) {
            ctx.reply('❌ ڤیدیۆکە داگیرا بەڵام لە کاتی ناردن کێشە دروست بوو (ڕەنگە قەبارەی زۆر بێت).');
        }
    });
});

// 6. ڕێکخستنی پۆرت بۆ Koyeb / Render
const PORT = process.env.PORT || 8000;
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot is Active and Running');
}).listen(PORT, '0.0.0.0');

bot.start();
