const { Bot, InputFile } = require('grammy');
const { exec } = require('child_process');
const fs = require('fs');
const axios = require('axios');

// تۆکنە نوێیەکەی تۆ
const bot = new Bot('7931669330:AAEKnZMBTeq6KERGZKMAGgy1bt7IfenbTx8');
const GROQ_API_KEY = 'Gsk_lG2tC7JeuYwTo5ErdiZpWGdyb3FYb4hsCXV0u71HTu8f7PMMuXre';

bot.on('message', async (ctx) => {
    const text = ctx.message.text;
    if (!text) return;

    // ئەگەر لینک بوو بۆ داگرتنی ڤیدیۆ
    if (text.includes('http')) {
        ctx.reply('خەریکم ڤیدیۆکە لە سۆشیاڵ میدیاوە دادەگرم... 📥');
        const fileName = `social_vid_${Date.now()}.mp4`;
        
        exec(`yt-dlp -f "best" --no-playlist -o "${fileName}" "${text}"`, (err) => {
            if (err) return ctx.reply('ببورە، نەمتوانی ئەم ڤیدیۆیە دابگرم.');
            ctx.replyWithVideo(new InputFile(fileName)).then(() => {
                if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
            });
        });
    } 
    // ئەگەر قسە بوو بۆ AI
    else {
        try {
            const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: "llama3-8b-8192",
                messages: [{ role: "system", content: "تۆ یاریدەدەرێکی کوردی." }, { role: "user", content: text }]
            }, { headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` } });
            ctx.reply(res.data.choices[0].message.content);
        } catch (e) {
            ctx.reply("AI ئێستا وەڵام ناداتەوە، بەڵام داگرتنی ڤیدیۆ کار دەکات.");
        }
    }
});

bot.start();
console.log('بۆتەکە بە سەرکەوتوویی چالاک بوو! ✅');


