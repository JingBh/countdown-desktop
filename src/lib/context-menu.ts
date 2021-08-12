import { BrowserWindow } from 'electron'
import contextMenu from 'electron-context-menu'

let disposeContextMenuCountdown: () => void

export function initContextMenuCountdown (
  win: BrowserWindow,
  hasNext: boolean,
  createSettingsWindow: () => void | Promise<void>
): void {
  if (disposeContextMenuCountdown) {
    disposeContextMenuCountdown()
  }

  disposeContextMenuCountdown = contextMenu({
    window: win,
    prepend: () => [
      {
        label: '切换到下一个倒计时',
        enabled: hasNext,
        click () {
          win.webContents.send('next')
        }
      },
      { type: 'separator' },
      {
        label: '设置',
        click () {
          createSettingsWindow()
        }
      }
    ],
    showLookUpSelection: false,
    showSearchWithGoogle: false,
    showCopyImage: false
  })
}
