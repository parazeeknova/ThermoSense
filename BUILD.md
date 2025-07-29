# ThermoSense Build & Release Guide

This guide covers building and releasing the ThermoSense Electron application for Windows, macOS, and Linux.

## Quick Start

```bash
# Initial setup (run once)
npm run setup:dev

# Development
npm run electron:dev

# Build for current platform
npm run build:local

# Build for all platforms
npm run build:local:all

# Prepare and release
npm run prepare:release
```

## Prerequisites

### System Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **Git**: For version control and releases

### Platform-Specific Requirements

#### macOS

- **Xcode Command Line Tools**: `xcode-select --install`
- **Apple Developer Account**: For code signing (optional for development)

#### Windows

- **Windows SDK**: For native modules (optional)
- **Code Signing Certificate**: For distribution (optional)

#### Linux

- **Build tools**: `sudo apt-get install build-essential`
- **Additional libraries**: Installed automatically by electron-builder

## Development Setup

### 1. Initial Setup

```bash
# Clone the repository
git clone https://github.com/parazeeknova/ThermoSense.git
cd ThermoSense

# Run setup script
npm run setup:dev
```

This script will:

- Install all dependencies
- Create necessary directories
- Set up environment files
- Run initial build tests
- Install platform-specific tools

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# ThermoSense Environment Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
WEATHER_API_KEY=your_weather_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
SKIP_ENV_VALIDATION=true
```

### 3. Application Icons

Add your application icons to the `build/` directory:

- **macOS**: `build/icon.icns` (512x512 minimum)
- **Windows**: `build/icon.ico` (256x256 with multiple sizes)
- **Linux**: `build/icons/*.png` (16x16 to 512x512)

See `build/README.md` for detailed icon creation instructions.

## Development Workflow

### Start Development Server

```bash
npm run electron:dev
```

This starts both the Next.js dev server and Electron in development mode with hot reload.

### Development Commands

```bash
# Web-only development
npm run dev:web

# Build Electron main process only
npm run build:electron

# Run Electron with built main process
npm run electron

# Linting and type checking
npm run lint
npm run type-check
```

## Building for Production

### Local Builds

#### Build for Current Platform

```bash
npm run build:local
```

#### Build for Specific Platform

```bash
npm run build:local win      # Windows
npm run build:local mac      # macOS
npm run build:local linux    # Linux
npm run build:local all      # All platforms
```

#### Build Options

```bash
# Clean build (removes previous builds)
npm run build:local:clean

# Create unpacked build for testing
npm run build:local pack
```

### Manual Build Commands

```bash
# Individual platform builds
npm run electron:dist:win     # Windows only
npm run electron:dist:mac     # macOS only
npm run electron:dist:linux   # Linux only
npm run electron:dist:all     # All platforms

# Create unpacked build
npm run electron:pack
```

### Build Outputs

Builds are created in the `release/` directory:

#### Windows

- `ThermoSense Setup X.X.X.exe` - NSIS installer
- `ThermoSense X.X.X.msi` - MSI installer
- `ThermoSense X.X.X.exe` - Portable executable

#### macOS

- `ThermoSense-X.X.X.dmg` - DMG installer
- `ThermoSense-X.X.X-mac.zip` - ZIP archive

#### Linux

- `ThermoSense-X.X.X.AppImage` - Universal AppImage
- `thermosense_X.X.X_amd64.deb` - Debian package
- `thermosense-X.X.X.x86_64.rpm` - RPM package
- `thermosense-X.X.X.tar.gz` - Tarball

## Release Process

### Automated Release (Recommended)

#### 1. Prepare Release

```bash
# Patch release (1.0.0 -> 1.0.1)
npm run prepare:release

# Minor release (1.0.0 -> 1.1.0)
npm run prepare:release:minor

# Major release (1.0.0 -> 2.0.0)
npm run prepare:release:major
```

This script will:

- Run tests and linting
- Build the application
- Bump the version
- Create a git tag
- Push changes and tag to GitHub

#### 2. Automatic Build

GitHub Actions will automatically:

- Build for all platforms
- Create a GitHub release
- Upload all build artifacts
- Generate release notes

### Manual Release

#### 1. Version Bump

```bash
npm version patch  # or minor, major
git push --tags
```

#### 2. Trigger GitHub Actions

- Go to your repository's Actions tab
- Run "Build and Release Electron App" workflow
- Enter the version tag (e.g., v1.0.1)

### Release Workflow Details

The GitHub Actions workflow (`release.yml`) handles:

1. **Multi-platform builds** on Ubuntu, Windows, and macOS runners
2. **Artifact creation** for all supported formats
3. **Release creation** with automatic release notes
4. **Asset uploads** to GitHub Releases
5. **Notification** of build status

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clean everything and rebuild
npm run clean:all
npm install
npm run build:local
```

#### Permission Issues (Linux/macOS)

```bash
chmod +x scripts/*.js
```

#### Missing Dependencies

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Icon Issues

- Ensure icons are in correct formats and sizes
- Check `build/README.md` for icon requirements
- Use online converters or `electron-icon-builder`

### Platform-Specific Issues

#### macOS Code Signing

```bash
# Disable code signing for development
export CSC_IDENTITY_AUTO_DISCOVERY=false
npm run build:local mac
```

#### Windows Antivirus

- Add project directory to antivirus exclusions
- Temporarily disable real-time protection during builds

#### Linux Dependencies

```bash
# Install missing libraries
sudo apt-get install libnss3-dev libatk-bridge2.0-dev libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2
```

## GitHub Actions Configuration

### Required Secrets

- `GITHUB_TOKEN` - Automatically provided by GitHub

### Optional Secrets (for code signing)

- `CSC_LINK` - macOS certificate
- `CSC_KEY_PASSWORD` - Certificate password
- `WIN_CSC_LINK` - Windows certificate
- `WIN_CSC_KEY_PASSWORD` - Windows certificate password

### Workflow Files

- `.github/workflows/release.yml` - Release builds
- `.github/workflows/build.yml` - Development builds and testing

## Advanced Configuration

### Electron Builder Options

Edit the `build` section in `package.json`:

```json
{
  "build": {
    "appId": "com.thermosense.app",
    "productName": "ThermoSense",
    "directories": {
      "output": "release"
    }
  }
}
```

### Auto-updater Setup

The app includes auto-updater configuration. To enable:

1. Set up a release server or use GitHub Releases
2. Configure the `publish` section in `package.json`
3. Implement update checking in the main process

### Custom Build Scripts

Add custom build logic in `scripts/build-local.js`:

```javascript
// Add custom build steps
function customBuildStep() {
  // Your custom logic here
}
```

## Performance Tips

### Build Optimization

- Use `--dir` flag for faster unpacked builds during development
- Enable parallel builds with `--parallel`
- Use build caching for faster subsequent builds

### Development Optimization

- Use `concurrently` for parallel processes
- Enable hot reload for faster development
- Use TypeScript incremental compilation

## Support

### Documentation

- `build/README.md` - Icon creation guide
- `.kiro/specs/` - Feature specifications
- GitHub Issues - Bug reports and feature requests

### Community

- GitHub Discussions - General questions
- Stack Overflow - Technical questions (tag: electron, thermosense)

---

For more information, see the [Electron Builder documentation](https://www.electron.build/) and [GitHub Actions documentation](https://docs.github.com/en/actions).
