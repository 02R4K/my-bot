const { Bot, InputFile, InlineKeyboard } = require('grammy');
const { exec } = require('child_process');
const fs = require('fs');
const http = require('http');

// 1. زانیارییەکان (تۆکن و ئایدی خۆت)
const bot = new Bot('7931669330:AAEKnZMBTeq6KERGZKMAGgy1bt7IfenbTx8');
const ADMIN_ID = 5158181092;
let users = new Set();

const keyboard = new InlineKeyboard()
  .url("📢 کەناڵ", "https://t.me/yalla_tech")
  .url("👨‍💻 گەشەپێدەر", "https://t.me/karzo55");

// 2. سیستەمی ئامار و ئاگادارکردنەوە
bot.on("message", async (ctx, next) => {
    if (ctx.from && !users.has(ctx.from.id)) {
        users.add(ctx.from.id);
        const msg = `🔔 نوێ:\n👤 ${ctx.from.first_name}\n🆔 ${ctx.from.id}\n🔗 @${ctx.from.username || 'بێ یوزەر'}`;
        try { await bot.api.sendMessage(ADMIN_ID, msg); } catch (e) {}
    }
    return next();
});

bot.command("start", (ctx) => {
    ctx.reply(`سڵاو ${ctx.from.first_name}! بەخێرهاتی بۆ بۆتی All Video Downloader. 📥\n\nتەنها لینکی ڤیدیۆکە بنێرە بۆ داگرتن.`, { reply_markup: keyboard });
});

bot.command("stats", (ctx) => {
    if (ctx.from.id === ADMIN_ID) {
        ctx.reply(`📊 بەکارهێنەرانی چالاک: ${users.size}`);
    }
});

// 3. داگرتنی ڤیدیۆ (TikTok, FB, Insta, YT)
bot.on('message', async (ctx) => {
    const text = ctx.message.text;
    if (!text || !text.startsWith('http')) return;

    const waitMsg = await ctx.reply('⏳ چاوەڕێ بکە... خەریکی داگرتنم');
    const fileName = `video_${Date.now()}.mp4`;

    // بەکارهێنانی فلتەری تایبەت بۆ تێپەڕاندنی هەندێک بڵۆک
    exec(`yt-dlp --no-playlist --no-check-certificate -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" -o "${fileName}" "${text}"`, async (error) => {
        if (error) {
            console.error(error);
            await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
            return ctx.reply('❌ ببورە، کێشەیەک لە داگرتن هەبوو. ڕەنگە لینکەکە پارێزراو بێت یان سێرڤەر بڵۆک کرابێت.');
        }

        try {
            await ctx.replyWithVideo(new InputFile(fileName), {
                caption: "✅ فەرموو ڤیدیۆکەت\n🆔 @KarzoDL_bot",
                reply_markup: keyboard
            });
            await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
            if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
        } catch (e) {
            ctx.reply('❌ ڤیدیۆکە زۆر گەورەیە یان کێشەی ناردنی هەیە.');
        }
    });
});

// 4. گرنگ بۆ Koyeb: دروستکردنی پۆرت بۆ ئەوەی بۆتەکە نەکوژێتەوە
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot is Active');
}).listen(process.env.PORT || 8000);

bot.start();
