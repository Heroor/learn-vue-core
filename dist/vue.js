(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Vue = factory());
}(this, function () { 'use strict';

  class Dep {
    constructor () {
      this.subs = [];
    }
    addSub(sub) {
      this.subs.push(sub);
    }
    removeSub (sub) {
      remove(this.subs, sub);
    }
    depend () {
      const subs = this.subs.slice();
      for (let i = 0, l = subs.length; i < l; i++) {
        subs[i].update();
      }
    }
  }

  function remove (arr, item) {
    if (arr.length) {
      const index = arr.indexOf(item);
      if (index > -1) {
        return arr.splice(index, 1)
      }
    }
  }

  const arrayProto = Array.prototype;
  const arrayMethods = Object.create(arrayProto)

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
    const original = arrayProto[method];
    Object.defineProperty(arrayMethods, method, {
      value: function mutator (...args) {
        return original.apply(this, args)
      },
      enumerable: false,
      writable: true,
      configurable: true
    });
  });

  const arrayKeys = Object.getOwnPropertyNames(arrayMethods);


  // 观测一个数据、将会遍历观测对象的所有属性 或 改造数组的部分方法
  class Observer {
    constructor (value) {
      this.value = value;
      // 数组的依赖！？
      this.dep = new Dep();
      if (Array.isArray(value)) {
        const augment = hasProto
          ? protoAugment
          : copyAugment;
        augment(value, arrayMethods, arrayKeys);

      } else {
        this.walk(value);
      }
    }

    // 遍历对象，进行观测，将所有属性转化为getter
    walk (obj) {
      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i++) {
        defineProperty(obj, key[i], obj[key[i]]);
      }
    }
  }

  function protoAugment (target, src, keys) {
    target.__proto__ = src;
  }
  function copyAugment (target, src, keys) {
    for (let i = 0, l = keys.length; i < l; i++) {
      const key = keys[i];
      def(target, key, src[key]);
    }
  }


  // 观测一个属性
  function defineProperty(data, key, val) {
    let childOb = observe(val);
    if (typeof val === 'object') {
      // 递归遍历 值是对象的子属性
      new Observer(val);
    }
    let dep = new Dep();
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get() {
        dep.depend();
        return val
      },
      set(newValue) {
        if (val === newValue) {
          return
        }
        val = newValue;
        dep.notify();
      }
    });
  }

  // export function observe (value, asRootData) {
  //   if (!isObject(value)) {
  //     return
  //   }
  //   // let ob
  //   // if (hasOwn(value, '__ob__', {

  //   // }))
  // }

  return Observer;

}));
