const xf = require('xfetch-js')
const { createSafeFn, runInContext } = require('./sandboxutil')

const fallback = a => {
	// 20190712
	var Hv = {
		jk: function(a) {
			a.reverse()
		},
		GE: function(a, b) {
			a.splice(0, b)
		},
		pZ: function(a, b) {
			var c = a[0]
			a[0] = a[b % a.length]
			a[b % a.length] = c
		}
	}
	a = a.split('')
	Hv.pZ(a, 70)
	Hv.GE(a, 2)
	Hv.pZ(a, 47)
	Hv.GE(a, 2)
	Hv.pZ(a, 31)
	Hv.GE(a, 1)
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
			runInContext(d[1] + ';window.ytplayer = ytplayer', { window })
			return xf
				.get('https://youtube.com' + window.ytplayer.config.assets.js)
				.text()
		})
		.then(data => parseDecsig(data))
		.then(fn => (safe ? createSafeFn(fn) : fn))
		.catch(e => console.info('use fallback', e) || fallback)

if (require.main === module) {
	module.exports('-tKVN2mAKRI', false).then(fn =>
		console.log(
			fn
				.toString()
				.split('\n')
				.join('')
		)
	)
}
