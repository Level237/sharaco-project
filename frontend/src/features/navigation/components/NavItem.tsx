"use client"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { NavItemInterface } from "../types/NavItemsInterface"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export function NavItem({ item, depth = 0 }: { item: NavItemInterface, depth?: number }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()

  const isActive = item.href === pathname || (item.submenu && item.submenu.some(sub => sub.href === pathname))
  const isSubmenuActive = item.submenu && item.submenu.some(sub => sub.href === pathname)
  const isCurrent = item.href === pathname



  if (item.submenu) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between font-medium transition-all duration-300 group relative h-11 px-3 rounded-xl mb-1",
              isActive
                ? "text-sky-600 dark:text-sky-400 bg-sky-500/5"
                : "text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-1.5 rounded-lg transition-all duration-300",
                isActive ? "bg-sky-500/10 text-sky-500" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
              )}>
                {React.isValidElement(item.icon) && React.cloneElement(item.icon as React.ReactElement<any>, {
                  size: 18,
                  strokeWidth: isActive ? 2.5 : 2
                })}
              </div>
              <span className="text-[14px]">{item.title}</span>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </Button>
        </CollapsibleTrigger>
        <AnimatePresence initial={false}>
          {isOpen && (
            <CollapsibleContent forceMount asChild>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pl-7 space-y-1 relative"
              >
                {/* Vertical hierarchy line with gradient */}
                <div className="absolute left-[1.35rem] top-0 bottom-3 w-[1.5px] bg-gradient-to-b from-sky-500/40 via-sky-500/10 to-transparent rounded-full" />

                {item.submenu.map((subItem, index) => (
                  <NavItem key={index} item={subItem} depth={depth + 1} />
                ))}
              </motion.div>
            </CollapsibleContent>
          )}
        </AnimatePresence>
      </Collapsible>
    )
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start items-center font-medium transition-all duration-300 h-11 px-3 rounded-xl mb-1 group relative",
        isCurrent
          ? "text-sky-600 dark:text-sky-400 font-bold"
          : "text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
      )}
      asChild
    >
      <Link href={item.href || "#"}>
        {/* Animated Active Indicator */}
        {isCurrent && (
          <motion.div
            layoutId="active-nav-indicator"
            className="absolute inset-0 bg-sky-500/5 dark:bg-sky-500/10 rounded-xl border border-sky-500/20 dark:border-sky-500/10"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sky-500 rounded-r-full shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
          </motion.div>
        )}

        <div className="flex items-center gap-3 relative z-10 w-full">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className={cn(
              "p-1.5 rounded-lg transition-all duration-300",
              isCurrent ? "bg-sky-500/10 text-sky-500 shadow-sm" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
            )}
          >
            {React.isValidElement(item.icon) && React.cloneElement(item.icon as React.ReactElement<any>, {
              size: 18,
              strokeWidth: isCurrent ? 2.5 : 2
            })}
          </motion.div>
          <span className="text-[14px] flex-1 truncate">{item.title}</span>
        </div>
      </Link>
    </Button>
  )
}