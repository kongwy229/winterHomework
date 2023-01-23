module.exports = {
  presets: [
    [
      '@vue/cli-plugin-babel/preset', {
        polyfills: [
          'es.promise.all-settled'
        ]
      }
    ]
  ],
  plugins: ['transform-vue-jsx', 'transform-runtime']
}
