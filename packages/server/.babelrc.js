export default {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      },
      modules: false
    }],
    '@babel/preset-typescript',
    ['@babel/preset-react', {
      runtime: 'automatic',
      development: process.env.NODE_ENV === 'development',
      importSource: '@babel/runtime/helpers/esm'
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      regenerator: true,
      helpers: true,
      useESModules: true
    }]
  ]
}; 