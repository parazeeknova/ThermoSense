#!/usr/bin/env node
/* eslint-disable node/prefer-global/process */

const { execSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const platform = os.platform()
const arch = os.arch()

console.log(`🚀 Building ThermoSense for ${platform}-${arch}`)
console.log('=====================================')

// Helper function to run commands
function runCommand(command, description) {
  console.log(`\n📦 ${description}...`)
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() })
    console.log(`✅ ${description} completed`)
  }
  catch (error) {
    console.error(`❌ ${description} failed:`, error.message)
    process.exit(1)
  }
}

// Helper function to check if file exists
function fileExists(filePath) {
  return fs.existsSync(path.resolve(filePath))
}

// Check for required build assets
function checkBuildAssets() {
  console.log('\n🔍 Checking build assets...')

  const requiredAssets = []

  if (platform === 'darwin') {
    requiredAssets.push('build/icon.icns')
  }
  else if (platform === 'win32') {
    requiredAssets.push('build/icon.ico')
  }
  else {
    requiredAssets.push('build/icons/512x512.png')
  }

  const missingAssets = requiredAssets.filter(asset => !fileExists(asset))

  if (missingAssets.length > 0) {
    console.warn('⚠️  Missing build assets:')
    missingAssets.forEach(asset => console.warn(`   - ${asset}`))
    console.warn('   The build will continue but may not have proper icons.')
    console.warn('   See build/README.md for instructions on creating icons.')
  }
  else {
    console.log('✅ All required build assets found')
  }
}

const args = process.argv.slice(2)
const buildType = args[0] || 'current'

if (args.includes('--clean')) {
  runCommand('npm run clean', 'Cleaning previous builds')
}

checkBuildAssets()

runCommand('npm run build', 'Building Next.js application')
runCommand('npm run build:electron', 'Building Electron main process')

// Platform-specific builds
switch (buildType) {
  case 'all':
    console.log('\n🌍 Building for all platforms...')
    runCommand('npm run electron:dist:all', 'Building for Windows, macOS, and Linux')
    break

  case 'win':
  case 'windows':
    console.log('\n🪟 Building for Windows...')
    runCommand('npm run electron:dist:win', 'Building for Windows')
    break

  case 'mac':
  case 'macos':
  case 'darwin':
    console.log('\n🍎 Building for macOS...')
    runCommand('npm run electron:dist:mac', 'Building for macOS')
    break

  case 'linux':
    console.log('\n🐧 Building for Linux...')
    runCommand('npm run electron:dist:linux', 'Building for Linux')
    break

  case 'pack':
    console.log('\n📦 Creating unpacked build...')
    runCommand('npm run electron:pack', 'Creating unpacked build')
    break

  case 'current':
  default:
    console.log(`\n🎯 Building for current platform (${platform})...`)
    if (platform === 'darwin') {
      runCommand('npm run electron:dist:mac', 'Building for macOS')
    }
    else if (platform === 'win32') {
      runCommand('npm run electron:dist:win', 'Building for Windows')
    }
    else {
      runCommand('npm run electron:dist:linux', 'Building for Linux')
    }
    break
}

// Show build results
console.log('\n🎉 Build completed successfully!')
console.log('=====================================')

if (fs.existsSync('release')) {
  console.log('\n📁 Build artifacts:')
  const files = fs.readdirSync('release')
  files.forEach((file) => {
    const filePath = path.join('release', file)
    const stats = fs.statSync(filePath)
    const size = (stats.size / 1024 / 1024).toFixed(2)
    console.log(`   - ${file} (${size} MB)`)
  })
}

console.log('\n💡 Tips:')
console.log('   - Run with --clean to clean previous builds')
console.log('   - Use "all" to build for all platforms')
console.log('   - Use "pack" to create unpacked builds for testing')
console.log('   - Check release/ directory for build artifacts')
