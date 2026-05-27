import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('useThemeStore', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('defaults to dark when localStorage is empty', async () => {
    const { useThemeStore } = await import('./theme')
    expect(useThemeStore.getState().theme).toBe('dark')
  })

  it('reads light from localStorage on init', async () => {
    localStorage.setItem('theme', 'light')
    const { useThemeStore } = await import('./theme')
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('toggle switches dark → light', async () => {
    const { useThemeStore } = await import('./theme')
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('toggle switches light → dark', async () => {
    localStorage.setItem('theme', 'light')
    const { useThemeStore } = await import('./theme')
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().theme).toBe('dark')
  })

  it('toggle persists new theme to localStorage', async () => {
    const { useThemeStore } = await import('./theme')
    useThemeStore.getState().toggle()
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('toggle adds dark class to <html> when switching to dark', async () => {
    localStorage.setItem('theme', 'light')
    const { useThemeStore } = await import('./theme')
    useThemeStore.getState().toggle()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggle removes dark class from <html> when switching to light', async () => {
    document.documentElement.classList.add('dark')
    const { useThemeStore } = await import('./theme')
    useThemeStore.getState().toggle()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
