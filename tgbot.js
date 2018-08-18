const Telegraf = require('telegraf')
const getVideo = require('./getvid')
const bot = new Telegraf(process.env.TG_TOKEN)

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
bot.hears(/(youtube\.com|youtu\.be)/, async ctx => {
	const msg = ctx.update.message
	console.info(msg)
	try {
		const id = parseId(msg.text.trim())
		const { stream, adaptive } = await getVideo(id)
		const sstr = '**Stream**\n' + stream.map(s => `[${s.quality}](${s.url})`).join('\n')
		await ctx.tg.sendMessage(msg.chat.id, sstr, { parse_mode: 'Markdown' })
		const astr =
			'**Adaptive**\n' +
			adaptive.map(s => `[${(s.quality_label ? s.quality_label + ':' : '') + s.type}](${s.url})`).join('\n')
		await ctx.tg.sendMessage(msg.chat.id, astr, { parse_mode: 'Markdown' })
	} catch (e) {
		console.error(e)
		await ctx.tg.sendMessage(
			ctx.chat.id,
			'Invalid URL!\nSend a correct URL to me, and I will retrieve raw video URL for you.'
		)
	}
})
bot.start(ctx => {
	return ctx.tg.sendMessage('Send a YouTube video URL to me, and I will retrieve raw video URL for you.')
})

const WEBHOOK_PATH = '/bot' + process.env.TG_TOKEN
bot.telegram
	.setWebhook(process.env.WEBHOOK_URL + WEBHOOK_PATH)
	.then(() => bot.telegram.getWebhookInfo())
	.then(console.info)
exports.bot = bot
exports.WEBHOOK_PATH = WEBHOOK_PATH

if (require.main === module) {
	bot.startWebhook(WEBHOOK_PATH, null, process.env.PORT)
}
