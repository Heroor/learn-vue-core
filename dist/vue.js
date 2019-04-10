(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.Vue = {}));
}(this, function (exports) { 'use strict';

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

  function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: !!enumerable,
      writable: true,
      configurable: true
    });
  }

  /**
   * Quick object check - this is primarily used to tell
   * Objects from primitive values when we know the value
   * is a JSON-compliant type.
   */
  function isObject(obj) {
    return obj !== null && typeof obj === 'object'
  }

  /**
   * Check whether an object has the property.
   */
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key)
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

    def(arrayMethods, method, function mutator () {
      const result = original.apply(this, args);
      // 通过拦截器中的 this，就可以拿到数组身上的__ob__
      const ob = this.__ob__;
      let inserted;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break
        case 'splice':
          inserted = args.slice(2);
          break
      }
      if (inserted) ob.observeArray(inserted);
      ob.dep.notify();
      return result
    });
  });

  const hasProto = '__proto__' in {};
  const arrayKeys = Object.getOwnPropertyNames(arrayMethods);


  // 观测一个数据、将会遍历观测对象的所有属性 或 改造数组的部分方法
  class Observer {
    constructor(value) {
      this.value = value;
      // 数组的依赖！？
      this.dep = new Dep();
      def(value, '__ob__', this);
      if (Array.isArray(value)) {
        const augment = hasProto ?
          protoAugment :
          copyAugment;
        augment(value, arrayMethods, arrayKeys);
        this.observeArray(value);
      } else {
        this.walk(value);
      }
    }

    // 遍历对象，进行观测，将所有属性转化为getter
    walk(obj) {
      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i++) {
        defineProperty(obj, keys[i], obj[keys[i]]);
      }
    }

    // 遍历观测数组的每一项
    observeArray (items) {
      for (let i = 0, l = items.length; i < l; i++) {
        observe(items[i]);
      }
    }
  }

  function protoAugment(target, src, keys) {
    target.__proto__ = src;
  }

  function copyAugment(target, src, keys) {
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
        if (childOb) {
          childOb.dep.depend();
        }
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

  function observe(value, asRootData) {
    if (!isObject(value)) {
      return
    }
    let ob;
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
      ob = value.__ob__;
    } else {
      ob = new Observer(value);
    }
    return ob
  }

  exports.default = Observer;
  exports.observe = observe;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
