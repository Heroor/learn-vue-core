import Dep from "./dep";
import {
  arrayMethods
} from "./array";
import {
  def,
  isObject,
  hasOwn
} from "./utils";

const hasProto = '__proto__' in {}
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)


// 观测一个数据、将会遍历观测对象的所有属性 或 改造数组的部分方法
export default class Observer {
  constructor(value) {
    this.value = value
    // 数组的依赖！？
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

  // 遍历对象，进行观测，将所有属性转化为getter
  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineProperty(obj, keys[i], obj[keys[i]])
    }
  }

  // 遍历观测数组的每一项
  observeArray (items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
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


// 观测一个属性
function defineProperty(data, key, val) {
  let childOb = observe(val)
  if (typeof val === 'object') {
    // 递归遍历 值是对象的子属性
    new Observer(val)
  }
  let dep = new Dep()
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get() {
      dep.depend()
      if (childOb) {
        childOb.dep.depend()
      }
      return val
    },
    set(newValue) {
      if (val === newValue) {
        return
      }
      val = newValue
      dep.notify()
    }
  })
}

export function observe(value, asRootData) {
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