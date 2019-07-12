const Koa = require('koa')
const koaBody = require('koa-body')
const mount = require('koa-mount')
const graphqlHTTP = require('koa-graphql')
const rateLimit = require('koa-ratelimit')
const Redis = require('ioredis')
const app = new Koa()
const getVideo = require('./getvid')
const gql = require('./gql')

app.use(koaBody())

// Ratelimit, prevent someone from abusing the demo site
app.use(
	ratelimit({
		db: new Redis(),
		duration: 3600000,
		errorMessage: 'Too much requests.',
		id: ctx => ctx.request.headers['x-forwarded-for'].split(',')[0], // get real ipv4 on glitch.com
		headers: {
			remaining: 'Rate-Limit-Remaining',
			reset: 'Rate-Limit-Reset',
			total: 'Rate-Limit-Total'
		},
		max: 60,
		disableHeader: false
	})
)

// cors
app.use(async (ctx, next) => {
	await next()
	ctx.set('Access-Control-Allow-Origin', '*')
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

// response time
app.use(async (ctx, next) => {
	const start = Date.now()
	await next()
	const ms = Date.now() - start
	ctx.set('X-Response-Time', `${ms}ms`)
})

// format
app.use(async (ctx, next) => {
	await next()
	const { format } = ctx.request.query
	if (format) {
		ctx.body = JSON.stringify(ctx.body, null, 2)
	}
})

// api
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
