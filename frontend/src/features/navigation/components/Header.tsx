import { Search, Bell, ChevronDown, Menu, Settings, LogOut, Sun, Moon, AlertCircle } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { SwitchTheme } from "@/components/ui/switch-theme"

export default function Header({
  setIsSidebarOpen,
  isQuoteLayout,
  isSidebarOpen,
  isShowLogo,
  isMobile = false
}: {
  setIsSidebarOpen: any,
  isSidebarOpen: boolean,
  isShowLogo: boolean,
  isQuoteLayout: boolean,
  isMobile?: boolean
}) {

  return (
    <header className="sticky top-0 z-30 flex h-24 items-center justify-between border-b border-slate-200/50 dark:border-white/5 bg-white/60 dark:bg-slate-950/60 backdrop-blur-2xl px-8 md:px-12 transition-all duration-300">
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden h-12 w-12 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
        >
          <Menu className="h-6 w-6 text-slate-900 dark:text-white" />
        </Button>
        {isShowLogo && (
          <span className="text-2xl text-slate-900 dark:text-white font-black tracking-tighter">
            Sharaco
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4 md:space-x-8">
        {/* Search bar - refined with better radius and shadow */}
        {!isQuoteLayout && (
          <div className="relative hidden lg:block group">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-400 group-focus-within:text-sky-500 transition-all" />
            <Input
              type="search"
              placeholder="Command + K to search..."
              className="w-[320px] xl:w-[480px] h-12 bg-slate-100/50 dark:bg-white/5 border-transparent focus:border-sky-500/30 focus:ring-4 focus:ring-sky-500/5 rounded-2xl pl-12 font-medium transition-all"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex h-12 w-12 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 relative active:scale-95 transition-all group">
            <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:rotate-12 transition-transform" />
            <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-rose-500 border-2 border-white dark:border-slate-950 shadow-sm" />
          </Button>

          <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 mx-2 hidden sm:block" />

          <SwitchTheme />
        </div>

        {/* User menu with premium feel */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-14 p-1.5 pl-2 pr-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 group active:scale-95 transition-all">
              <div className="relative">
                <Avatar className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-100 dark:bg-white/5 shadow-sm group-hover:scale-105 transition-transform">
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback className="rounded-none font-bold">CN</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 shadow-sm" />
              </div>
              <div className="hidden md:flex flex-col items-start ml-3 text-left">
                <p className="text-sm font-black text-slate-900 dark:text-white leading-none tracking-tight">Level</p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 mt-1 uppercase tracking-widest">Admin</p>
              </div>
              <ChevronDown className="h-4 w-4 ml-3 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 rounded-3xl p-3 border-slate-200/50 dark:border-white/5 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl shadow-2xl overflow-hidden relative">
            {/* Background decorative element */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl" />

            <DropdownMenuLabel className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account Hub</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 mx-1 mb-2" />
            <DropdownMenuItem className="flex items-center justify-between rounded-2xl px-4 py-3.5 transition-all text-slate-700 dark:text-slate-300 hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400 group/item cursor-pointer">
              <div className="flex items-center font-bold text-sm">
                <Settings className="mr-3 h-4 w-4 text-slate-400 group-hover/item:rotate-90 transition-transform" />
                Settings
              </div>
              <div className="h-2 w-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center rounded-2xl px-4 py-3.5 transition-all text-slate-700 dark:text-slate-300 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 font-bold text-sm cursor-pointer">
              <LogOut className="mr-3 h-4 w-4 text-slate-400" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
