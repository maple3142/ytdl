const xf = require('xfetch-js')
const YT_THUMB_RES_ORDER = ['maxresdefault', 'hqdefault', 'mqdefault', 'sddefault', 'default']

module.exports = async thumbnail_url => {
	for (const res of YT_THUMB_RES_ORDER) {
		try {
			const thumbnail = thumbnail_url.replace('default', res)
			await xf.head(thumbnail)
			return thumbnail
		} catch (e) {
			// if errror, try next resolution
		}
	}
}
