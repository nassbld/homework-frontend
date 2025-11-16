import {Link, NavLink, useNavigate} from 'react-router-dom';
import {useMemo, useState} from 'react';
import {useAuth} from "../hooks/useAuth.ts";
import {FiMenu, FiX, FiMessageCircle} from 'react-icons/fi';

const primaryButtonClasses = "btn-primary px-5 py-2 text-sm sm:text-base";
const secondaryButtonClasses = "btn-secondary px-5 py-2 text-sm sm:text-base";

const navLinkClasses = ({isActive}: { isActive: boolean }) =>
    `text-sm font-semibold transition-colors duration-200 ease-soft-in-out ${
        isActive
            ? 'text-brand-600'
            : 'text-charcoal-700 hover:text-brand-500'
    }`;

export default function Navbar() {
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const userInitials = useMemo(() => {
        if (!user) return null;
        return `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase();
    }, [user]);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        navigate('/');
    };

    const closeMenu = () => setIsMenuOpen(false);

    const dashboardLink = user?.role === 'TEACHER'
        ? {to: '/teacher-dashboard', label: 'Tableau de bord'}
        : user?.role === 'STUDENT'
            ? {to: '/student-dashboard', label: 'Mes cours'}
            : null;

    const navigationLinks = [
        {to: '/', label: 'Accueil'},
        {to: '/courses', label: 'Parcourir les cours'},
        ...(user ? [{to: '/chat', label: 'Messagerie', icon: <FiMessageCircle className="h-4 w-4"/>}] : []),
        ...(dashboardLink ? [dashboardLink] : []),
    ];

    return (
        <header
            className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_10px_30px_-28px_rgba(20,10,0,0.65)]">
            <nav className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
                    <img src="/images/logo.png" alt="Logo HomeWork" className="h-10 w-auto"/>
                    <div className="flex flex-col">
                        <span className="font-display text-2xl leading-snug text-charcoal-900">HomeWork</span>
                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-brand-500">
                            savoir-faire humains
                        </span>
                    </div>
                </Link>

                <div className="hidden items-center gap-8 lg:flex">
                    <div className="flex items-center gap-6">
                        {navigationLinks.map((link) => (
                            <NavLink key={link.to} to={link.to} className={navLinkClasses}>
                                <span className="flex items-center gap-2">
                                    {link.icon}
                                    {link.label}
                                </span>
                            </NavLink>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <NavLink to="/profile" className={navLinkClasses}>
                                    Mon profil
                                </NavLink>
                                <button onClick={handleLogout} className={secondaryButtonClasses}>
                                    Déconnexion
                                </button>
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-600">
                                    {userInitials}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className={secondaryButtonClasses}>Connexion</Link>
                                <Link to="/register" className={primaryButtonClasses}>S'inscrire</Link>
                            </>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-2xl text-charcoal-800 shadow-card transition hover:bg-white md:hidden"
                    aria-label="Basculer le menu"
                    aria-expanded={isMenuOpen}
                >
                    {isMenuOpen ? <FiX/> : <FiMenu/>}
                </button>
            </nav>

            {/* Menu mobile */}
            <div
                className={`fixed inset-x-0 top-[72px] origin-top transform bg-white/95 shadow-card transition-all duration-300 ease-soft-in-out md:hidden ${
                    isMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
                }`}
            >
                <div className="container mx-auto flex flex-col gap-4 px-6 py-6 text-left">
                    {navigationLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={closeMenu}
                            className={({isActive}) =>
                                `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                    isActive ? 'bg-brand-50 text-brand-600' : 'text-charcoal-700 hover:bg-brand-50 hover:text-brand-500'
                                }`
                            }
                        >
                            <span className="flex items-center gap-2">
                                //{link.icon}
                                {link.label}
                            </span>
                        </NavLink>
                    ))}

                    <div className="mt-4 flex flex-col gap-3">
                        {user ? (
                            <>
                                <NavLink
                                    to="/profile"
                                    onClick={closeMenu}
                                    className={({isActive}) =>
                                        `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                            isActive ? 'bg-brand-50 text-brand-600' : 'text-charcoal-700 hover:bg-brand-50 hover:text-brand-500'
                                        }`
                                    }
                                >
                                    Mon profil
                                </NavLink>
                                <button
                                    onClick={handleLogout}
                                    className={`${secondaryButtonClasses} w-full`}
                                >
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className={`${secondaryButtonClasses} w-full`}
                                    onClick={closeMenu}
                                >
                                    Connexion
                                </Link>
                                <Link
                                    to="/register"
                                    className={`${primaryButtonClasses} w-full`}
                                    onClick={closeMenu}
                                >
                                    S'inscrire
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
