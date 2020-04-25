const getVideo = require('./getvid')
const { buildSchema } = require('graphql')
const fs = require('fs')

const schema = buildSchema(
	fs.readFileSync(__dirname + '/schema.gql').toString()
)
exports.schema = schema

const root = {
	search: ({ id }) => getVideo(id)
}
exports.root = root
// graphql(schema, '{search(id:"-tKVN2mAKRI"){stream{quality,url}}}', root).then(r => console.log(r.data.search))
