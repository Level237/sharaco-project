"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, BarChart3, Users, CheckCircle, ArrowRight, Menu, X, Rocket, Zap, Globe, ShieldCheck, Mail, Star, AlertTriangle, Clock, EyeOff, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SwitchTheme } from '@/components/ui/switch-theme'
import Image from 'next/image'
import Logo from '@/components/ui/logo'
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { PublicTemplateModal } from '@/features/home/components/PublicTemplateModal';

// Types
interface NavItem {
  label: string
  href: string
}

interface Feature {
  title: string
  description: string
  icon: any
  bgColor: string
}

// Constants
const NAV_ITEMS: NavItem[] = [
  { label: 'Fonctionnalités', href: '#fonctionnalites' },
  { label: 'Comment ça marche', href: '#comment-ca-marche' },
  { label: 'Démo', href: '#demo' },
]

const FEATURES: Feature[] = [
  {
    title: 'AI-Powered Quotes',
    description: 'Create multi-page, professional quotes in under a minute using our proprietary AI engine.',
    icon: <Sparkles className="w-8 h-8 text-sky-500" />,
    bgColor: 'bg-sky-500/10'
  },
  {
    title: 'Precision Analytics',
    description: 'Deep dive into your conversion rates with real-time tracking and behavioral insights.',
    icon: <BarChart3 className="w-8 h-8 text-emerald-500" />,
    bgColor: 'bg-emerald-500/10'
  },
  {
    title: 'Global Collaboration',
    description: 'Work with your distributed team in real-time with granular permissions and audit logs.',
    icon: <Globe className="w-8 h-8 text-indigo-500" />,
    bgColor: 'bg-indigo-500/10'
  }
]

export default function Hero() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative ">
      {/* Navigation */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm py-4 border-b border-slate-200 dark:border-slate-800' : 'bg-transparent py-6'}`}>
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center scale-90 origin-left">
            <Logo width={150} height={150} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-x-10">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/login" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Connexion
            </Link>
            <Link href="/register">
              <button className="bg-[#2563EB] text-white  px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:bg-black dark:hover:bg-gray-100 shadow-md">
                Get Started
              </button>
            </Link>
            <div className="pl-2">
              <SwitchTheme />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            <SwitchTheme />
            <button
              type="button"
              className="p-2 text-slate-900 dark:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div
          className={`absolute top-full left-0 right-0 mt-2 mx-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg transform transition-all duration-200 ease-in-out lg:hidden z-40 origin-top ${isMobileMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-95 opacity-0 pointer-events-none'
            }`}
        >
          <div className="p-5">
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-4 py-3 text-base font-semibold text-gray-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                <Button variant="outline" className="w-full h-11 rounded-lg text-base font-bold border-slate-200 dark:border-slate-700">
                  Connexion
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                <Button className="w-full h-11 rounded-lg text-base font-bold bg-[#2563EB] hover:bg-[#1d4ed8] text-white">
                  Commencer gratuitement
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className=" overflow-hidden">
        
        {/* Hero section */}
        <section className="relative pt-40  lg:pt-56 ">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            {/* Mesh Gradients */}
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-sky-400/20 blur-[120px] rounded-full animate-pulse-slow" />
            <div className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] bg-indigo-500/15 blur-[120px] rounded-full animate-pulse-slow delay-700" />
            <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-emerald-400/10 blur-[120px] rounded-full animate-pulse-slow delay-1000" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, gray 1px, transparent 0)', backgroundSize: '40px 40px' }}
            />
            
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center flex flex-col items-center">
              {/* Announcement banner */}
              <div className="inline-flex items-center gap-3 rounded-full   border border-sky-100 bg-[#2563EB]/9  px-4 py-1.5 mb-10 transition-all hover:border-sky-300 cursor-pointer group shadow-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] shadow-lg shadow-sky-500/40">
                  <Rocket className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm max-sm:text-xs font-bold text-white ">
                  Rejoignez plus de 200 Freelancers sur Sharaco
                </span>
                <ArrowRight className="h-4 w-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Hero content */}
              <h1 className="text-5xl max-sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl max-w-5xl leading-[1.1] sm:leading-[1.1] lg:leading-[1.1]">
                Le logiciel de devis <br className="hidden md:block" />
                qui vous fait gagner <span className="text-transparent bg-clip-text bg-[#2563EB] ">du temps</span>.
              </h1>

              <p className="mt-8 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl font-medium leading-relaxed">
                Créez, envoyez et suivez vos devis depuis une seule plateforme. Fini Word, Excel et les devis perdus dans les mails.
              </p>
          <BackgroundRippleEffect />

              <div className="mt-12 flex  sm:flex-row items-center justify-center gap-5 max-sm:gap-0">
                <Link href="/register">
                  <button className="bg-[#2563EB] max-sm:text-sm text-white  px-8 py-4 rounded-full text-lg font-bold cursor-pointer shadow-xl shadow-black/10 dark:shadow-white/10 flex items-center justify-center">
                    Créer mon compte
                  </button>
                </Link>
                <button onClick={() => setShowTemplates(true)} className="px-8 z-10 py-4 max-sm:text-sm rounded-full text-lg font-bold text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center group">
                    modeles
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>




          </div>
        </section>

        <PublicTemplateModal
            isOpen={showTemplates}
            onClose={() => setShowTemplates(false)}
        />
      </main>
    </div>
  )
}
