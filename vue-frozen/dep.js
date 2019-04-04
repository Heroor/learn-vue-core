export default class Dep {
  constructor() {
    this.subs = [] // 所有依赖
  }
  addSub(sub) {
    this.subs.push(sub)
    console.log('add-dep', this.subs)
  }
  removeSub(sub) {
    remove(this.subs, sub)
  }
  depend() {
    if (window.target) {
      this.addSub(window.target)
    }
  }
  notify() {
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}