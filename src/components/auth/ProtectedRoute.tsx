import { Navigate, Outlet, useLocation } from 'react-router-dom'; // <-- Importez Outlet
import { useAuth } from '../../hooks/useAuth';
import { FiLoader } from 'react-icons/fi';

export default function ProtectedRoute() {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    // 1. Pendant la vérification, on affiche un loader
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <FiLoader className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    // 2. Si l'utilisateur est connecté, on rend le composant <Outlet />
    //    C'est <Outlet /> qui se chargera d'afficher la bonne route enfant.
    if (user) {
        return <Outlet />;
    }

    // 3. Si la vérification est terminée et qu'il n'y a pas d'utilisateur, on redirige
    return <Navigate to="/login" state={{ from: location }} replace />;
}
