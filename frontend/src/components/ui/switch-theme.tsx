"use client"

import { Sun } from "lucide-react"
import { Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./button"


export const SwitchTheme = () => {
    const { setTheme, theme } = useTheme();
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative overflow-hidden"
        >
            <Sun className={`h-5 w-5 dark:text-white absolute transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
            <Moon className={`h-5 w-5 dark:text-white absolute transition-all duration-300 ${theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`} />
        </Button>
    )
}

