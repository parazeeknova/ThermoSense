import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'app',
  typescript: true,
  react: true,
  formatters: {
    css: true,
    html: true,
    markdown: 'prettier',
  },
  stylistic: {
    indent: 2,
    quotes: 'single',
  },
  ignores: [
    '.next/**',
    'out/**',
    'dist/**',
    'build/**',
  ],
}, {
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
})
