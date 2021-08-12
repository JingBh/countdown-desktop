/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer } from 'electron'

const api = {
  ipcRenderer: {
    ...ipcRenderer,
    receive (channel: string, listener: (...args: any[]) => void): () => void {
      const handler = (_event: unknown, ...args: any[]): void => listener(...args)
      ipcRenderer.on(channel, handler)
      return () => {
        ipcRenderer.off(channel, handler)
      }
    }
  }
}

contextBridge.exposeInMainWorld('electron', api)

declare global {
  interface Window {
    electron: typeof api
  }
}
