"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

type Coords = {
  x: number
  y: number
}

type ThemeTransitionContextValue = {
  toggleTheme: (coords?: Coords) => void
}

const ThemeTransitionContext = React.createContext<ThemeTransitionContextValue | null>(
  null
)

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => {
    finished: Promise<void>
    ready: Promise<void>
    updateCallbackDone: Promise<void>
    skipTransition: () => void
  }
}

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeProviderWithTransitions>
        <ThemeHotkey />
        {children}
      </ThemeProviderWithTransitions>
    </NextThemesProvider>
  )
}

function ThemeProviderWithTransitions({
  children,
}: {
  children: React.ReactNode
}) {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = React.useCallback(
    (coords?: Coords) => {
      const nextTheme = resolvedTheme === "dark" ? "light" : "dark"
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
      const viewTransitionDocument = document as ViewTransitionDocument

      if (!viewTransitionDocument.startViewTransition || prefersReducedMotion) {
        setTheme(nextTheme)
        return
      }

      if (coords) {
        document.documentElement.style.setProperty("--x", `${coords.x}px`)
        document.documentElement.style.setProperty("--y", `${coords.y}px`)
      }

      viewTransitionDocument.startViewTransition(() => {
        setTheme(nextTheme)
      })
    },
    [resolvedTheme, setTheme]
  )

  return (
    <ThemeTransitionContext.Provider value={{ toggleTheme }}>
      {children}
    </ThemeTransitionContext.Provider>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { toggleTheme } = useThemeTransition()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      toggleTheme()
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [toggleTheme])

  return null
}

function useThemeTransition() {
  const context = React.useContext(ThemeTransitionContext)

  if (!context) {
    throw new Error("useThemeTransition must be used within ThemeProvider")
  }

  return context
}

export { ThemeProvider, useThemeTransition }
