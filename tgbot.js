// https://github.com/yagop/node-telegram-bot-api/issues/476
process.env.NTBA_FIX_319 = 1

const cache = require('memory-cache')
const uuidv4 = require('uuid/v4')
const TelegramBot = require('node-telegram-bot-api')
const getVideo = require('./getvid')
const getBestThumbnail = require('./thumbnail')
const bot = new TelegramBot(process.env.TG_TOKEN)

const AN_HOUR = 1000 * 60 * 60

const parseId = url => {
	try {
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
	} catch (e) {
		throw new Error('Invalid URL!')
	}
}
const getUrlsFromMsg = msg =>
	msg.entities.filter(e => e.type === 'url').map(e => msg.text.slice(e.offset, e.offset + e.length))
bot.on('text', async msg => {
	console.info(msg)
	if (/^\/start/.test(msg.text)) {
		return bot.sendMessage(
			msg.chat.id,
			'Send a YouTube video URL to me, and I will retrieve raw video URL for you.'
		)
	}
	if (/^\/play/.test(msg.text)) {
		const id = msg.text.slice(6) //strip
		const { url, mime, title } = cache.get(id) || {}
		if (!url) {
			return bot.sendMessage(
				msg.chat.id,
				'No video matching the id are found!\nMaybe it has been deleted from cache.'
			)
		} else {
			console.info(`${id} -> ${url}`)
			const handleError = e => {
				console.info(e.response.body)
				bot.sendMessage(
					msg.chat.id,
					`Failed to send video! Please try the others.
Possible reasons: Telegram doesn\'t support this filetype or the video to too big.`
				)
			}
			if (mime.includes('video')) {
				return bot.sendVideo(msg.chat.id, url, {}, { filename: title, contentType: mime }).catch(handleError)
			} else if (mime.includes('audio')) {
				return bot.sendAudio(msg.chat.id, url, {}, { filename: title, contentType: mime }).catch(handleError)
			} else {
				return bot.sendMessage(msg.chat.id, 'This video is not supported to play in Telegram.')
			}
		}
	}
	const urls = getUrlsFromMsg(msg)
	let validUrlCnt = 0
	for (const url of urls) {
		try {
			const id = parseId(url)
			const { stream, adaptive, meta } = await getVideo(id)

			// add video uuid
			for (const s of stream) {
				s.uuid = uuidv4().replace(/-/g, '_')
				cache.put(
					s.uuid,
					{
						url: s.url,
						mime: s.type,
						title: meta.title
					},
					AN_HOUR
				)
			}
			for (const s of adaptive) {
				s.uuid = uuidv4().replace(/-/g, '_')
				cache.put(
					s.uuid,
					{
						url: s.url,
						mime: s.type,
						title: meta.title
					},
					AN_HOUR
				)
			}

			const thumbnail = await getBestThumbnail(meta.thumbnail_url)
			const { message_id: photomsgid } = await bot.sendPhoto(msg.chat.id, thumbnail, {
				caption: `[${meta.title}](https://www.youtube.com/watch?v=${id})`,
				parse_mode: 'Markdown'
			})
			const sstr =
				'**Stream**\n' +
				stream
					.map(s => `[${s.quality}:${s.type}](${s.url}) /play\\_${s.uuid.replace(/_/g, '\\_')}`)
					.join('\n\n')
			const astr =
				'**Adaptive**\n' +
				adaptive
					.map(
						s =>
							`[${(s.quality_label ? s.quality_label + ':' : '') + s.type}](${
								s.url
							}) /play\\_${s.uuid.replace(/_/g, '\\_')}`
					)
					.join('\n\n')
			await bot.sendMessage(msg.chat.id, sstr, {
				parse_mode: 'Markdown',
				reply_to_message_id: photomsgid
			})
			await bot.sendMessage(msg.chat.id, astr, {
				parse_mode: 'Markdown',
				reply_to_message_id: photomsgid
			})
			validUrlCnt++
		} catch (e) {
			// invalid url
			console.info(e)
		}
	}
	if (validUrlCnt === 0) {
		// show error message if the message doesn't contain any URL
		await bot.sendMessage(
			msg.chat.id,
			'Invalid URL!\nSend a correct URL to me, and I will retrieve raw video URL for you.'
		)
	}
})

const WEBHOOK_PATH = '/bot' + process.env.TG_TOKEN
bot.setWebHook(process.env.WEBHOOK_URL + WEBHOOK_PATH)
	.then(() => bot.getWebHookInfo())
	.then(console.info)
exports.bot = bot
exports.WEBHOOK_PATH = WEBHOOK_PATH

if (require.main === module) {
	bot.startWebhook(WEBHOOK_PATH, null, process.env.PORT)
}
