const Koa = require('koa')
const app = new Koa()
const getVideo = require('./getVideo')

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
	const start = Date.now()
	await next()
	const ms = Date.now() - start
	console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

app.use(async ctx => {
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
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`listen on: http://localhost:${PORT}`))
