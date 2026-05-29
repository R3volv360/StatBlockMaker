import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT for GitHub Pages project sites:
  // assets are served from https://<user>.github.io/<repo>/ , not the root.
  // This must match your repository name, with slashes on both sides.
  // If you rename the repo, update this string to match.
  base: "/StatBlockMaker/",
})
