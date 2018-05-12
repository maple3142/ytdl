const getvid = require('./getvid')
exports.handler = async evt => {
	const data=JSON.parse(evt.body)
	if (!data.id)
		return {
			statusCode: 400,
			body: JSON.stringify({
				error: 'Must provide "id".'
			})
		}
	return {
		statusCode: 200,
		body: JSON.stringify(await getvid(data.id))
	}
}
