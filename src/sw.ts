/// <reference lib="webworker" />
/// <reference types="vite-plugin-pwa/vanillajs" />
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope & typeof globalThis

clientsClaim()
self.skipWaiting()

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Stale-while-revalidate for navigation requests
registerRoute(
  ({ request }: { request: Request }) => request.mode === 'navigate',
  new StaleWhileRevalidate()
)
