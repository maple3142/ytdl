const axios = require('axios')

const parseQuery = s =>
	Object.assign(
		...s
			.split('&')
			.map(x => x.split('='))
			.map(p => ({ [p[0]]: decodeURIComponent(p[1]) }))
	)
const decsig = a => {
	// 2018/4/24
	const $y = {
		TL: function(a) {
			a.reverse()
		},
		kc: function(a, b) {
			a.splice(0, b)
		},
		vS: function(a, b) {
			var c = a[0]
			a[0] = a[b % a.length]
			a[b % a.length] = c
		}
	}
	a = a.split('')
	$y.TL(a, 51)
	$y.vS(a, 17)
	$y.vS(a, 14)
	$y.kc(a, 2)
	$y.TL(a, 32)
	return a.join('')
}

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
						.map(x => ({ ...x, url: x.url + `&signature=${x.s}&alr=yes` }))
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
