const xf = require('xfetch-js')
const getdecsig = require('./decsig')
const getBestThumbnail = require('./thumbnail')
const qs = require('qs')

const getVideo = id =>
	xf
		.get(`https://www.youtube.com/get_video_info`, { qs: { video_id: id, el: 'detailpage' } })
		.text()
		.then(async data => {
			const obj = qs.parse(data)
			if (obj.status === 'fail') {
				throw obj
			}
			const decsig = await getdecsig(id)
			let stream = obj.url_encoded_fmt_stream_map.split(',').map(qs.parse)
			if (stream[0].sp && stream[0].sp.includes('signature')) {
				stream = stream
					.map(x => ({ ...x, s: decsig(x.s) }))
					.map(x => ({ ...x, url: x.url + `&signature=${x.s}` }))
			}
			let adaptive = null
			if (obj.adaptive_fmts) {
				adaptive = obj.adaptive_fmts.split(',').map(qs.parse)
				if (adaptive[0].sp && adaptive[0].sp.includes('signature')) {
					adaptive = adaptive
						.map(x => ({ ...x, s: decsig(x.s) }))
						.map(x => ({ ...x, url: x.url + `&signature=${x.s}` }))
				}
			}
			obj.thumbnail_url = await getBestThumbnail(obj.thumbnail_url)
			return { stream, adaptive, meta: obj }
		})
module.exports = getVideo

if (require.main === module) {
	const ID = process.argv[2] || '-tKVN2mAKRI'
	getVideo(ID)
		.then(mp => console.log(JSON.stringify(mp.stream, null, 2)))
		.catch(console.error)
}
