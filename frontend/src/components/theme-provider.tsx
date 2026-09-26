"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"


export function ThemeProvider({ children, ...props }: any) {
  const [mounted, setMounted] = React.useState(false)

  // On attend que le composant soit monté pour éviter le mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // On rend un conteneur invisible ou vide pendant l'hydratation
    // pour éviter que le HTML diverge entre serveur et client
    return <>{children}</>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}