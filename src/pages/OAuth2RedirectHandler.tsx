import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiLoader } from 'react-icons/fi'; // Pour une icône plus moderne
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    role: 'STUDENT' | 'TEACHER';
}

export default function OAuth2RedirectHandler() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            // Si un token est présent, on met à jour le contexte
            login(token);

            // On décode le token pour la redirection intelligente
            const decodedToken = jwtDecode<DecodedToken>(token);

            if (decodedToken.role === 'TEACHER') {
                navigate('/teacher-dashboard', { replace: true });
            } else if (decodedToken.role === 'STUDENT') {
                navigate('/student-dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } else {
            // Gérer le cas d'erreur (pas de token)
            navigate('/login?error=auth_failed', { replace: true });
        }
    }, [searchParams, login, navigate]);

    return (
        // --- MISE À JOUR DU STYLE ---
        <div className="flex min-h-screen flex-col items-center justify-center bg-orange-50 text-stone-700">
            <FiLoader className="h-12 w-12 animate-spin text-orange-500" />
            <p className="mt-4 text-lg font-semibold">
                Connexion en cours, veuillez patienter...
            </p>
        </div>
        // --- FIN MISE À JOUR ---
    );
}
