#!/usr/bin/env node
/**
 * Strip Cursor / cursoragent trailers Cursor injects into commit messages.
 */
const fs = require('fs')

const file = process.argv[2]
if (!file) process.exit(0)

let text = fs.readFileSync(file, 'utf8')
text = text.replace(/^Co-authored-by:.*(?:Cursor|cursoragent).*$/gim, '')
text = text.replace(/^Made-with:\s*Cursor.*$/gim, '')
text = text.replace(/^Made with Cursor.*$/gim, '')
text = text.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+\n/g, '\n').trimEnd() + '\n'
fs.writeFileSync(file, text)
