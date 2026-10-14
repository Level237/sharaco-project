import re

with open("frontend/src/app/(dashboard)/dashboard/quotes/page.tsx", "r") as f:
    content = f.read()

# Replace the isLoading and empty state logic in page.tsx
# We want to remove the specific isLoading block, because QuoteList handles it now.
# We also want to unconditionally render QuoteHeader and QuoteList if not error.

new_return = """    return (
        <div className="flex-1 min-w-0 w-full space-y-4 sm:space-y-6 lg:space-y-8 xl:space-y-12 p-3 sm:p-4 md:p-8 pt-4 sm:pt-6 min-h-screen">
            {error ? (
                /* ═══════════ ERROR STATE ═══════════ */
                <div className="flex flex-col items-center justify-center p-6 sm:p-12 md:p-20 text-center bg-slate-950/40 rounded-lg border border-rose-500/20 backdrop-blur-xl mt-4 sm:mt-8">
                    <p className="text-rose-500 font-medium mb-3 sm:mb-4 text-sm sm:text-base px-4">
                        Impossible de charger les devis.
                    </p>
                    <Button onClick={() => refetch()} variant="outline" className="rounded-lg h-10 sm:h-11 px-4">
                        <RefreshCcw className="mr-2 h-4 w-4" /> Réessayer
                    </Button>
                </div>
            ) : !isLoading && !hasQuotes ? (
                /* ═══════════ EMPTY STATE ═══════════ */
                <div className="flex flex-col items-center justify-center py-16 sm:py-24 md:py-32 text-center px-4">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-[#2563EB]/10 flex items-center justify-center mb-4 sm:mb-6 border border-blue-500/20 shadow-xl shadow-blue-500/10 group hover:scale-105 transition-transform duration-300">
                        <FileText className="h-7 w-7 sm:h-8 sm:h-8 text-[#2563EB]" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-3 sm:mb-4">
                        Aucun devis pour le moment
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-md mx-auto mb-6 sm:mb-8 md:mb-10 leading-relaxed">
                        Commencez par créer votre premier devis. Il sera ajouté à cette liste et vous pourrez le partager directement avec vos clients.
                    </p>
                    <Link href="/dashboard/quotes/create">
                        <Button className="h-12 sm:h-14 px-5 sm:px-6 md:px-8 bg-[#2563EB] hover:bg-[#2563EB]/80 text-white rounded-lg sm:rounded-lg font-bold text-sm sm:text-base md:text-lg">
                            <Plus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-1.5 sm:mr-2" />
                            Créer mon premier devis
                        </Button>
                    </Link>
                </div>
            ) : (
                <>
                    <QuoteHeader
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                    />

                    <div className="mt-4 sm:mt-6 md:mt-8">
                        <QuoteList
                            quotes={quotes || []}
                            isLoading={isLoading}
                            onDeleteSuccess={handleDeleteSuccess}
                            searchQuery={searchQuery}
                            statusFilter={statusFilter}
                        />
                    </div>
                </>
            )}
        </div>
    )"""

content = re.sub(r'    return \(\n        <div className="flex-1 min-w-0 w-full.*?\n    \)', new_return, content, flags=re.DOTALL)

with open("frontend/src/app/(dashboard)/dashboard/quotes/page.tsx", "w") as f:
    f.write(content)

