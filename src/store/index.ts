import Vue from 'vue'
import Vuex from 'vuex'
import { useAccessor, getterTree, mutationTree, actionTree } from 'typed-vuex'
import createPersistedState from 'vuex-persistedstate'

import { IConfig, getDefaultConfig } from '@/lib/config'
import { getConfig } from '@/lib/github'

declare module 'vue/types/vue' {
  interface Vue {
    $accessor: typeof accessor
  }
}

Vue.use(Vuex)

const state = () => ({
  githubPAT: '',
  gistId: '',
  config: getDefaultConfig()
})

const getters = getterTree(state, {
})

const mutations = mutationTree(state, {
  updateConfig (state, config: IConfig) {
    state.config = config
  },
  setGistId (state, value: string) {
    state.gistId = value
  }
})

const actions = actionTree({
  state,
  getters,
  mutations
}, {
  async getConfig ({ commit, state }): Promise<void> {
    const config = await getConfig(state.gistId)
    commit('updateConfig', config)
    if (window.electron) {
      window.electron.ipcRenderer.send('config-updated')
    }
  }
})

const plugins = [
  createPersistedState({
    paths: ['githubPAT', 'gistId', 'config']
  })
]

const storePattern = {
  state,
  mutations,
  actions,
  plugins
}

const store = new Vuex.Store(storePattern)

export const accessor = useAccessor(store, storePattern)

// Optionally, inject accessor globally
Vue.prototype.$accessor = accessor

export default store
