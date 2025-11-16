import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.ts";
import apiClient from "../services/api.ts";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import {jwtDecode} from "jwt-decode";

interface DecodedToken {
    role: 'STUDENT' | 'TEACHER';
}

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const registrationSuccess = new URLSearchParams(location.search).get('registration') === 'success';

    const GOOGLE_AUTH_URL = 'http://localhost:8080/oauth2/authorization/google';

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiClient.post('/auth/login', { email, password });
            const { token } = response.data;
            login(token);
            const decodedToken = jwtDecode<DecodedToken>(token);
            if (decodedToken.role === 'TEACHER') {
                navigate('/teacher-dashboard', { replace: true });
            } else if (decodedToken.role === 'STUDENT') {
                navigate('/student-dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (apiError: unknown) {
            console.error("Erreur lors de la connexion :", apiError);
            if (axios.isAxiosError(apiError) && apiError.response) {
                const data = apiError.response.data as any;
                const serverMessage = typeof data === 'string' ? data : (data?.message || data?.detail);
                setError(serverMessage || "Email ou mot de passe incorrect.");
            } else {
                setError("Une erreur inattendue est survenue.");
            }
            setIsLoading(false);
        }
    };

    return (
        // --- MISE À JOUR DU STYLE ---
        <div className="flex min-h-screen items-center justify-center bg-orange-50 px-4 py-12">
            <div className="w-full max-w-md space-y-8">

                <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-stone-800">
                            Heureux de vous revoir !
                        </h1>
                        <p className="mt-2 text-stone-600">
                            Connectez-vous pour continuer.
                        </p>
                    </div>

                    {registrationSuccess && (
                        <div className="mt-6 p-4 text-sm bg-green-100 text-green-800 rounded-lg">
                            Inscription réussie ! Vous pouvez maintenant vous connecter.
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 p-4 text-sm bg-rose-100 text-rose-800 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="w-full appearance-none rounded-md border border-stone-300 px-3 py-3 text-stone-900 placeholder-stone-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                                placeholder="Adresse e-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="sr-only">Mot de passe</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="w-full appearance-none rounded-md border border-stone-300 px-3 py-3 text-stone-900 placeholder-stone-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-orange-600 py-3 px-4 text-base font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-orange-300 transition-colors"
                        >
                            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                        </button>
                    </form>

                    <div className="my-6 flex items-center">
                        <div className="flex-grow border-t border-stone-300"></div>
                        <span className="mx-4 flex-shrink text-sm text-stone-500">OU</span>
                        <div className="flex-grow border-t border-stone-300"></div>
                    </div>

                    <a href={GOOGLE_AUTH_URL}
                       className="group flex w-full items-center justify-center gap-3 rounded-md border border-stone-300 bg-white py-3 px-4 text-base font-semibold text-stone-700 transition-colors hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
                    >
                        <FcGoogle className="h-6 w-6" />
                        Continuer avec Google
                    </a>

                </div>

                <p className="text-center text-sm text-stone-600">
                    Pas encore de compte ?{' '}
                    <Link to="/register" className="font-medium text-orange-600 hover:text-orange-500">
                        Inscrivez-vous gratuitement
                    </Link>
                </p>

            </div>
        </div>
        // --- FIN MISE À JOUR ---
    );
}
