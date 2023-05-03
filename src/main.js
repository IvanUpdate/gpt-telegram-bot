import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import config from "config";
import { code } from "telegraf/format";
import { ogg } from "./ogg.js";
import { openai } from "./openai.js";

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

bot.command("start", async (ctx) => {
  await ctx.reply(`Привет, дорогой пользователь! 
      \nЭто чат бот для общения с ChatGPT.
      \nТы можешь задать свой вопрос текстовым сообщением или записать аудиосообщение.
      \nДерзай!`);
});

bot.command("prompt", async (ctx) => {
  try {
    const text = await ctx.reply(ctx.message.text.slice(8))
    console.log(text)

  } catch(e) {
    console.log("Something wrong with your prompt request". e.message)
  }
});

bot.on(message("voice"), async (ctx) => {
  try {
    await ctx.reply(code("Сообщение принял, думаю..."));

    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const userId = String(ctx.message.from.id);
    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.convert(oggPath, userId);

    const text = await openai.transcription(mp3Path);
    await ctx.reply(code(`Ваш запрос: ${text}`));

    const messages = [{ role: openai.roles.USER, content: text }];
    const response = await openai.chat(messages);

    await ctx.reply(response.content);
  } catch (e) {
    console.log(`Error while voice message`, e.message);
  }
});

bot.on(message("text"), async (ctx) => {
  try {
    await ctx.reply(code("Сообщение принял, думаю..."));

    const text = await ctx.message.text;
    const userId = String(ctx.message.from.id);

    console.log(text);

    await ctx.reply(code(`Ваш запрос: ${text}`));

    const messages = [{ role: openai.roles.USER, content: text }];
    const response = await openai.chat(messages);

    await ctx.reply(response.content);
  } catch (e) {
    console.log(`Error while text message`, e.message);
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
