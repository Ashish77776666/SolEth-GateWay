import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
export default defineConfig({
  plugins: [react()],
  server: {
    port: 1000, // Change to desired port
  },
});
