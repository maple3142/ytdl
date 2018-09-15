const xf = require('xfetch-js')
const { createsafefn, runInContext } = require('./sandboxutil')

/*eslint max-len: ["off"]*/

const fallback = a => {
	// 20180817
	var CL = {
		yw: function(a, b) {
			var c = a[0]
			a[0] = a[b % a.length]
			a[b % a.length] = c
		},
		XD: function(a, b) {
			a.splice(0, b)
		},
		yu: function(a) {
			a.reverse()
		}
	}
	a = a.split('')
	CL.yu(a, 17)
	CL.XD(a, 3)
	CL.yu(a, 15)
	CL.XD(a, 1)
	CL.yw(a, 42)
	CL.XD(a, 2)
	CL.yw(a, 45)
	CL.yu(a, 39)
	return a.join('')
}
const parsedecsig = data => {
	const fnnameresult = /yt\.akamaized\.net\/\)\|\|.\.set\(.*?\);.*?set\(.,(.*)\(/.exec(data)
	const fnname = fnnameresult[1]
	const _argnamefnbodyresult = new RegExp(fnname + '=function\\((.+?)\\){(.+?)}').exec(data)
	const [_, argname, fnbody] = _argnamefnbodyresult
	const helpernameresult = /;(.+?)\..+?\(/.exec(fnbody)
	const helpername = helpernameresult[1]
	const helperresult = new RegExp('var ' + helpername + '={[\\s\\S]+?};').exec(data)
	const helper = helperresult[0]
	return createsafefn(new Function([argname], helper + '\n' + fnbody))
}
module.exports = id => {
	return xf
		.get(`https://www.youtube.com/watch?v=${id}`)
		.text()
		.then(data => {
			const d = /<script >(var ytplayer[\s\S]*?)<\/script>/.exec(data)
			const window = {}
			runInContext(d[1] + ';window.ytplayer = ytplayer', { window }) // This script will throw an error if no window is provided
			return xf.get('https://youtube.com' + window.ytplayer.config.assets.js).text()
		})
		.then(data => parsedecsig(data))
		.catch(e => console.info('use fallback', e) || fallback)
}
