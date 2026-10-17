import { api } from "@/lib/api";
import { locationCurrencyUpdate, resolveCurrency } from "@/lib/currency";
import { readAuthToken } from "@/lib/storage";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "../api/authApi";
import type { User } from "../types";

let task: Promise<void> | null = null;

/** Aligne le profil sur le pays du fuseau, une fois par session. */
export function syncCurrencyWithLocation(): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();
    if (!readAuthToken()) return Promise.resolve();
    if (task) return task;

    task = run().catch((error) => {
        task = null;
        throw error;
    });
    return task;
}

async function run(): Promise<void> {
    const user = await authApi.getMe();
    const next = locationCurrencyUpdate(user);
    const store = useAuthStore.getState();

    if (!next) {
        store.setUser(user);
        store.setCurrency(resolveCurrency(user.currency, user.country));
        return;
    }

    store.setUser({ ...user, country: next.country, currency: next.currency });
    const updated = await api.put<User>("/api/v1/auth/me", {
        country: next.country,
        currency: next.currency,
    });
    store.setUser(updated);
    store.setCurrency(resolveCurrency(updated.currency, updated.country));
}
