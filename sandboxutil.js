const { VM } = require('vm2')

exports.runInContext = (code, ctx) => {
	const vm = new VM({ sandbox: ctx, timeout: 100 })
	return vm.run(code)
}
exports.createSafeFn = fn => {
	const vm = new VM({ timeout: 100 })
	vm.run(`const fn = ${fn.toString()}`)
	return (...args) => vm.run(`fn(${args.map(JSON.stringify).join(',')})`)
}
