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

const parsedecsig = data => {
	if (data.startsWith('var script')) {
		// they inject the script via script tag
		const obj = {}
		const document = { createElement: () => obj, head: { appendChild: () => {} } }
		eval(data)
		data = obj.innerHTML
	}
	const fnnameresult = /\.set\([^,]*,encodeURIComponent\(([^(]*)\(/.exec(data)
	const fnname = fnnameresult[1]
	const _argnamefnbodyresult = new RegExp(fnname + '=function\\((.+?)\\){(.+?)}').exec(data)
	const [_, argname, fnbody] = _argnamefnbodyresult
	const helpernameresult = /;(.+?)\..+?\(/.exec(fnbody)
	const helpername = helpernameresult[1]
	const helperresult = new RegExp('var ' + helpername + '={[\\s\\S]+?};').exec(data)
	const helper = helperresult[0]
	return new Function([argname], helper + '\n' + fnbody)
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
			return xf.get('https://youtube.com' + window.ytplayer.config.assets.js).text()
		})
		.then(data => parsedecsig(data))
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
