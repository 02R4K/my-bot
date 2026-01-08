const { Bot, InputFile } = require('grammy');
const { exec } = require('child_process');
const fs = require('fs');

const bot = new Bot('7931669330:AAEKnZMBTeq6KERGZKMAGgy1bt7IfenbTx8');

bot.on('message', async (ctx) => {
    const text = ctx.message.text;
    if (text && text.includes('http')) {
        const waitMsg = await ctx.reply('خەریکم ڤیدیۆکە ئامادە دەکەم... 🔄');
        const fileName = `video_${Date.now()}.mp4`;

        exec(`yt-dlp -f "best" -o "${fileName}" "${text}"`, async (error) => {
            if (error) return ctx.reply('ببورە، کێشەیەک لە داگرتندا هەیە.');
            
            await ctx.replyWithVideo(new InputFile(fileName));
            await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
            if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
        });
    }
});

bot.start();
