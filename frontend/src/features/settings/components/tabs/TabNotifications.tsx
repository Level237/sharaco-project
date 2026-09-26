export function TabNotifications() {
    return (
        <div className="flex flex-col items-center justify-center py-32 text-slate-500 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800">
                <p className="text-2xl">🔔</p>
            </div>
            <h3 className="text-xl font-bold text-white">Notifications</h3>
            <p className="text-sm max-w-sm text-center">Configurez vos préférences de notifications par email et push (Bientôt disponible).</p>
        </div>
    );
}
