<template>
  <b-container class="my-3">
    <h4 class="font-weight-light mb-3">
      GitHub 设置
    </h4>
    <!--<b-form-group label="GitHub Personal Access Token:" label-for="input-github-pat">
      <b-form-input
        id="input-github-pat"
        v-model="githubPAT"
        placeholder="输入你的 GitHub PAT..."
        autocomplete="off"
      />
      <b-form-text>
        为了在你的 Private Gist 中读取设置，请在 GitHub <a href="https://github.com/settings/tokens/new?description=Desktop%20Countdown&scopes=gist" target="_blank">创建</a>一个 Personal Access Token 并赋予 <code>gist</code> 权限。如果设置是存放在 Public Gist 中的，此栏可留空。
      </b-form-text>
    </b-form-group>-->
    <b-form-group
      label="Gist ID:"
      label-for="input-gist-id"
      :valid-feedback="successMessage"
      :invalid-feedback="errorMessage"
    >
      <b-form-input
        id="input-gist-id"
        v-model="gistId"
        placeholder="输入你的 Gist ID..."
        autocomplete="off"
        :state="validState"
      />
      <b-form-text
        v-if="loading"
        text-variant="primary"
      >
        <b-spinner
          variant="primary"
          small
        />
        正在验证数据...
      </b-form-text>
    </b-form-group>
    <b-form-group class="text-right">
      <b-button
        variant="primary"
        :disabled="loading"
        @click="verify"
      >
        刷新配置
      </b-button>
    </b-form-group>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { BButton, BContainer, BSpinner } from 'bootstrap-vue'
import debounce from 'lodash.debounce'

import '@/assets/scss/settings.scss'

@Component({
  components: {
    BButton,
    BContainer,
    BSpinner
  }
})
export default class PageSettings extends Vue {
  loading = false

  errorMessage = ''

  successMessage = ''

  get validState (): boolean | null {
    if (this.successMessage) {
      return true
    } else if (this.errorMessage) {
      return false
    } else {
      return null
    }
  }

  _verify (): void {
    if (this.gistId) {
      this.loading = true
      this.$accessor.getConfig().then(() => {
        if (this.$accessor.config.timers) {
          this.successMessage = '已成功获取配置文件！'
        } else {
          this.errorMessage = '获取配置文件失败！'
        }
      }).catch((error) => {
        this.errorMessage = '获取配置文件时发生错误\n' + error.toString()
      }).finally(() => {
        this.loading = false
      })
    } else {
      this.errorMessage = '请输入 Gist ID。'
    }
  }

  verify = debounce(this._verify, 500)

  get githubPAT (): string {
    return this.$accessor.githubPAT
  }

  get gistId (): string {
    return this.$accessor.gistId
  }

  set gistId (value: string) {
    this.errorMessage = ''
    this.successMessage = ''
    this.$accessor.setGistId(value)
    this.verify()
  }
}
</script>
