"use client"

import type * as React from "react"

import { Moon, Sun } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { useThemeTransition } from "@/components/theme-provider"

export function ModeToggle() {
  const { toggleTheme } = useThemeTransition()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    toggleTheme({ x: event.clientX, y: event.clientY })
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      size="icon"
      variant="outline"
      aria-label="Toggle theme"
      className="relative"
    >
      <Sun className="size-4 rotate-0 scale-100 opacity-100 transition-all duration-200 dark:-rotate-90 dark:scale-0 dark:opacity-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 opacity-0 transition-all duration-200 dark:rotate-0 dark:scale-100 dark:opacity-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
