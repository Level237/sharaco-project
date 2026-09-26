'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ChevronLeft } from 'lucide-react';
import { isValidPhoneNumber } from 'libphonenumber-js'; // ✅ Pour validation réelle

// ✅ Import du PhoneInput + CSS
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/features/auth/api/authApi';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import Logo from '@/components/ui/logo';
import { useRegister, useVerifyIfEmailExist } from '../hooks/useAuth';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

// ✅ Schéma avec validation libphonenumber
const registerSchema = z.object({
    full_name: z.string().min(2, "Le nom complet est requis"),
    password: z.string().optional(),
    phone: z
        .string()
        .optional()
        .refine(
            (val) => !val || isValidPhoneNumber(val),
            "Numéro de téléphone invalide"
        ),
    company_name: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const oauthToken = searchParams.get('oauth_token');
    const oauthEmail = searchParams.get('email');
    const oauthName = searchParams.get('name');

    const { setToken, setUser } = useAuthStore();
    const registerMutation = useRegister();
    const verifyIfEmailExistMutation = useVerifyIfEmailExist();

    const [email, setEmail] = useState(oauthEmail || '');
    const [step, setStep] = useState<'email' | 'details'>(oauthToken ? 'details' : 'email');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            full_name: oauthName || '',
            password: '',
            phone: '',
            company_name: '',
        },
    });

    useEffect(() => {
        if (oauthToken && oauthEmail) {
            setEmail(oauthEmail);
            if (oauthName) form.setValue('full_name', oauthName);
            setStep('details');
        }
    }, [oauthToken, oauthEmail, oauthName, form]);

    const onStepNext = async () => {
        setError('');
        if (!email || !z.string().email().safeParse(email).success) {
            setError("Veuillez entrer un email valide");
            return;
        }

        try {
            const exists = await verifyIfEmailExistMutation.mutateAsync(email);
            if (exists) {
                setError("Cet email est déjà utilisé. Veuillez vous connecter.");
            } else {
                setStep('details');
            }
        } catch (err) {
            console.error(err);
            setError("Une erreur est survenue lors de la vérification.");
        }
    };

    const onSubmit = async (data: RegisterFormValues) => {
        setError('');

        if (!oauthToken && (!data.password || data.password.length < 8)) {
            setError("Le mot de passe doit faire au moins 8 caractères");
            return;
        }

        setIsSubmitting(true);

        try {
            let response: any;

            if (oauthToken) {
                response = await api.post("/api/v1/auth/complete-google-registration", {
                    temp_token: oauthToken,
                    full_name: data.full_name,
                    company_name: data.company_name || undefined,
                    phone: data.phone || undefined,
                });
            } else {
                response = await registerMutation.mutateAsync({
                    email,
                    full_name: data.full_name,
                    password: data.password!,
                    phone: data.phone || undefined,
                    company_name: data.company_name || undefined,
                });
            }

            if (response?.access_token || response?.data?.access_token) {
                const accessToken = response.access_token || response.data.access_token;
                setToken(accessToken);

                try {
                    const user = await authApi.getMe();
                    setUser(user);
                } catch (err) {
                    console.error("Erreur lors de la récupération du profil:", err);
                }

                router.push('/dashboard');
            } else {
                setError("Une erreur est survenue (pas de token reçu).");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Une erreur est survenue lors de la création du compte.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isPending = isSubmitting || registerMutation.isPending;

    return (
        <div className="w-full max-w-[400px] space-y-8 text-center overflow-hidden">
            <div className="flex flex-col items-center space-y-6">
                <div className="p-3 dark:border-slate-800">
                    <Logo width={160} height={160} />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Rejoindre Sharaco</h1>
                    <p className="text-zinc-500 text-sm font-medium">
                        Créez votre compte pour commencer.
                    </p>
                </div>
            </div>

            <div className="relative">
                {step === 'email' ? (
                    <div key="email-step" className="space-y-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full cursor-pointer h-12 bg-zinc-900/50 border-zinc-800 text-white hover:bg-zinc-800/50 hover:text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                            onClick={() => {
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
                                className="h-12 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-sky-500 focus:border-sky-500 rounded-xl"
                            />
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm font-medium">{error}</div>
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

                        <p className="text-zinc-500 text-sm font-medium pt-4">
                            Vous avez déjà un compte ?{" "}
                            <Link href="/login" className="text-[#2563EB] hover:text-blue-400 font-bold underline-offset-4 hover:underline">
                                Connectez-vous
                            </Link>
                        </p>
                    </div>
                ) : (
                    <div key="details-step" className="animate-in slide-in-from-right duration-300">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-left">
                                {error && (
                                    <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-500 text-left mb-4">
                                        {error}
                                    </div>
                                )}

                                <div className="flex items-center space-x-2 text-sm text-zinc-400 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!oauthToken) setStep('email');
                                        }}
                                        className={`hover:text-white transition-colors ${oauthToken ? 'cursor-not-allowed opacity-50' : ''}`}
                                        disabled={!!oauthToken}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="font-medium truncate">{email}</span>
                                    {oauthToken && <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full">Google</span>}
                                </div>

                                <FormField
                                    control={form.control}
                                    name="full_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label className="text-zinc-400 text-xs tracking-widest font-bold">Nom complet</Label>
                                            <FormControl>
                                                <Input
                                                    placeholder="Entrez votre nom"
                                                    className="h-12 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-[#2563EB] focus:border-[#2563EB] rounded-xl"
                                                    disabled={isPending}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="company_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label className="text-zinc-400 text-xs tracking-widest font-bold">Entreprise (Optionnel)</Label>
                                            <FormControl>
                                                <Input
                                                    placeholder="Sharaco Inc."
                                                    className="h-12 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-[#2563EB] focus:border-[#2563EB] rounded-xl"
                                                    disabled={isPending}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs" />
                                        </FormItem>
                                    )}
                                />

                                {/* ✅ NOUVEAU CHAMP TÉLÉPHONE AVEC INDICATIF PAYS */}
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label className="text-zinc-400 text-xs tracking-widest font-bold">
                                                Numéro de téléphone
                                            </Label>
                                            <FormControl>
                                                <PhoneInput
                                                    value={field.value || ''}
                                                    onChange={(phone) => field.onChange(phone)}
                                                    defaultCountry="fr"
                                                    disabled={isPending}
                                                    className="flex w-full "
                                                    inputClassName="!w-full !flex-1 !bg-zinc-900/50 !border-zinc-800 !border-l-0 !text-white !h-12 !rounded-r-xl !placeholder:text-zinc-600 focus:!ring-[#2563EB] focus:!border-[#2563EB] focus:!border-l focus:!border-l-[#2563EB]"
                                                    countrySelectClassName="!bg-zinc-900/50 !border-zinc-800 !text-white !h-12 !rounded-l-xl"

                                                    countrySelectButtonClassName="!bg-zinc-900/50 !border-zinc-800 !h-12 !rounded-l-xl hover:!bg-zinc-800"
                                                    dialCodeClassName="!text-zinc-400"
                                                    placeholder="Entrez votre numéro de téléphone"
                                                    // Valeur renvoyée au format E.164 (ex: "+33612345678")
                                                    inputProps={{
                                                        name: 'phone',
                                                        autoComplete: 'tel',
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs" />
                                        </FormItem>
                                    )}
                                />

                                {!oauthToken && (
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between mt-2 mb-1">
                                                    <Label className="text-zinc-400 text-xs tracking-widest font-bold">Mot de passe</Label>
                                                    <button
                                                        type="button"
                                                        className="text-xs text-[#2563EB] cursor-pointer hover:text-blue-400 font-bold transition-colors"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? 'Masquer' : 'Afficher'}
                                                    </button>
                                                </div>
                                                <FormControl>
                                                    <Input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="Entrez votre mot de passe"
                                                        className="h-12 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-[#2563EB] focus:border-[#2563EB] rounded-xl"
                                                        autoComplete="new-password"
                                                        disabled={isPending}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-500 text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <Button
                                    type="submit"
                                    className="w-full cursor-pointer h-12 bg-[#2563EB] hover:bg-[#2563EB]/80 text-white font-bold rounded-xl transition-all mt-4"
                                    disabled={registerMutation.isPending}
                                >
                                    {registerMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Création en cours...
                                        </>
                                    ) : (
                                        'Créer mon compte'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </div>
                )}
            </div>
        </div>
    );
}