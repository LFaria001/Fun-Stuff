import { cpSync, readdirSync, unlinkSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// Copy build output so GitHub Pages can serve it
// GH Pages: /farifari/idealistatracker/index.html → idealistatracker/index.html in repo

// Copy dist/index.src.html → index.html (production entry)
cpSync(join('dist', 'index.src.html'), 'index.html')

// Sync assets
if (!existsSync('assets')) mkdirSync('assets')
readdirSync('assets').filter(f => /^index/.test(f)).forEach(f => unlinkSync(join('assets', f)))
readdirSync(join('dist', 'assets')).forEach(f => cpSync(join('dist', 'assets', f), join('assets', f)))

console.log('Deploy files updated.')
