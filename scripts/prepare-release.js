#!/usr/bin/env node
/* eslint-disable node/prefer-global/process */

const { execSync } = require('node:child_process')
const fs = require('node:fs')

// Helper function to run commands
function runCommand(command, description) {
  console.log(`\n📦 ${description}...`)
  try {
    const output = execSync(command, { cwd: process.cwd(), encoding: 'utf8' })
    console.log(`✅ ${description} completed`)
    return output.trim()
  }
  catch (error) {
    console.error(`❌ ${description} failed:`, error.message)
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const versionType = args[0] || 'patch' // patch, minor, major

if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error('❌ Invalid version type. Use: patch, minor, or major')
  process.exit(1)
}

console.log('🚀 Preparing ThermoSense Release')
console.log('=================================')

// Check if working directory is clean
console.log('\n🔍 Checking git status...')
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' })
  if (gitStatus.trim()) {
    console.error('❌ Working directory is not clean. Please commit or stash changes first.')
    console.log('Uncommitted changes:')
    console.log(gitStatus)
    process.exit(1)
  }
  console.log('✅ Working directory is clean')
}
catch (error) {
  console.error('❌ Failed to check git status:', error.message)
  process.exit(1)
}

runCommand('npm run lint', 'Running linter')
runCommand('npm run type-check', 'Running type check')

runCommand('npm run build', 'Building Next.js application')
runCommand('npm run build:electron', 'Building Electron main process')

// Get current version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const currentVersion = packageJson.version
console.log(`\n📋 Current version: ${currentVersion}`)

// Bump version
const newVersion = runCommand(`npm version ${versionType} --no-git-tag-version`, `Bumping ${versionType} version`)
console.log(`📋 New version: ${newVersion}`)

// Update package.json version in git
runCommand('git add package.json package-lock.json', 'Staging version changes')
runCommand(`git commit -m "chore: bump version to ${newVersion}"`, 'Committing version bump')

// Create and push tag
runCommand(`git tag -a ${newVersion} -m "Release ${newVersion}"`, 'Creating release tag')
runCommand('git push origin main', 'Pushing changes to main branch')
runCommand(`git push origin ${newVersion}`, 'Pushing release tag')

console.log('\n🎉 Release preparation completed!')
console.log('===================================')
console.log(`\n📋 Release Summary:`)
console.log(`   - Version: ${newVersion}`)
console.log(`   - Tag: ${newVersion}`)
console.log(`   - Branch: main`)

console.log('\n🚀 Next Steps:')
console.log('   1. GitHub Actions will automatically build and create a release')
console.log('   2. Monitor the Actions tab in your GitHub repository')
console.log('   3. The release will be available once the workflow completes')
console.log(`   4. Release URL: https://github.com/your-username/thermosense/releases/tag/${newVersion}`)

console.log('\n💡 Manual Release (if needed):')
console.log('   - Go to GitHub repository')
console.log('   - Navigate to Actions tab')
console.log('   - Run "Build and Release Electron App" workflow manually')
console.log(`   - Use version: ${newVersion}`)
