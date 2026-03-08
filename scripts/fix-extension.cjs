const fs = require('fs')
const path = require('path')

const dist = path.join(__dirname, '..', 'dist')
const assetsDir = path.join(dist, 'assets')

// Rename _fonts to fonts
if (fs.existsSync(path.join(dist, '_fonts'))) {
  fs.renameSync(path.join(dist, '_fonts'), path.join(dist, 'fonts'))
}

// Fix all HTML files
const htmlFiles = fs.readdirSync(dist).filter(f => f.endsWith('.html'))
for (const file of htmlFiles) {
  const filePath = path.join(dist, file)
  let content = fs.readFileSync(filePath, 'utf8')

  // Replace absolute paths with relative
  content = content.replaceAll('"/assets/', '"./assets/')
  content = content.replaceAll("'/assets/", "'./assets/")
  content = content.replaceAll('/_fonts/', './fonts/')
  content = content.replaceAll('baseURL:"/"', 'baseURL:"./"')

  // Extract inline scripts to external files
  let scriptIndex = 0
  const scriptFiles = []
  content = content.replace(/<script>([\s\S]*?)<\/script>/g, (match, scriptContent) => {
    const scriptName = `inline-${file.replace('.html', '')}-${scriptIndex++}.js`
    fs.writeFileSync(path.join(assetsDir, scriptName), scriptContent)
    scriptFiles.push(scriptName)
    return `<script src="./assets/${scriptName}"></script>`
  })

  fs.writeFileSync(filePath, content)
}

// Fix CSS files that reference fonts
if (fs.existsSync(assetsDir)) {
  const cssFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.css'))
  for (const file of cssFiles) {
    const filePath = path.join(assetsDir, file)
    let content = fs.readFileSync(filePath, 'utf8')
    content = content.replaceAll('/_fonts/', '../fonts/')
    fs.writeFileSync(filePath, content)
  }
}

console.log('Extension files fixed.')
