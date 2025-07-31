#!/usr/bin/env node
/* eslint-disable node/prefer-global/process */

const fs = require('node:fs')
const path = require('node:path')

// Get the bump type from command line arguments
const bumpType = process.argv[2] || 'patch'

if (!['major', 'minor', 'patch'].includes(bumpType)) {
  console.error('❌ Invalid bump type. Use: major, minor, or patch')
  process.exit(1)
}

const packageJsonPath = path.join(__dirname, '..', 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
const currentVersion = packageJson.version
const [major, minor, patch] = currentVersion.split('.').map(Number)

// Calculate new version
let newVersion
switch (bumpType) {
  case 'major':
    newVersion = `${major + 1}.0.0`
    break
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`
    break
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`
    break
}

// Update package.json
packageJson.version = newVersion
fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)

console.log(`✅ Version bumped from ${currentVersion} to ${newVersion}`)
console.log(`📝 Don't forget to commit this change!`)
console.log(`🏷️  Suggested commit message: "🔖 Bump version to ${newVersion}"`)
