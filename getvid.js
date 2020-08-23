const xf = require('xfetch-js')
const getdecsig = require('./decsig')
const qs = require('qs')

const getVideo = async id => {
	const data = await xf
		.get(
			`https://www.youtube.com/get_video_info?video_id=${id}&el=detailpage`
		)
		.text()
		.catch(err => null)
	if (!data) return 'Adblock conflict'
	const obj = qs.parse(data)
	const playerResponse = JSON.parse(obj.player_response)
	if (obj.status === 'fail') {
		throw obj
	}
	const decsig = await getdecsig(id, false)
	let stream = []
	if (playerResponse.streamingData.formats) {
		stream = playerResponse.streamingData.formats.map(x =>
			Object.assign({}, x, qs.parse(x.cipher || x.signatureCipher))
		)
		if (stream[0].sp && stream[0].sp.includes('sig')) {
			for (const obj of stream) {
				obj.s = decsig(obj.s)
				obj.url += `&sig=${obj.s}`
			}
		}
	}

	let adaptive = []
	if (playerResponse.streamingData.adaptiveFormats) {
		adaptive = playerResponse.streamingData.adaptiveFormats.map(x =>
			Object.assign({}, x, qs.parse(x.cipher || x.signatureCipher))
		)
		if (adaptive[0].sp && adaptive[0].sp.includes('sig')) {
			for (const obj of adaptive) {
				obj.s = decsig(obj.s)
				obj.url += `&sig=${obj.s}`
			}
		}
	}
	return { stream, adaptive, meta: obj, playerResponse }
}
module.exports = getVideo

if (require.main === module) {
	const ID = process.argv[2] || '-tKVN2mAKRI'
	getVideo(ID)
		.then(mp => console.log(JSON.stringify(mp.stream, null, 2)))
		.catch(console.error)
}
