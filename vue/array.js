import { def } from "./utils";

const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

;[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
  const original = arrayProto[method]

  def(arrayMethods, method, function mutator () {
    const result = original.apply(this, args)
    // 通过拦截器中的 this，就可以拿到数组身上的__ob__
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    ob.dep.notify()
    return result
  })
})
