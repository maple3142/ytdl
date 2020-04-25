const xf = require('xfetch-js')
const { createSafeFn, runInContext } = require('./sandboxutil')

const fallback = a => {
	// 20200425
	var Av = {
		nt: function (a, b) {
			var c = a[0]
			a[0] = a[b % a.length]
			a[b % a.length] = c
		},
		xD: function (a) {
			a.reverse()
		},
		J3: function (a, b) {
			a.splice(0, b)
		}
	}
	a = a.split('')
	Av.nt(a, 17)
	Av.nt(a, 16)
	Av.xD(a, 4)
	Av.nt(a, 25)
	Av.xD(a, 63)
	Av.nt(a, 50)
	Av.nt(a, 35)
	return a.join('')
}

const parseDecsig = data => {
	if (data.startsWith('var script')) {
		// they inject the script via script tag
		const obj = {}
		const document = {
			createElement: () => obj,
			head: { appendChild: () => {} }
		}
		eval(data)
		data = obj.innerHTML
	}
	const fnNameResult = /=([a-zA-Z0-9\$]+?)\(decodeURIComponent/.exec(data)
	const fnName = fnNameResult[1]
	const _argNameFnBodyResult = new RegExp(
		fnName + '=function\\((.+?)\\){(.+?)}'
	).exec(data)
	const [_, argName, fnBody] = _argNameFnBodyResult
	const helperNameResult = /;(.+?)\..+?\(/.exec(fnBody)
	const helperName = helperNameResult[1]
	const helperResult = new RegExp(
		'var ' + helperName + '={[\\s\\S]+?};'
	).exec(data)
	const helper = helperResult[0]
	return new Function([argName], helper + '\n' + fnBody)
}
module.exports = (id, safe = true) =>
	xf
		.get(`https://www.youtube.com/watch`, { qs: { v: id } })
		.text()
		.then(data => {
			const d = /<script >(var ytplayer[\s\S]*?)<\/script>/.exec(data)
			const window = {}
			// This script will throw an error if no window is provided
			runInContext(d[1] + ';var yt = window.ytplayer = ytplayer', {
				window
			})
			return xf
				.get('https://youtube.com' + window.ytplayer.config.assets.js)
				.text()
		})
		.then(data => parseDecsig(data))
		.then(fn => (safe ? createSafeFn(fn) : fn))
		.catch(e => console.info('use fallback', e) || fallback)

if (require.main === module) {
	module
		.exports('-tKVN2mAKRI', false)
		.then(fn => console.log(fn.toString().split('\n').join('')))
}
