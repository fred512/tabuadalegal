/* eslint-env node */
const { configure } = require('quasar/wrappers')

module.exports = configure(function (/* ctx */) {
  return {
    eslint: { warnings: true, errors: true },
    boot: ['pinia'],
    css: ['app.scss'],
    extras: [
      'roboto-font',
      'material-icons',
      'fontawesome-v6'
    ],
    build: {
      target: { browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'] },
      vueRouterMode: 'hash',
    },
    devServer: {
      open: true,
      port: 9000
    },
    framework: {
      config: {
        ripple: true,
      },
      plugins: ['Notify', 'Dialog', 'LocalStorage', 'Loading', 'Quasar']
    },
    animations: ['bounceIn', 'bounceOut', 'fadeIn', 'fadeOut', 'tada', 'rubberBand', 'heartBeat'],
    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      manifest: {
        name: 'Tabuada do Neto',
        short_name: 'Tabuada',
        description: 'App de tabuada com videos engraçados',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#6C63FF',
        icons: [
          { src: 'icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-256x256.png', sizes: '256x256', type: 'image/png' },
          { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    },
    ssr: { pwa: false, prodPort: 3000, middlewares: ['render'] },
  }
})
