const getvid = require('./getvid')
exports.handler = evt => {
	if (!evt.id) return 'Must provide "id".'
	return getvid(evt.id)
}
