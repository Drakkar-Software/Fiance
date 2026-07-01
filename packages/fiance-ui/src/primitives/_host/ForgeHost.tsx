'use client'
import React, { createContext, useContext } from 'react'
import { Host } from '@expo/ui'
import type { UniversalHostProps } from '@expo/ui'
import { useForgeTheme } from '../../theme/context'

const HostContext = createContext(false)

interface ForgeHostProps extends UniversalHostProps {
  children: React.ReactNode
}

/**
 * Themed @expo/ui `Host` — seedColor defaults to the Forge theme's `colors.primary`
 * so nested native controls (Button/Switch/Checkbox/Slider/Picker) inherit the
 * app's accent color on iOS (SwiftUI tint) / Android (Material3 palette) / web
 * (CSS custom properties). Marks descendants via `HostContext` so nested seahorse
 * native primitives render bare instead of creating their own bridge.
 */
function ForgeHost({ children, seedColor, ...rest }: ForgeHostProps) {
  const { colors } = useForgeTheme()
  return (
    <Host seedColor={seedColor ?? colors.primary} {...rest}>
      <HostContext.Provider value={true}>{children}</HostContext.Provider>
    </Host>
  )
}

/**
 * Wraps `node` in a `ForgeHost` unless it is already inside one — collapses a
 * tree of self-hosting seahorse native primitives (Row/Column/leaves) down to a
 * single native Host bridge. `hostProps` (e.g. `matchContents`) is only applied
 * when this call creates the Host; it's ignored when collapsing into an
 * ancestor's, since a Host's sizing is fixed at mount.
 */
function useHostWrap(
  node: React.ReactElement,
  hostProps?: Partial<UniversalHostProps>
): React.ReactElement {
  const insideHost = useContext(HostContext)
  return insideHost ? node : <ForgeHost {...hostProps}>{node}</ForgeHost>
}

export { ForgeHost, HostContext, useHostWrap }
