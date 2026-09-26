import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Modern input: soft glass background, subtle border, larger radius and focus glow
          "flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-background/60 dark:bg-input/30 px-3 py-2 text-sm shadow-sm transition-all placeholder:text-muted-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "backdrop-blur-[4px] hover:shadow-md focus:shadow-[0_12px_40px_rgba(99,102,241,0.12)]",
          "focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
