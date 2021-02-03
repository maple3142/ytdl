const xf = require('xfetch-js')
const { createSafeFn, runInContext } = require('./sandboxutil')

const fallback = a => {
	// 20210204
	var Cw = {
		Ta: function (a, b) {
			var c = a[0]
			a[0] = a[b % a.length]
			a[b % a.length] = c
		},
		af: function (a) {
			a.reverse()
		},
		Hi: function (a, b) {
			a.splice(0, b)
		}
	}
	a = a.split('')
	Cw.Hi(a, 2)
	Cw.af(a, 41)
	Cw.Hi(a, 1)
	return a.join('')
}

const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
	const fnnameresult = /=([a-zA-Z0-9\$]+?)\(decodeURIComponent/.exec(data)
	const fnname = fnnameresult[1]
	const _argnamefnbodyresult = new RegExp(escapeRegExp(fnname) + '=function\\((.+?)\\){(.+?)}').exec(data)
	const [_, argname, fnbody] = _argnamefnbodyresult
	const helpernameresult = /;(.+?)\..+?\(/.exec(fnbody)
	const helpername = helpernameresult[1]
	const helperresult = new RegExp('var ' + escapeRegExp(helpername) + '={[\\s\\S]+?};').exec(data)
	const helper = helperresult[0]
	return new Function([argname], helper + '\n' + fnbody)
}
module.exports = (id, safe = true) =>
	xf
		.get(`https://www.youtube.com/watch`, { qs: { v: id } })
		.text()
		.then(data => {
			const rg = /<script src="(\/.*?base\.js)"/
			const basejs = rg.exec(data)[1]
			return xf.get('https://youtube.com' + basejs).text()
		})
		.then(data => parseDecsig(data))
		.then(fn => (safe ? createSafeFn(fn) : fn))
		.catch(e => console.info('use fallback', e) || fallback)

if (require.main === module) {
	module.exports('-tKVN2mAKRI', false).then(fn => console.log(fn.toString().split('\n').join('')))
}
