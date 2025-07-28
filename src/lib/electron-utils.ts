/* eslint-disable node/prefer-global/process */

export function isDev(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function isElectron(): boolean {
  return typeof window !== 'undefined' && window.process?.type === 'renderer'
}

export function getElectronVersion(): string | null {
  if (typeof window !== 'undefined' && window.process?.versions?.electron) {
    return window.process.versions.electron
  }
  return null
}

export function getPlatform(): NodeJS.Platform {
  return process.platform
}
