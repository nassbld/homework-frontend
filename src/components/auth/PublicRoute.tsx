import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiLoader } from 'react-icons/fi';

export default function PublicRoute() {
    const { user, isLoading } = useAuth();

    // 1. Pendant la vérification, on affiche un loader
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <FiLoader className="w-10 h-10 animate-spin text-orange-600" />
            </div>
        );
    }

    // 2. Si l'utilisateur est connecté, on le redirige vers la page d'accueil
    //    (ou le dashboard approprié s'il a tenté d'accéder à login/register)
    if (user) {
        return <Navigate to="/" replace />;
    }

    // 3. Si l'utilisateur n'est pas connecté, on rend le composant <Outlet /> (Login, Register...)
    return <Outlet />;
}

