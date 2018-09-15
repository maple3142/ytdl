const { VM } = require('vm2')

exports.runInContext = (code, ctx) => {
	const vm = new VM({ sandbox: ctx })
	return vm.run(code)
}
exports.createsafefn = fn => {
	const sandbox = { module: {} }
	const vm = new VM({ sandbox })
	vm.run(`module.exports = ${fn.toString()}`)
	return (...args) => sandbox.module.exports(...args)
}
