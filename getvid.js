const axios = require('axios')
const deasync = require('deasync')
const decsig = require('./decsig')

const parseQuery = s =>
	Object.assign(
		...s
			.split('&')
			.map(x => x.split('='))
			.map(p => ({ [p[0]]: decodeURIComponent(p[1]) }))
	)
const getVideo = id =>
	axios
		.get(`http://www.youtube.com/get_video_info?video_id=${id}&el=embedded&ps=default&eurl=&gl=US&hl=en`)
		.then(({ data }) => {
			const obj = parseQuery(data)
			if (obj.status === 'fail') {
				throw obj
			}
			let stream = obj.url_encoded_fmt_stream_map.split(',').map(parseQuery)
			if (stream[0].sp && stream[0].sp.includes('signature')) {
				stream = stream
					.map(x => ({ ...x, s: decsig(x.s) }))
					.map(x => ({ ...x, url: x.url + `&signature=${x.s}&alr=yes` }))
			}
			let adaptive = null
			if (obj.adaptive_fmts) {
				adaptive = obj.adaptive_fmts.split(',').map(parseQuery)
				if (adaptive[0].sp && adaptive[0].sp.includes('signature')) {
					adaptive = adaptive
						.map(x => ({ ...x, s: decsig(x.s) }))
						.map(x => ({ ...x, url: x.url + `&signature=${x.s}` }))
				}
			}
			return { stream, adaptive }
		})
module.exports = getVideo

if (require.main === module) {
	const ID = process.argv[2] || '-tKVN2mAKRI'
	getVideo(ID)
		.then(mp => console.log(JSON.stringify(mp, null, 2)))
		.catch(console.error)
}
