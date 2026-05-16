"use client"

import L from "leaflet"

// Hand-rolled SVG strings.
// Kept inline to avoid pulling react-dom/server into the client bundle
// just for icon-to-string conversion. Each shape derives from common
// open-source icon paths (Heroicons-style stroke geometry).

const HOME_SVG = `
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
       stroke="currentColor" stroke-width="2.2"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 10.5 12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-3.5v-6h-6v6H4.5A1.5 1.5 0 0 1 3 20z"/>
  </svg>`

const PIN_SVG = `
  <svg viewBox="0 0 24 32" width="22" height="29">
    <path d="M12 0a10 10 0 0 0-10 10c0 7.5 10 22 10 22s10-14.5 10-22A10 10 0 0 0 12 0z"
          fill="currentColor"/>
    <circle cx="12" cy="10" r="6.5" fill="#fff"/>
  </svg>`

// Three-block car silhouette: rectangular body, trapezium cabin, two
// wheel discs with coloured hubs. Survives 22-28 px better than a bike
// because the low-frequency two-box shape is the recognition signal.
const CAR_SVG = `
  <svg viewBox="0 0 32 20" width="26" height="16">
    <path d="M8 11 L11 5 Q11.5 4 12.5 4 L19.5 4 Q20.5 4 21 5 L24 11 Z"
          fill="currentColor"/>
    <rect x="3" y="11" width="26" height="5" rx="2" fill="currentColor"/>
    <circle cx="9" cy="16" r="2.5" fill="#fff"/>
    <circle cx="23" cy="16" r="2.5" fill="#fff"/>
    <circle cx="9" cy="16" r="1" fill="currentColor"/>
    <circle cx="23" cy="16" r="1" fill="currentColor"/>
  </svg>`

export const DEPOT_ICON: L.DivIcon = L.divIcon({
  html: `<div class="map-depot-icon">${HOME_SVG}</div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

const stopIconCache = new Map<number, L.DivIcon>()

export function stopIconFor(n: number): L.DivIcon {
  const hit = stopIconCache.get(n)
  if (hit) return hit
  const icon = L.divIcon({
    html: `<div class="map-stop-icon">${PIN_SVG}<span class="map-stop-number">${n}</span></div>`,
    className: "",
    iconSize: [22, 29],
    iconAnchor: [11, 28],
  })
  stopIconCache.set(n, icon)
  return icon
}

function agentIcon(colour: string): L.DivIcon {
  return L.divIcon({
    html: `<div class="map-agent-icon" style="color:${colour}">${CAR_SVG}</div>`,
    className: "",
    iconSize: [28, 22],
    iconAnchor: [14, 11],
  })
}

export const AGENT_ICON_LEFT: L.DivIcon = agentIcon("#7c3aed")
export const AGENT_ICON_RIGHT: L.DivIcon = agentIcon("#10b981")
