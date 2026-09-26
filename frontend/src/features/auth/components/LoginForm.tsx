'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';

import Logo from '@/components/ui/logo';
import { useLogin, useVerifyIfEmailExist } from '../hooks/useAuth';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth-store';
import { authApi } from '@/features/auth/api/authApi';

const loginSchema = z.object({
    email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
    password: z.string().min(1, 'Le mot de passe est requis'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const router = useRouter();
    const loginMutation = useLogin();
    const verifyIfEmailExistMutation = useVerifyIfEmailExist();

    // ✅ Import du store pour sauvegarder le token et l'utilisateur
    const { setToken, setUser } = useAuthStore();

    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'email' | 'password'>('email');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onStepNext = async () => {
        setError('');
        if (!email || !z.string().email().safeParse(email).success) {
            setError("Veuillez entrer un email valide");
            return;
        }

        try {
            const exists = await verifyIfEmailExistMutation.mutateAsync(email);
            console.log(exists)
            if (exists) {
                form.setValue('email', email);
                setStep('password');
            } else {
                setError('Email non trouvé ou non autorisé.');
            }
        } catch (err) {
            setError("Cet email n'existe pas");
        }
    };

    const onSubmit = async (data: LoginFormValues) => {
        setError('');
        try {
            const response = await loginMutation.mutateAsync({
                username: data.email,
                password: data.password,
            });

            if (response?.access_token) {
                // ✅ Sauvegarde du token dans localStorage + Cookie + Zustand
                setToken(response.access_token);

                // ✅ Récupération du profil utilisateur
                try {
                    const user = await authApi.getMe();
                    setUser(user);
                } catch (err) {
                    console.error("Erreur lors de la récupération du profil:", err);
                }

                // ✅ Redirection vers le dashboard
                router.push('/dashboard');
            } else {
                setError("Une erreur est survenue lors de la connexion.");
            }
        } catch (err: any) {
            setError(
                err.response?.data?.detail ||
                "Identifiants incorrects. Veuillez réessayer."
            );
        }
    };

    return (
        <div className="w-full max-w-[400px] space-y-8 text-center overflow-hidden">
            {/* Logo & Heading */}
            <div className="flex flex-col items-center space-y-6">
                <div className="p-3  dark:border-slate-800">
                    <Logo width={160} height={160} />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Sign in to Sharaco</h1>
                    <p className="text-zinc-500 text-sm font-medium">
                        Identifiez-vous pour accéder à votre espace.
                    </p>
                </div>
            </div>

            <div className="relative">

                {step === 'email' ? (
                    <div

                        className="space-y-4"
                    >
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full cursor-pointer h-12 bg-zinc-900/50 border-zinc-800 text-white hover:bg-zinc-800/50 hover:text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                            onClick={() => {
                                // ✅ Redirection vers le backend OAuth
                                window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/google/login`;
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continuer avec Google
                        </Button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-zinc-800"></div>
                            <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs font-medium uppercase">Ou avec votre email</span>
                            <div className="flex-grow border-t border-zinc-800"></div>
                        </div>

                        <div className="space-y-2">
                            <Input
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && onStepNext()}
                                value={email}
                                type="email"
                                placeholder="Entrez votre email"
                                disabled={verifyIfEmailExistMutation.isPending}
                                className="h-12 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-[#2563EB] focus:border-[#2563EB] rounded-xl"
                            />
                        </div>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-sm font-medium"
                            >
                                {error}
                            </motion.div>
                        )}
                        <Button
                            onClick={onStepNext}
                            disabled={verifyIfEmailExistMutation.isPending || !email}
                            className="w-full cursor-pointer h-12 bg-[#2563EB] hover:bg-[#2563EB]/80 text-white font-bold rounded-xl transition-all"
                        >
                            {verifyIfEmailExistMutation.isPending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'Continuer'
                            )}
                        </Button>
                    </div>
                ) : (
                    <motion.div
                        key="password-step"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {(error || loginMutation.isError) && (
                                    <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-500 text-left">
                                        {error || "Identifiants incorrects. Veuillez réessayer."}
                                    </div>
                                )}

                                <div className="flex items-center space-x-2 text-sm text-zinc-400 mb-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep('email')}
                                        className="hover:text-white transition-colors"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="font-medium truncate">{email}</span>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="text-left">
                                            <div className="flex items-center mt-6 justify-between mb-5">
                                                <Label htmlFor="password" className="text-zinc-400 text-xs tracking-widest font-bold">Mot de passe</Label>
                                                <button
                                                    type="button"
                                                    className="text-xs text-sky-500 cursor-pointer hover:text-sky-400 font-bold transition-colors"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? 'Masquer' : 'Afficher'}
                                                </button>
                                            </div>
                                            <FormControl>
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    className="h-12 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-sky-500 focus:border-sky-500 rounded-xl"
                                                    autoComplete="current-password"
                                                    disabled={loginMutation.isPending}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs" />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full cursor-pointer h-12 bg-[#2563EB] hover:bg-[#2563EB]/80 text-white font-bold rounded-xl transition-all"
                                    disabled={loginMutation.isPending}
                                >
                                    {loginMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Connexion...
                                        </>
                                    ) : (
                                        'Se connecter'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </motion.div>
                )}

            </div>

            <p className="text-zinc-500 text-sm font-medium pt-4">
                Vous n'aviez pas un compte ?{" "}
                <Link href="/signup" className="text-[#2563EB] hover:text-sky-400 font-bold underline-offset-4 hover:underline">
                    Créer
                </Link>
            </p>
        </div>
    );
}