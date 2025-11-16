import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from "../services/api.ts";
import axios from "axios";

export default function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const userData = { firstName, lastName, email, password, role };

        try {
            const response = await apiClient.post('/auth/register', userData);
            console.log("Réponse de l'API :", response.data);
            // Show success message about email verification
            navigate('/register-success', { state: { email } });
        } catch (apiError: unknown) {
            console.error("Erreur lors de l'inscription :", apiError);
            if (axios.isAxiosError(apiError) && apiError.response) {
                setError(apiError.response.data.message || "L'inscription a échoué. Veuillez vérifier vos informations.");
            } else {
                setError("Une erreur inattendue est survenue.");
            }
        } finally {
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
                            Créer votre compte
                        </h1>
                        <p className="mt-2 text-stone-600">
                            Rejoignez la communauté HomeWork dès aujourd'hui.
                        </p>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 text-sm bg-rose-100 text-rose-800 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full">
                                <label htmlFor="firstName" className="sr-only">Prénom</label>
                                <input id="firstName" type="text" required
                                       className="w-full appearance-none rounded-md border border-stone-300 px-3 py-3 text-stone-900 placeholder-stone-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                                       placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            </div>
                            <div className="w-full">
                                <label htmlFor="lastName" className="sr-only">Nom</label>
                                <input id="lastName" type="text" required
                                       className="w-full appearance-none rounded-md border border-stone-300 px-3 py-3 text-stone-900 placeholder-stone-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                                       placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input id="email" type="email" autoComplete="email" required
                                   className="w-full appearance-none rounded-md border border-stone-300 px-3 py-3 text-stone-900 placeholder-stone-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                                   placeholder="Adresse e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Mot de passe</label>
                            <input id="password" type="password" autoComplete="new-password" required
                                   className="w-full appearance-none rounded-md border border-stone-300 px-3 py-3 text-stone-900 placeholder-stone-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                                   placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <fieldset>
                            <legend className="mb-2 text-sm font-medium text-stone-900">Je suis un :</legend>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`flex cursor-pointer items-center justify-center rounded-lg border p-4 text-center text-sm font-medium transition-colors ${role === 'STUDENT' ? 'border-orange-600 bg-orange-50 ring-2 ring-orange-500 text-orange-900' : 'border-stone-300 bg-white text-stone-700'}`}>
                                    <input type="radio" name="role" value="STUDENT" className="sr-only"
                                           checked={role === 'STUDENT'} onChange={() => setRole('STUDENT')} />
                                    Élève
                                </label>
                                <label className={`flex cursor-pointer items-center justify-center rounded-lg border p-4 text-center text-sm font-medium transition-colors ${role === 'TEACHER' ? 'border-orange-600 bg-orange-50 ring-2 ring-orange-500 text-orange-900' : 'border-stone-300 bg-white text-stone-700'}`}>
                                    <input type="radio" name="role" value="TEACHER" className="sr-only"
                                           checked={role === 'TEACHER'} onChange={() => setRole('TEACHER')} />
                                    Formateur
                                </label>
                            </div>
                        </fieldset>

                        <button type="submit" disabled={isLoading}
                                className="group relative flex w-full justify-center rounded-md border border-transparent bg-orange-600 py-3 px-4 text-base font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-orange-300 transition-colors">
                            {isLoading ? 'Inscription en cours...' : "Créer mon compte"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-stone-600">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
                        Connectez-vous
                    </Link>
                </p>
            </div>
        </div>
        // --- FIN MISE À JOUR ---
    );
}
