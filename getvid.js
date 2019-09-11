const xf = require('xfetch-js')
const getdecsig = require('./decsig')
const qs = require('qs')

const getVideo = async (id, decsig) => {
	return xf
		.get(`https://www.youtube.com/get_video_info?video_id=${id}&el=detailpage`)
		.text()
		.then(async data => {
			const obj = qs.parse(data)
			const playerResponse = JSON.parse(obj.player_response)
			if (obj.status === 'fail') {
				throw obj
			}
			const decsig = await getdecsig(id)
			let stream = []
			if (playerResponse.streamingData.formats) {
				stream = playerResponse.streamingData.formats.map(x => Object.assign(x, qs.parse(x.cipher)))
				if (stream[0].sp && stream[0].sp.includes('sig')) {
					stream = stream
						.map(x => ({ ...x, s: decsig(x.s) }))
						.map(x => ({ ...x, url: x.url + `&sig=${x.s}` }))
				}
			}

			let adaptive = []
			if (playerResponse.streamingData.adaptiveFormats) {
				adaptive = playerResponse.streamingData.adaptiveFormats.map(x => Object.assign(x, qs.parse(x.cipher)))
				if (adaptive[0].sp && adaptive[0].sp.includes('sig')) {
					adaptive = adaptive
						.map(x => ({ ...x, s: decsig(x.s) }))
						.map(x => ({ ...x, url: x.url + `&sig=${x.s}` }))
				}
			}
			return { stream, adaptive, meta: obj }
		})
}
module.exports = getVideo

if (require.main === module) {
	const ID = process.argv[2] || '-tKVN2mAKRI'
	getVideo(ID)
		.then(mp => console.log(JSON.stringify(mp.stream, null, 2)))
		.catch(console.error)
}
