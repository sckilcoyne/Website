import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import mdx from '@mdx-js/rollup'

// https://vite.dev/config/
export default defineConfig({
  base: '/LabsWebsiteMap/', // for deploying to repo.github.io, comment out for labs.bcu.org
  plugins: [
    // {enforce: 'pre', ...mdx({/* jsxImportSource: …, otherOptions… */})},
    // react({include: /\.(jsx|js|mdx|md|tsx|ts)$/})
    react()
  ]
})
