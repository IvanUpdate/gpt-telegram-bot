import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import config from 'config'
import { ogg } from './ogg.js'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

// bot.on(message('text'), async ctx => {
//     await ctx.reply(JSON.stringify(ctx.message, null, 2))
//     await ctx.reply("Hi, Kira")
// })

bot.on(message('voice'), async ctx => {
    try {   
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)
        const oggPath = await ogg.create(link.href, userId)
        await ctx.reply(JSON.stringify(link, null, 2))
    } catch(e) {
        console.log(`Error while voice message`, e.message)
    }

    
})
bot.command('start', async (ctx) => {
    await ctx.reply(`Привет, дорогой пользователь! \nЭто чат бот для общения с ChatGPT.\nТы можешь задать свой вопрос текстовым сообщением или записать аудиосообщение.\nДерзай!`)
})



bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

