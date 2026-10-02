import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Logo from "@/components/ui/logo"
import Footer from "@/features/home/components/Footer"

export const metadata: Metadata = {
    title: "Conditions Générales d'Utilisation | Sharaco",
    description: "Conditions Générales d'Utilisation du service Sharaco.",
}

export default function TermsPage() {
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
                    Conditions Générales d'Utilisation
                </h1>
                
                <div className="text-slate-600 dark:text-slate-300 space-y-8 leading-relaxed text-base md:text-lg">
                    <p className="text-sm text-slate-500 font-medium">
                        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                    </p>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-12">1. Objet du service</h2>
                        <p>
                            Sharaco édite une solution logicielle en mode SaaS (Software as a Service) permettant aux freelances, artisans et TPE/PME de générer, gérer et suivre leurs devis et factures en ligne.
                            En utilisant Sharaco, vous acceptez sans réserve les présentes CGU.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-10">2. Accès au service</h2>
                        <p>
                            Pour utiliser le service, vous devez créer un compte. Vous vous engagez à fournir des informations exactes sur vous-même et votre entreprise. 
                            Vous êtes responsable de la confidentialité de vos identifiants de connexion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-10">3. Engagements de l'utilisateur</h2>
                        <p>
                            Vous vous engagez à utiliser Sharaco conformément aux lois en vigueur. Il est strictement interdit de :
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[#2563EB]">
                            <li>Générer de fausses factures ou des documents liés à des activités illégales.</li>
                            <li>Tenter de pirater, saturer ou compromettre la sécurité du logiciel.</li>
                            <li>Revendre l'accès à votre compte Sharaco.</li>
                        </ul>
                        <p className="mt-4">
                            En cas de non-respect, nous nous réservons le droit de suspendre ou supprimer votre compte immédiatement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-10">4. Propriété intellectuelle</h2>
                        <p>
                            <strong>Le logiciel :</strong> La structure, le code, le design et les algorithmes de Sharaco sont notre propriété exclusive.
                        </p>
                        <p className="mt-2">
                            <strong>Vos données :</strong> Vous restez l'unique propriétaire du contenu de vos devis, factures et bases de données clients. Nous n'avons aucun droit de propriété sur vos documents commerciaux.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-10">5. Limitation de responsabilité</h2>
                        <p>
                            Sharaco met tout en œuvre pour assurer la disponibilité du service 24/7. Toutefois, notre responsabilité ne saurait être engagée en cas de coupure du réseau, de force majeure ou de perte de données accidentelle. 
                            Le service est fourni "en l'état". Vous êtes responsable de la validité légale des factures que vous émettez envers vos clients.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-10">6. Droit applicable</h2>
                        <p>
                            Les présentes Conditions Générales d'Utilisation sont soumises au droit français. Tout litige relatif à leur interprétation ou à leur exécution relève des tribunaux compétents.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
