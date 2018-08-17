// https://github.com/yagop/node-telegram-bot-api/issues/476
process.env.NTBA_FIX_319 = 1

const TelegramBot = require('node-telegram-bot-api')
const getVideo = require('./getvid')
const bot = new TelegramBot(process.env.TG_TOKEN, { webHook: { autoOpen: false, port: process.env.PORT } })

bot.openWebHook()
	.then(() => bot.setWebHook(process.env.WEBHOOK_URL + '/bot' + process.env.TG_TOKEN))
	.then(() => bot.getWebHookInfo())
	.then(console.log)

const parseId = url => {
	const u = new URL(url)
	const d = u.hostname
		.split('.')
		.reverse()
		.slice(0, 2)
		.reverse()
		.join('.')
	switch (d) {
		case 'youtube.com':
			return u.searchParams.get('v')
		case 'youtu.be':
			return u.pathname.slice(1)
		default:
			console.log(u)
			throw new Error('Invalid URL!')
	}
}
bot.on('text', async msg => {
	console.info(msg)
	try {
		const id = parseId(msg.text.trim())
		const { stream, adaptive } = await getVideo(id)
		const sstr = '**Stream**\n' + stream.map(s => `[${s.quality}](${s.url})`).join('\n')
		await bot.sendMessage(msg.chat.id, sstr, { parse_mode: 'Markdown' })
		const astr =
			'**Adaptive**\n' +
			adaptive.map(s => `[${(s.quality_label ? s.quality_label + ':' : '') + s.type}](${s.url})`).join('\n')
		await bot.sendMessage(msg.chat.id, astr, { parse_mode: 'Markdown' })
	} catch (e) {
		bot.sendMessage(
			msg.chat.id,
			'Invalid URL!\nSend a correct URL to me, and I will retrive raw YouTube url for you.'
		)
	}
})
