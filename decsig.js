const axios = require('axios')
const deasync = require('deasync')

/*eslint max-len: ["off"]*/

const fallback = a => {
	// 2018/05/04
	const Sy = {
		kJ: function(a, b) {
			var c = a[0]
			a[0] = a[b % a.length]
			a[b % a.length] = c
		},
		ZK: function(a) {
			a.reverse()
		},
		Ug: function(a, b) {
			a.splice(0, b)
		}
	}
	a = a.split('')
	Sy.Ug(a, 2)
	Sy.ZK(a, 72)
	Sy.Ug(a, 2)
	Sy.ZK(a, 10)
	Sy.Ug(a, 3)
	Sy.kJ(a, 60)
	return a.join('')
}
module.exports = (id => {
	return axios
		.get(`https://www.youtube.com/watch?v=${id}`, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36',
				'X-Client-Data': 'CI62yQEIo7bJAQjAtskBCKmdygEIqKPKAQiipMoB',
				'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
				'Upgrade-Insecure-Requests': 1,
				dnt: 1
			}
		})
		.then(({ data }) => {
			const d = /<script >(var ytplayer[\s\S]*?)<\/script>/.exec(data)
			const window = {}
			eval(d[1])
			return axios.get('https://youtube.com' + ytplayer.config.assets.js)
		})
		.then(({ data }) => {
			const fnname = /\"signature\"\),.+?\.set\(.+?,(.+?)\(/.exec(data)[1]
			const [_, argname, fnbody] = new RegExp(fnname + '=function\\((.+?)\\){(.+?)}').exec(data)
			//console.log(fnbody)
			const helpername = /;(.+?)\..+?\(/.exec(fnbody)[1]
			//console.log(helpername)
			const helper = new RegExp('var ' + helpername + '={[\\s\\S]+?};').exec(data)[0]
			//console.log(helper)
			return new Function([argname], helper + ';' + fnbody)
		})
		.catch(e => fallback)
})