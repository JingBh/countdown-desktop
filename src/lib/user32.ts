import ffi from 'ffi-napi'
import { DTypes as W } from 'win32-def'

export default ffi.Library('user32.dll', {
  SetWindowPos: [W.BOOL, [W.HWND, W.HWND, W.INT, W.INT, W.INT, W.INT, W.UINT]]
})
