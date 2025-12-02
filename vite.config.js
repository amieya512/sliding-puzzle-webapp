/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Vitest configuration
  test: {
    globals: true,               // allows describe(), it(), expect() without imports
    environment: "jsdom",        // simulates a browser
    setupFiles: "./src/test/setup.js",  // jest-dom config
  },
})
