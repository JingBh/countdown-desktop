'use strict'

import { endianness } from 'os'
import { join } from 'path'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import windowStateKeeper from 'electron-window-state'

import { initContextMenuCountdown } from '@/lib/context-menu'

const isDevelopment = process.env.NODE_ENV !== 'production'
const windows: Record<string, BrowserWindow | null> = {
  countdown: null,
  settings: null
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow () {
  if (windows.countdown) return

  const windowState = windowStateKeeper({
    file: 'countdown-window-state.json',
    maximize: false,
    fullScreen: false
  })

  // Create the browser window.
  const win = new BrowserWindow({
    useContentSize: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    focusable: false,
    alwaysOnTop: false,
    fullscreenable: false,
    skipTaskbar: true,
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    transparent: true,
    type: 'desktop',
    titleBarStyle: 'hidden',
    roundedCorners: false,
    thickFrame: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: (process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  windows.countdown = win

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    await win.loadURL('app://./index.html')
  }

  if (process.platform === 'win32') {
    const user32 = (await import('./lib/user32')).default
    const hwndBuffer = win.getNativeWindowHandle()
    const hwnd = endianness() === 'LE' ? hwndBuffer.readInt32LE() : hwndBuffer.readInt32BE()
    user32.SetWindowPos(hwnd, 1, 0, 0, 0, 0, 0x0001 | 0x0002 | 0x0010)
  }

  win.setBounds({
    x: windowState.x,
    y: windowState.y
  })

  windowState.manage(win)

  win.on('minimize', () => {
    setTimeout(() => {
      win.show()
    }, 100)
  })

  win.on('moved', () => {
    setTimeout(() => {
      windowState.saveState(win)
    }, 100)
  })

  win.on('closed', () => {
    windows.countdown = null
    app.quit()
  })
}

async function createSettingsWindow () {
  if (windows.settings) return

  const win = new BrowserWindow({
    width: 600,
    height: 280,
    minWidth: 400,
    minHeight: 280,
    maxWidth: 800,
    maxHeight: 280,
    fullscreenable: false,
    title: '设置',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: (process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  windows.settings = win

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '#/settings')
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    await win.loadURL('app://./index.html#/settings')
  }

  win.on('closed', () => {
    windows.settings = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  createWindow()
})

// Exit cleanly on request from parent process.
if (process.platform === 'win32') {
  process.on('message', (data) => {
    if (data === 'graceful-exit') {
      app.quit()
    }
  })
} else {
  process.on('SIGTERM', () => {
    app.quit()
  })
}

ipcMain.on('resize', (event, width: number, height: number) => {
  console.log('resize', width, height)
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) {
    win.setBounds({
      width,
      height
    })
  }
})

ipcMain.on('context-menu', (event, hasNext: boolean) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) initContextMenuCountdown(win, hasNext, createSettingsWindow)
})

ipcMain.on('config-updated', () => {
  if (windows.countdown) {
    windows.countdown.webContents.send('config-updated')
  }
})
