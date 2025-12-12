import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../services/api';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('');
    const hasVerified = useRef(false); // Prevent duplicate calls

    useEffect(() => {
        const token = searchParams.get('token');
        
        if (!token) {
            setStatus('error');
            setMessage('Token de vérification manquant.');
            return;
        }

        // Prevent duplicate API calls
        if (hasVerified.current) {
            return;
        }

        const verifyEmail = async () => {
            hasVerified.current = true; // Mark as called
            
            try {
                const response = await apiClient.get(`/auth/verify-email?token=${token}`);
                setStatus('success');
                setMessage(response.data);
            } catch (error: any) {
                const errorMessage = error.response?.data || error.response?.data?.message || 'Erreur lors de la vérification de l\'email.';
                
                // If token was already used, treat as success (user is already verified)
                if (errorMessage.includes('déjà été utilisé') || errorMessage.includes('already been used')) {
                    setStatus('success');
                    setMessage('Votre email a déjà été vérifié ! Vous pouvez maintenant vous connecter.');
                } else {
                    setStatus('error');
                    setMessage(errorMessage);
                }
            }
        };

        verifyEmail();
    }, [searchParams]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-orange-50 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg text-center">
                    {status === 'verifying' && (
                        <>
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4 animate-pulse">
                                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-stone-800 mb-4">
                                Vérification en cours...
                            </h1>
                            <p className="text-stone-600">
                                Veuillez patienter pendant que nous vérifions votre email.
                            </p>
                        </>
                    )}
                    
                    {status === 'success' && (
                        <>
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-stone-800 mb-4">
                                Email vérifié !
                            </h1>
                            <p className="text-stone-600 mb-6">
                                {message}
                            </p>
                            <Link 
                                to="/login" 
                                className="inline-block w-full rounded-md border border-transparent bg-orange-600 py-3 px-4 text-base font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                            >
                                Se connecter
                            </Link>
                        </>
                    )}
                    
                    {status === 'error' && (
                        <>
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-stone-800 mb-4">
                                Erreur de vérification
                            </h1>
                            <p className="text-stone-600 mb-6">
                                {message}
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="inline-block w-full rounded-md border border-transparent bg-orange-600 py-3 px-4 text-base font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                                >
                                    Aller à la connexion
                                </button>
                                <Link 
                                    to="/register" 
                                    className="inline-block w-full rounded-md border border-stone-300 bg-white py-3 px-4 text-base font-semibold text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-colors"
                                >
                                    Créer un compte
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

