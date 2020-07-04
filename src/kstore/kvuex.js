let KVue

// 实现Store类
class Store { 
  constructor(options) {
    

    // 保存mutations
    this._mutations = options.mutations

    // 保存actions
    this._actions = options.actions

    // 绑定this到store实例
    const store = this
    const {commit, dispatch} = store
    this.commit = function boundCommit(type, payload) {
      commit.call(store, type, payload)
    }
    this.dispatch = function boundDispatch(type, payload) {
      return dispatch.call(store, type, payload)
    }


    /* =======================天王盖地虎======================== */
    // getters
    // 1.遍历用户传入getters所有key，动态赋值，其值应该是函数执行结果
    // 2.确保它是响应式的，
    // Object.defineProperty(this.getters, key, {get(){}})
    // 3.缓存结果，可以利用computed
    this._gettersFn = {}
    this.getters = {}
    for(let key in options.getters){
      this._gettersFn[key] = function(store){
        return options.getters[key](store._vm._data.$$state)
      }
    }

    const computed = {}
    for(let key in this._gettersFn){
      let fn = this._gettersFn[key]
      let store = this
      computed[key] = function () {
        return fn(store)
      }
      Object.defineProperty(this.getters, key, {
        get: () => this._vm[key],
        enumerable: true
      })
    }
    

    // 响应式的state
    this._vm = new KVue({
      data: {
        $$state: options.state
      },
      computed
    })
  }

  get state() {
    return this._vm._data.$$state
  }
  set state(v) {
    console.error('please use replaceState to reset state');
    
  }

  // commit(type, payload): 执行mutation，修改状态 
  commit(type, payload) {
    // 根据type获取对应的mutation
    const entry = this._mutations[type]

    if (!entry) {
      console.error('unknown mutation type');
      return
    }

    entry(this.state, payload)

  }


  // dispatch(type, payload)
  dispatch(type, payload) {
    const entry = this._actions[type]

    if (!entry) {
      console.error('unknown action type');
      return
    }

    return entry(this, payload)
  }
}

// 实现插件
function install(Vue) {
  KVue = Vue

  // 混入
  Vue.mixin({
    beforeCreate() {
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store
      }
    }
  })
}

// 此处导出的对象理解为Vuex
export default { Store, install }