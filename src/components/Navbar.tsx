import {Link, NavLink, useNavigate} from 'react-router-dom';
import {useState} from 'react';
import {useAuth} from "../hooks/useAuth.ts";
import {FiMenu, FiX, FiMessageSquare} from 'react-icons/fi'; // Ajout de FiMessageSquare

export default function Navbar() {
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        navigate('/');
    };

    // --- CLASSES DE STYLE ---
    // Utilisons une fonction pour NavLink pour gérer le style actif
    const getNavLinkClasses = ({isActive}: { isActive: boolean }) =>
        isActive
            ? "font-semibold text-[#E67E4A]" // Style quand le lien est actif
            : "font-medium text-[#4A403A] hover:text-[#3C322E] transition-colors duration-200";

    const primaryButtonClasses = "bg-[#E67E4A] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#D9703C] transition-colors";
    const secondaryButtonClasses = "font-semibold text-[#4A403A] bg-[#E8E0D5] hover:bg-[#DCD3C7] py-2 px-4 rounded-lg transition-colors";

    return (
        <header className="sticky top-0 bg-[#F5EFE6] shadow-sm z-50">
            <nav className="container mx-auto flex justify-between items-center px-6 py-3">

                <Link to="/" className="flex items-center gap-3 flex-shrink-0" onClick={() => setIsMenuOpen(false)}>
                    <img src="/images/logo.png" alt="Logo HomeWork" className="h-10 w-auto"/>
                    <span className="text-2xl font-bold text-[#4A403A]">HomeWork</span>
                </Link>

                <div className="hidden md:flex items-center space-x-8">
                    <div className="flex items-center space-x-6">
                        <NavLink to="/" className={getNavLinkClasses}>Accueil</NavLink>
                        <NavLink to="/courses" className={getNavLinkClasses}>Parcourir les cours</NavLink>

                        {user && (
                            <NavLink to="/chat" className={getNavLinkClasses}>
                                <span className="flex items-center gap-2">
                                    <FiMessageSquare/>
                                    Messagerie
                                </span>
                            </NavLink>
                        )}

                        {user?.role === 'TEACHER' && <NavLink to="/teacher-dashboard" className={getNavLinkClasses}>Tableau de bord</NavLink>}
                        {user?.role === 'STUDENT' && <NavLink to="/student-dashboard" className={getNavLinkClasses}>Tableau de bord</NavLink>}
                    </div>

                    <div className="flex items-center space-x-3">
                        {user ? (
                            <>
                                <NavLink to="/profile" className={getNavLinkClasses}>Mon Profil</NavLink>
                                <button onClick={handleLogout} className={secondaryButtonClasses}>
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className={secondaryButtonClasses}>Connexion</Link>
                                <Link to="/register" className={primaryButtonClasses}>S'inscrire</Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-2xl text-[#4A403A] p-2">
                        {isMenuOpen ? <FiX/> : <FiMenu/>}
                    </button>
                </div>
            </nav>

            {/* --- Menu Mobile --- */}
            {isMenuOpen && (
                <div className="md:hidden bg-[#F5EFE6] shadow-lg absolute top-full left-0 w-full border-t border-[#E8E0D5]">
                    <div className="flex flex-col items-center space-y-6 py-6">
                        <NavLink to="/" className={getNavLinkClasses} onClick={() => setIsMenuOpen(false)}>Accueil</NavLink>
                        <NavLink to="/courses" className={getNavLinkClasses} onClick={() => setIsMenuOpen(false)}>Parcourir les cours</NavLink>
                        {user && (
                            <NavLink to="/chat" className={getNavLinkClasses} onClick={() => setIsMenuOpen(false)}>
                                Messagerie
                            </NavLink>
                        )}

                        {user?.role === 'TEACHER' && <NavLink to="/teacher-dashboard" className={getNavLinkClasses} onClick={() => setIsMenuOpen(false)}>Tableau de bord</NavLink>}
                        {user?.role === 'STUDENT' && <NavLink to="/student-dashboard" className={getNavLinkClasses} onClick={() => setIsMenuOpen(false)}>Tableau de bord</NavLink>}

                        <div className="w-full px-8 pt-4">
                            {user ? (
                                <button onClick={handleLogout} className={`${secondaryButtonClasses} w-full text-center`}>
                                    Déconnexion
                                </button>
                            ) : (
                                <div className="flex flex-col space-y-4">
                                    <Link to="/login" className={`${secondaryButtonClasses} w-full text-center`} onClick={() => setIsMenuOpen(false)}>Connexion</Link>
                                    <Link to="/register" className={`${primaryButtonClasses} w-full text-center`} onClick={() => setIsMenuOpen(false)}>S'inscrire</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
