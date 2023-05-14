import { Telegraf, session } from "telegraf";
import { message } from "telegraf/filters";
import config from "config";
import { code } from "telegraf/format";
import { ogg } from "./ogg.js";
import { openai } from "./openai.js";

const INITIAL_SESSION = {
  messages: [],
}

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

bot.use(session())

bot.command('new', async (ctx) => {
  ctx.session = INITIAL_SESSION
  await ctx.reply("Жду Вашего голосовго или текстового сообщения")
})

bot.command("start", async (ctx) => {
  ctx.session = INITIAL_SESSION
  await ctx.reply(`Привет, дорогой пользователь! 
      \nЭто чат бот для общения с ChatGPT.
      \nТы можешь задать свой вопрос текстовым сообщением или записать аудиосообщение.
      \nЕсли вы хотите закончить старый и начать новый диалог с Chat GPT - используйте команду /new
      \nДерзай!`);
});

bot.command("prompt", async (ctx) => {
  try {
    const images = await openai.get_picture(ctx.message.text.slice(8).trim())
    await ctx.replyWithPhoto({url: images.data[0].url})
    await ctx.replyWithPhoto({url: images.data[1].url})
    console.log(images)

  } catch(e) {
    console.log("Something wrong with your prompt request")
    ctx.reply("Похоже запрос неподходящий")
  }
});


bot.on(message("voice"), async (ctx) => {
  ctx.session ??= INITIAL_SESSION
  try {
    await ctx.reply(code("Сообщение принял, думаю..."));

    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const userId = String(ctx.message.from.id);
    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.convert(oggPath, userId);

    const text = await openai.transcription(mp3Path);
    await ctx.reply(code(`Ваш запрос: ${text}`));

    ctx.session.messages.push({ role: openai.roles.USER, content: text });
    const response = await openai.chat(ctx.session.messages);
    ctx.session.messages.push({ role: openai.roles.ASSISTANT, content: response.content });

    await ctx.reply(response.content);
  } catch (e) {
    console.log(`Error while voice message`);
    ctx.reply("Похоже запрос неподходящий")
  }
});

bot.on(message("text"), async (ctx) => {
  ctx.session = ctx.session || INITIAL_SESSION;
  try {
    await ctx.reply(code("Сообщение принял, думаю..."));

    const text = ctx.message.text;
    const userId = String(ctx.message.from.id);

    console.log(text);

    await ctx.reply(code(`Ваш запрос: ${text}`));

    ctx.session.messages.push({ role: openai.roles.USER, content: text });
    const response = await openai.chat(ctx.session.messages);

    // if response
    ctx.session.messages.push({ role: openai.roles.ASSISTANT, content: response.content });

    await ctx.reply(response.content);
  } catch (e) {
    console.log(`Error while text message`, e.message)
    ctx.reply("Похоже запрос неподходящий")
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
