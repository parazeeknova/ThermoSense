#!/usr/bin/env node
/* eslint-disable node/prefer-global/process */

const { execSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')

console.log('🛠️  ThermoSense Development Setup')
console.log('==================================')

function runCommand(command, description, optional = false) {
  console.log(`\n📦 ${description}...`)
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() })
    console.log(`✅ ${description} completed`)
    return true
  }
  catch (error) {
    if (optional) {
      console.warn(`⚠️  ${description} failed (optional):`, error.message)
      return false
    }
    else {
      console.error(`❌ ${description} failed:`, error.message)
      process.exit(1)
    }
  }
}

console.log('\n🔍 Checking Node.js version...')
const nodeVersion = process.version
const majorVersion = Number.parseInt(nodeVersion.slice(1).split('.')[0])

if (majorVersion < 18) {
  console.error(`❌ Node.js ${nodeVersion} is not supported. Please use Node.js 18 or higher.`)
  process.exit(1)
}
console.log(`✅ Node.js ${nodeVersion} is supported`)

if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found. Please run this script from the project root.')
  process.exit(1)
}

runCommand('npm install', 'Installing dependencies')

// Create necessary directories
console.log('\n📁 Creating necessary directories...')
const directories = ['build', 'build/icons', 'assets', 'release']
directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`   ✅ Created ${dir}/`)
  }
  else {
    console.log(`   ℹ️  ${dir}/ already exists`)
  }
})

// Check for .env file
console.log('\n🔍 Checking environment configuration...')
if (!fs.existsSync('.env')) {
  console.log('⚠️  .env file not found. Creating template...')
  const envTemplate = `# ThermoSense Environment Configuration
# Copy this file to .env and fill in your values

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API Keys (if needed)
# WEATHER_API_KEY=your_weather_api_key_here
# GEMINI_API_KEY=your_gemini_api_key_here

# Development
NODE_ENV=development
SKIP_ENV_VALIDATION=true
`
  fs.writeFileSync('.env.example', envTemplate)
  fs.writeFileSync('.env', envTemplate)
  console.log('✅ Created .env and .env.example files')
}
else {
  console.log('✅ .env file exists')
}

// Run initial build to verify setup
runCommand('npm run build', 'Running initial build test')
runCommand('npm run build:electron', 'Building Electron main process')

// Platform-specific setup
const platform = os.platform()
console.log(`\n🖥️  Platform-specific setup for ${platform}...`)

if (platform === 'darwin') {
  console.log('📱 macOS detected')
  console.log('   - For code signing, you\'ll need an Apple Developer account')
  console.log('   - Install Xcode Command Line Tools if not already installed')
  runCommand('xcode-select --install', 'Installing Xcode Command Line Tools', true)
}
else if (platform === 'win32') {
  console.log('🪟 Windows detected')
  console.log('   - For code signing, you\'ll need a Windows code signing certificate')
  console.log('   - Consider installing Windows SDK for better compatibility')
}
else {
  console.log('🐧 Linux detected')
  console.log('   - Make sure you have build-essential installed')
  runCommand('sudo apt-get update && sudo apt-get install -y build-essential', 'Installing build tools', true)
}

// Check for build assets
console.log('\n🎨 Checking build assets...')
const iconFiles = {
  darwin: 'build/icon.icns',
  win32: 'build/icon.ico',
  linux: 'build/icons/512x512.png',
}

const requiredIcon = iconFiles[platform]
if (requiredIcon && !fs.existsSync(requiredIcon)) {
  console.warn(`⚠️  Missing icon file: ${requiredIcon}`)
  console.log('   See build/README.md for instructions on creating icons')
}
else if (requiredIcon) {
  console.log(`✅ Icon file found: ${requiredIcon}`)
}

// Create a sample icon if none exists (placeholder)
if (!fs.existsSync('build/icon.png')) {
  console.log('📝 Creating placeholder icon...')
  // This would normally create a simple placeholder icon
  // For now, just create a note file
  fs.writeFileSync('build/ICON_NEEDED.txt', 'Please add your application icons here:\n'
  + '- icon.icns for macOS\n'
  + '- icon.ico for Windows\n'
  + '- PNG files in icons/ directory for Linux\n\n'
  + 'See build/README.md for detailed instructions.')
}

console.log('\n🎉 Development setup completed!')
console.log('================================')

console.log('\n🚀 Next Steps:')
console.log('   1. Add your application icons to the build/ directory')
console.log('   2. Configure your .env file with any required API keys')
console.log('   3. Start development with: npm run electron:dev')
console.log('   4. Build for production with: npm run build:local')

console.log('\n💡 Useful Commands:')
console.log('   - npm run electron:dev     - Start development mode')
console.log('   - npm run build:local      - Build for current platform')
console.log('   - npm run build:local:all  - Build for all platforms')
console.log('   - npm run prepare:release  - Prepare and publish a release')
console.log('   - npm run clean            - Clean build artifacts')

console.log('\n🔧 Troubleshooting:')
console.log('   - If builds fail, try: npm run clean && npm install')
console.log('   - For permission issues on Linux/macOS: chmod +x scripts/*.js')
console.log('   - Check GitHub Actions for automated builds and releases')
