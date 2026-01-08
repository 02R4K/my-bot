const { Bot, InputFile, InlineKeyboard } = require('grammy');
const { exec } = require('child_process');
const fs = require('fs');

const bot = new Bot('7931669330:AAEKnZMBTeq6KERGZKMAGgy1bt7IfenbTx8');
const ADMIN_ID = 5158181092;

// دروستکردنی دوگمەکان (بە بێ سورس کۆد)
const welcomeKeyboard = new InlineKeyboard()
  .url("📢 کەناڵی فەرمی", "https://t.me/yalla_tech")
  .url("👨‍💻 گەشەپێدەر", "https://t.me/karzo55");

bot.command("start", (ctx) => {
    const welcomeMsg = `سڵاو ${ctx.from.first_name} گیان! 🌹\n\nبەخێربێیت بۆ بۆتی **KarzoDL**.\n\nتەنها لینکی ڤیدیۆکە بنێرە و من بۆت ئامادە دەکەم. 📥`;
    
    ctx.reply(welcomeMsg, {
        parse_mode: "Markdown",
        reply_markup: welcomeKeyboard
    });
});

bot.command("stats", (ctx) => {
    if (ctx.from.id === ADMIN_ID) {
        ctx.reply("🚀 سڵاو خاوەنەکەم! بۆتەکە چالاکە.");
    }
});

bot.on('message', async (ctx) => {
    const text = ctx.message.text;
    if (!text || !text.includes('http')) return;

    const waitMsg = await ctx.reply('⏳ چاوەڕێ بکە...');
    const fileName = `KarzoDL_${Date.now()}.mp4`;

    exec(`yt-dlp -f "best" -o "${fileName}" "${text}"`, async (error) => {
        if (error) return ctx.reply('ببورە، کێشەیەک لە داگرتنی ئەم لینکەدا هەیە. ❌');

        try {
            await ctx.replyWithVideo(new InputFile(fileName), {
                caption: "✅ ڤیدیۆکەت ئامادەیە\n\n@KarzoDL_bot",
                reply_markup: welcomeKeyboard
            });
            await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
            if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
        } catch (e) {
            ctx.reply('ببورە، کێشەیەک لە ناردن هەبوو.');
        }
    });
});

bot.start();
