<template>
  <div
    id="app"
    ref="app"
  >
    <div
      id="count"
      v-html="text"
    />
    <div
      id="drag"
      class="enabled"
    >
      <b-icon-arrows-move />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue, Watch } from 'vue-property-decorator'
import { BIconArrowsMove } from 'bootstrap-vue'
import { DateTime } from 'luxon'

import '@/assets/scss/countdown.scss'
import { ITimerConfig, getDefaultConfig } from '@/lib/config'

@Component({
  components: {
    BIconArrowsMove
  }
})
export default class PageCountdown extends Vue {
  @Ref('app') app!: HTMLDivElement

  index = 0

  text = ''

  get dest (): DateTime | null {
    if (this.timer.dest) {
      return DateTime.local(...this.timer.dest)
    } else {
      return null
    }
  }

  @Watch('timer.css', { immediate: true })
  updateTimerCSS (value?: string): void {
    value = value || ''
    const ele = document.getElementById('timer-styles') as HTMLStyleElement
    ele.innerHTML = value
  }

  get timer (): ITimerConfig {
    if (this.timers[this.index]) {
      return this.timers[this.index]
    } else {
      return { text: '未找到倒计时。请先右键进行设置' }
    }
  }

  get timers (): ITimerConfig[] {
    if (this.$accessor.config.timers) {
      return this.$accessor.config.timers
    } else {
      return getDefaultConfig().timers
    }
  }

  get hasNext (): boolean {
    return this.timers.length > 1
  }

  next (): void {
    if (this.hasNext) {
      if (this.index + 1 === this.timers.length) {
        this.index = 0
      } else {
        this.index += 1
      }
      this.updateText()
    }
  }

  updateTextInterval = 0
  updateText (): void {
    const lastText = this.text
    let text
    if (this.dest) {
      let textRaw
      const days = Math.ceil(this.dest.diffNow('days').days)
      if (days > 0) {
        if (typeof this.timer.text === 'string') {
          textRaw = this.timer.text
        } else {
          textRaw = this.timer.text.before
        }
      } else if (days === 0) {
        if (typeof this.timer.text === 'object') {
          if (this.timer.text.on) {
            text = this.timer.text.on
          } else {
            textRaw = this.timer.text.before
          }
        } else {
          textRaw = this.timer.text
        }
      } else if (typeof this.timer.text === 'object' && this.timer.text.after) {
        textRaw = this.timer.text.after
      }
      if (textRaw) {
        text = textRaw.replaceAll('{days}', Math.abs(days).toString())
      }
    } else {
      if (typeof this.timer.text === 'string') {
        text = this.timer.text
      } else {
        text = this.timer.text.before
      }
    }
    if (text) {
      this.text = text
    } else {
      this.text = `<span style="color: var(--red);">倒计时 [${this.index}] 不可用，请检查配置文件</span>`
    }
    if (this.text !== lastText) {
      this.$nextTick(() => {
        this.setWindowSize()
      })
    }
  }

  setWindowSize (): void {
    const { ipcRenderer } = window.electron
    ipcRenderer.send('resize', this.app.clientWidth, this.app.clientHeight)
  }

  initContextMenu (): void {
    const { ipcRenderer } = window.electron
    ipcRenderer.send('context-menu', this.hasNext)
  }

  ipcListeners: (() => void)[] = []
  addIpcListeners (): void {
    const { ipcRenderer } = window.electron
    this.ipcListeners.push(ipcRenderer.receive('next', () => {
      this.next()
    }))
    this.ipcListeners.push(ipcRenderer.receive('config-updated', () => {
      this.removeIpcListeners()
      location.reload()
    }))
  }

  removeIpcListeners (): void {
    for (const dispose of this.ipcListeners) {
      dispose()
    }
  }

  mounted (): void {
    this.updateTextInterval = window.setInterval(() => this.updateText(), 10000)
    this.updateText()
    if (window.electron) {
      this.setWindowSize()
      this.initContextMenu()
      this.addIpcListeners()
    }
  }

  beforeDestroy (): void {
    window.clearInterval(this.updateTextInterval)
    if (window.electron) {
      this.removeIpcListeners()
    }
  }
}
</script>
