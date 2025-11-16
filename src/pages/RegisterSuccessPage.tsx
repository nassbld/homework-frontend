import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function RegisterSuccessPage() {
    const location = useLocation();
    const email = location.state?.email || '';

    return (
        <div className="flex min-h-screen items-center justify-center bg-orange-50 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    
                    <h1 className="text-3xl font-bold tracking-tight text-stone-800 mb-4">
                        Inscription réussie !
                    </h1>
                    
                    <p className="text-stone-600 mb-6">
                        Un email de vérification a été envoyé à <strong>{email}</strong>.
                    </p>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-stone-700">
                            Veuillez cliquer sur le lien dans l'email pour vérifier votre compte et commencer à utiliser HomeWork.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <p className="text-sm text-stone-600">
                            Vous n'avez pas reçu l'email ? Vérifiez votre dossier de spam ou contactez-nous.
                        </p>
                        
                        <Link 
                            to="/login" 
                            className="inline-block w-full rounded-md border border-transparent bg-orange-600 py-3 px-4 text-base font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                        >
                            Aller à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

