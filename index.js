const Koa = require('koa')
const koaBody = require('koa-body')
const mount = require('koa-mount')
const graphqlHTTP = require('koa-graphql')
const app = new Koa()
const getVideo = require('./getvid')
const { bot, WEBHOOK_PATH } = require('./tgbot')
const gql = require('./gql')

app.use(koaBody())

// tg bot handling
app.use((ctx, next) => {
	if (ctx.url === WEBHOOK_PATH) {
		bot.processUpdate(ctx.request.body)
		ctx.status = 200
		return
	} else return next()
})

// gql
app.use(
	mount(
		'/graphql',
		graphqlHTTP({
			schema: gql.schema,
			rootValue: gql.root,
			graphiql: true
		})
	)
)

app.use(async (ctx, next) => {
	await next()
	ctx.set('Access-Control-Allow-Origin', '*')
})

app.use(async (ctx, next) => {
	const start = Date.now()
	await next()
	const ms = Date.now() - start
	ctx.set('X-Response-Time', `${ms}ms`)
})

app.use(async (ctx, next) => {
	await next()
	const { format } = ctx.request.query
	if (format) {
		ctx.body = JSON.stringify(ctx.body, null, 2)
	}
})

app.use(async ctx => {
	if (ctx.path === '/api') {
		const { id } = ctx.request.query
		if (!id) {
			ctx.throw(400, 'id required')
			return
		}
		try {
			ctx.body = await getVideo(id)
		} catch (e) {
			ctx.body = e
		}
	}
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`listen on: http://localhost:${PORT}`))
