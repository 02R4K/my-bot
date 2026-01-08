const { Bot, InputFile, InlineKeyboard } = require('grammy');
const { exec } = require('child_process');
const fs = require('fs');

const bot = new Bot('7931669330:AAEKnZMBTeq6KERGZKMAGgy1bt7IfenbTx8');
const ADMIN_ID = 5158181092;

// دروستکردنی دوگمەکان بۆ بەخێرهاتن
const welcomeKeyboard = new InlineKeyboard()
  .url("📢 کەناڵی فەرمی", "https://t.me/yalla_tech")
  .url("👨‍💻 گەشەپێدەر", "https://t.me/karzo55")
  .row()
  .url("📦 سورس کۆد", "https://github.com/O2R4K/my-bot");

// فەرمانی ستارت و بەخێرهاتن
bot.command("start", (ctx) => {
    const welcomeMsg = `سڵاو ${ctx.from.first_name} گیان! 🌹\n\nبەخێربێیت بۆ بۆتی **KarzoDL**.\n\nئەم بۆتە یارمەتیت دەدات ڤیدیۆکانی (TikTok, YouTube, Instagram) بە بێ لۆگۆ و بە کوالێتی بەرز دابگریت. 📥\n\nتەنها لینکی ڤیدیۆکە بنێرە و من بۆت ئامادە دەکەم.`;
    
    ctx.reply(welcomeMsg, {
        parse_mode: "Markdown",
        reply_markup: welcomeKeyboard
    });
});

// فەرمانی ئامار بۆ ئەدمین
bot.command("stats", (ctx) => {
    if (ctx.from.id === ADMIN_ID) {
        ctx.reply("🚀 سڵاو خاوەنەکەم! بۆتەکە لەسەر سێرڤەری Koyeb بە باشی کار دەکات.");
    }
});

bot.on('message', async (ctx) => {
    const text = ctx.message.text;
    if (!text || !text.includes('http')) return;

    const waitMsg = await ctx.reply('خەریکم ڤیدیۆکە ئامادە دەکەم، تکایە کەمێک چاوەڕێ بکە... ⏳');
    const fileName = `KarzoDL_${Date.now()}.mp4`;

    exec(`yt-dlp -f "best" -o "${fileName}" "${text}"`, async (error) => {
        if (error) {
            return ctx.reply('ببورە، کێشەیەک لە داگرتنی ئەم لینکەدا هەیە. ❌');
        }

        try {
            await ctx.replyWithVideo(new InputFile(fileName), {
                caption: "✅ ڤیدیۆکەت ئامادەیە\n\n📥 داگیراوە لە لایەن: @KarzoDL_bot",
                reply_markup: welcomeKeyboard
            });
            await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
            if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
        } catch (e) {
            ctx.reply('ببورە، قەبارەی ڤیدیۆکە زۆر گەورەیە بۆ تێلیگرام.');
        }
    });
});

bot.start();
