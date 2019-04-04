import Dep from './dep'
import Watcher from './watcher'


// handle Array
const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)

void[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
].forEach(function (method) {
  const original = arrayProto[method]
  Object.defineProperty(arrayMethods, method, {
    value: function mutator(...args) {
      const ob = this.__ob__
      ob.dep.notify()
      return original.apply(this, args)
    },
    enumerable: false,
    writable: true,
    configuration: true
  })
})

const hasProto = '__proto__' in {}
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

class Observer {
  constructor(value) {
    this.value = value
    this.dep = new Dep()
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      const augment = hasProto ?
        protoAugment :
        copyAugment
      augment(value, arrayMethods, arrayKeys)
      this.observeArray(value)

    } else {
      this.walk(value)
    }
  }
  observeArray(items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
  // 遍历所有属性
  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }
}

function protoAugment(target, src, keys) {
  target.__proto__ = src
}

function copyAugment(target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}

function defineReactive(data, key, val) {
  let childOb = observe(val)
  if (typeof val === 'object') new Observer(val) //递归遍历子属性
  let dep = new Dep()
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get() {
      dep.depend() // 添加依赖
      if (childOb) {
        childOb.dep.depend()
      }
      return val
    },
    set(newVal) {
      if (val === newVal) {
        return
      }
      val = newVal
      dep.notify() // 触发所有依赖
    }
  })
}

function observe(value, asRootData) {
  if (!isObject(value)) {
    return
  }
  let ob
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else {
    ob = new Observer(value)
  }
  return ob
}

function isObject(obj) {
  return toString.call(obj).slice(8, -1) === 'Object'
}

function hasOwn(target, key) {
  return Object.hasOwn(target, key)
}

function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}