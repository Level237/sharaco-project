"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Linkedin, Github, Facebook, Heart } from 'lucide-react'

// Custom WhatsApp SVG Icon
function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerNavigation = {
    product: [
      { name: "Générateur de Devis", href: "/dashboard/quotes/create" },
      { name: "Facturation en ligne", href: "/dashboard/invoices" },
      { name: "Échéanciers de paiement", href: "#how-it-works" },
      { name: "Modèles professionnels", href: "#features" },
      { name: "Tarification", href: "#pricing" },
    ],
    solutions: [
      { name: "Freelances & Indépendants", href: "#solutions" },
      { name: "Artisans & BTP", href: "#solutions" },
      { name: "Agences & PME", href: "#solutions" },
      { name: "Consultants & Services", href: "#solutions" },
    ],
    resources: [
      { name: "Centre d'aide", href: "#help" },
      { name: "Modèles gratuits", href: "#templates" },
      { name: "Guide de facturation", href: "#guide" },
      { name: "Calculateur de TVA", href: "#tools" },
    ],
    company: [
      { name: "À propos", href: "#about" },
      { name: "Blog", href: "#blog" },
      { name: "Contact & Support", href: "#contact" },
      { name: "CGU", href: "/terms" },
      { name: "Confidentialité", href: "/privacy" },
    ],
  }

  return (
    <footer className="relative bg-slate-950 text-slate-400 border-t border-slate-900 overflow-hidden pt-16 pb-12">
      {/* Background Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-blue-600/10 via-indigo-500/5 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Main Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-slate-900">
          
          {/* Brand Info (4 Cols) */}
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="inline-block mb-4">
              <Image 
                src="/img/logo.png" 
                alt="Sharaco Logo" 
                width={150} 
                height={45} 
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed max-w-sm">
              La plateforme intuitive pour créer vos devis, échelonner vos paiements et automatiser vos factures en toute simplicité.
            </p>

            {/* Live Operational Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Tous les systèmes sont opérationnels
            </div>
          </div>

          {/* Nav Column 1: Produit */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Produit
            </h4>
            <ul className="space-y-3 text-sm">
              {footerNavigation.product.map((item, i) => (
                <li key={i}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nav Column 2: Solutions */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Solutions
            </h4>
            <ul className="space-y-3 text-sm">
              {footerNavigation.solutions.map((item, i) => (
                <li key={i}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nav Column 3: Ressources */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Ressources
            </h4>
            <ul className="space-y-3 text-sm">
              {footerNavigation.resources.map((item, i) => (
                <li key={i}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nav Column 4: Entreprise */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Entreprise
            </h4>
            <ul className="space-y-3 text-sm">
              {footerNavigation.company.map((item, i) => (
                <li key={i}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Legal, Powered By & Social Icons */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          
          <div className="flex flex-wrap items-center gap-1.5 text-center sm:text-left">
            <span>&copy; {currentYear} Sharaco. Tous droits réservés.</span>
            <span className="hidden sm:inline">•</span>
            <span>Powered by <strong className="text-slate-300 font-semibold">Martin Dev</strong></span>
          </div>

          {/* Social Links: WhatsApp, GitHub, LinkedIn, Facebook */}
          <div className="flex items-center gap-3">
            <a 
              href="https://wa.me/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-lg bg-slate-900 hover:bg-emerald-600/20 hover:text-emerald-400 text-slate-400 transition-colors" 
              aria-label="WhatsApp"
            >
              <WhatsappIcon className="w-4 h-4" />
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" 
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-lg bg-slate-900 hover:bg-blue-600/20 hover:text-blue-400 text-slate-400 transition-colors" 
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-lg bg-slate-900 hover:bg-blue-600/20 hover:text-blue-400 text-slate-400 transition-colors" 
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
          </div>

        </div>

      </div>
    </footer>
  )
}
