import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Logo from "@/components/ui/logo"
import Footer from "@/features/home/components/Footer"

export const metadata: Metadata = {
    title: "Politique de confidentialité | Sharaco",
    description: "Comment nous protégeons et utilisons vos données sur Sharaco.",
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 flex items-center h-16 justify-between">
                    <Link href="/" className="flex items-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        <span className="text-sm font-medium">Retour</span>
                    </Link>
                    <Logo width={120} height={40} />
                    <div className="w-16"></div> {/* Spacer for centering */}
                </div>
            </header>

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20">
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
                    Politique de confidentialité
                </h1>
                
                <div className="text-slate-600 dark:text-slate-300 space-y-8 leading-relaxed text-base md:text-lg">
                    <p className="text-sm text-slate-500 font-medium">
                        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                    </p>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-12">1. Introduction</h2>
                        <p>
                            Chez Sharaco, la protection de vos données personnelles et de celles de vos clients est notre priorité absolue. 
                            Cette politique explique quelles données nous collectons, comment nous les utilisons et quels sont vos droits.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-10">2. Données collectées</h2>
                        <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[#2563EB]">
                            <li><strong>Données de compte :</strong> Votre nom, adresse email, mot de passe (crypté) et informations d'entreprise.</li>
                            <li><strong>Données de facturation :</strong> Les informations de vos clients que vous saisissez pour créer vos devis et factures.</li>
                            <li><strong>Données d'usage :</strong> Statistiques anonymisées de navigation pour améliorer notre service.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-10">3. Utilisation de vos données</h2>
                        <p>
                            Vos données sont exclusivement utilisées pour fournir le service Sharaco :
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[#2563EB]">
                            <li>Générer et stocker vos devis et factures de manière sécurisée.</li>
                            <li>Vous envoyer des notifications liées à l'activité de votre compte.</li>
                            <li>Améliorer nos modèles de documents grâce à l'IA (sans exposer vos données sensibles).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-10">4. Partage et sécurité</h2>
                        <p>
                            <strong>Nous ne vendrons jamais vos données.</strong> Vos informations sont hébergées sur des serveurs sécurisés.
                            L'accès à votre base de données est strictement restreint.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-10">5. Vos droits (RGPD)</h2>
                        <p>
                            Conformément à la réglementation européenne, vous disposez d'un droit d'accès, de rectification, de portabilité et de suppression de vos données. 
                            Vous pouvez exporter toutes vos données ou supprimer votre compte définitivement depuis vos paramètres.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-10">6. Nous contacter</h2>
                        <p>
                            Pour toute question concernant la confidentialité de vos données, contactez-nous à : 
                            <a href="mailto:privacy@sharaco.com" className="text-[#2563EB] hover:underline ml-1">privacy@sharaco.com</a>.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
