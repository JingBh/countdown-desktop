module.exports = {
  lintOnSave: false,
  pluginOptions: {
    electronBuilder: {
      externals: ['ffi-napi', 'win32-def'],
      preload: 'src/preload.ts',
      builderOptions: {
        appId: 'top.jingbh.countdown.desktop',
        productName: '桌面倒计时'
      }
    }
  }
}
