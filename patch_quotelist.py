import re

with open("frontend/src/features/quotes/components/QuoteList.tsx", "r") as f:
    content = f.read()

skeleton_code = """
                {/* ═══════════ SKELETON CARDS ═══════════ */}
                {isLoading && [...Array(7)].map((_, i) => (
                    <motion.div key={`skeleton-${i}`} variants={cardVariants} className="flex flex-col min-w-0">
                        <Skeleton className="w-full aspect-[4/5] rounded-lg bg-white/[0.03]" />
                        <div className="mt-2 sm:mt-3 px-0.5 sm:px-1 space-y-1.5 sm:space-y-2">
                            <Skeleton className="h-3 sm:h-4 w-3/4 rounded-md bg-white/[0.05]" />
                            <Skeleton className="h-2.5 sm:h-3 w-1/2 rounded-md bg-white/[0.05]" />
                        </div>
                    </motion.div>
                ))}

                {/* ═══════════ DOCUMENT CARDS ═══════════ */}
                {!isLoading && (
                    <AnimatePresence mode="popLayout">
"""

content = content.replace('                {/* ═══════════ DOCUMENT CARDS ═══════════ */}\n                <AnimatePresence mode="popLayout">', skeleton_code)
content = content.replace('                    })}\n                </AnimatePresence>', '                    })}\n                </AnimatePresence>\n                )}')

with open("frontend/src/features/quotes/components/QuoteList.tsx", "w") as f:
    f.write(content)

