import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
    FiMail,
    FiBriefcase,
    FiLoader,
    FiEdit3,
    FiSave,
    FiAlertCircle,
    FiShield,
    FiMessageCircle
} from 'react-icons/fi';
import apiClient from "../services/api.ts";
import ToastNotification from "../components/ToastNotification.tsx";

interface ProfileFormData {
    firstName: string;
    lastName: string;
    bio: string;
}

export default function ProfilePage() {
    const { user, updateUser } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<ProfileFormData>({
        firstName: '',
        lastName: '',
        bio: ''
    });
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                bio: user.bio || ''
            });
        }
    }, [user]);

    if (!user) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-sand-50">
                <FiLoader className="h-10 w-10 animate-spin text-brand-500" />
                <p className="mt-4 text-charcoal-600">Chargement du profil...</p>
            </div>
        );
    }

    const formattedRole = user.role.charAt(0) + user.role.slice(1).toLowerCase();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const response = await apiClient.put('/profile/me', formData);
            updateUser(response.data);
            setIsEditing(false);
            setShowSuccessToast(true);
        } catch (err: any) {
            const apiError = err.response?.data?.message || "Une erreur est survenue lors de la sauvegarde.";
            setError(apiError);
            console.error("Erreur de sauvegarde:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                bio: user.bio || ''
            });
        }
        setIsEditing(false);
        setError(null);
    };

    return (
        <>
            <ToastNotification
                show={showSuccessToast}
                message="Profil sauvegardé avec succès !"
                onClose={() => setShowSuccessToast(false)}
            />

            <div className="min-h-screen bg-sand-50">
                <section className="relative overflow-hidden bg-hero-gradient px-6 py-16">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-20 -left-16 h-64 w-64 rounded-full bg-brand-100 opacity-50 blur-3xl" />
                        <div className="absolute -bottom-24 -right-10 h-80 w-80 rounded-full bg-sand-200 opacity-60 blur-3xl" />
                    </div>

                    <div className="relative container mx-auto flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/80 font-display text-3xl text-brand-600 shadow-card">
                                {user.firstName.charAt(0)}
                                {user.lastName.charAt(0)}
                            </div>
                            <div>
                                <p className="pill bg-white/80 text-brand-600 backdrop-blur">Profil {formattedRole}</p>
                                <h1 className="mt-3 font-display text-3xl text-charcoal-900 md:text-4xl">
                                    {user.firstName} {user.lastName}
                                </h1>
                                <p className="text-charcoal-700">
                                    Gérez vos informations personnelles et votre présence sur HomeWork.
                                </p>
                            </div>
                        </div>

        <div className="flex flex-col gap-3 text-sm text-charcoal-600 md:flex-row md:items-center md:gap-6">
            <div className="pill bg-white/80">
                <FiShield className="mr-2 inline h-4 w-4 text-brand-500" />
                Compte sécurisé
            </div>
            <div className="pill bg-white/80">
                <FiMessageCircle className="mr-2 inline h-4 w-4 text-brand-500" />
                Support : support@homework.fr
            </div>
        </div>
                    </div>
                </section>

                <main className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
                        <div className="card-elevated p-8">
                            <div className="mb-8 flex flex-col gap-4 border-b border-sand-200 pb-6 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.3em] text-brand-500">Informations</p>
                                    <h2 className="font-display text-2xl text-charcoal-900">
                                        {isEditing ? 'Modifier mon profil' : 'Mes informations personnelles'}
                                    </h2>
                                </div>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="btn-secondary inline-flex items-center gap-2"
                                    >
                                        <FiEdit3 className="h-4 w-4" />
                                        Modifier
                                    </button>
                                )}
                            </div>

                            {error && (
                                <div className="mb-6 flex items-center gap-3 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    <FiAlertCircle className="h-5 w-5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <InfoField
                                        label="Prénom"
                                        name="firstName"
                                        value={formData.firstName}
                                        isEditing={isEditing}
                                        onChange={handleInputChange}
                                    />
                                    <InfoField
                                        label="Nom"
                                        name="lastName"
                                        value={formData.lastName}
                                        isEditing={isEditing}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <InfoField label="Email" value={user.email} icon={FiMail} />
                                <InfoField label="Rôle" value={formattedRole} icon={FiBriefcase} />

                                {user.role === 'TEACHER' && (
                                    <div className="rounded-3xl bg-sand-50/80 p-4">
                                        <p className="text-sm font-semibold text-charcoal-600">Profil Formateur</p>
                                        <InfoField
                                            label="Biographie"
                                            name="bio"
                                            value={formData.bio}
                                            isEditing={isEditing}
                                            onChange={handleInputChange}
                                            isTextarea
                                            placeholder="Présentez-vous, votre parcours, et ce qui vous passionne..."
                                        />
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="flex flex-col gap-3 border-t border-sand-200 pt-6 sm:flex-row sm:justify-end">
                                        <button
                                            onClick={handleCancel}
                                            disabled={isSaving}
                                            className="btn-secondary w-full sm:w-auto"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleSaveChanges}
                                            disabled={isSaving}
                                            className="btn-primary w-full sm:w-auto"
                                        >
                                            <FiSave className="h-4 w-4" />
                                            {isSaving ? 'Enregistrement…' : 'Sauvegarder'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="card-elevated space-y-4 p-6 text-sm text-charcoal-700">
                                <p className="font-display text-lg text-charcoal-900">Conseils pour un profil complet</p>
                                <ul className="space-y-3">
                                    <li>• Utilise ta vraie photo et une biographie engageante si tu es formateur.</li>
                                    <li>• Reste joignable via l’adresse mail affichée.</li>
                                    <li>• Mets à jour tes informations si tu changes de ville.</li>
                                </ul>
                            </div>
                            <div className="card-elevated space-y-4 p-6 text-sm text-charcoal-700">
                                <p className="font-display text-lg text-charcoal-900">Support & compte</p>
                                <p>Besoin d’aide ? Contacte notre équipe par email ou via la messagerie intégrée.</p>
                                <div className="rounded-3xl bg-sand-100/80 px-4 py-3 text-xs text-charcoal-600">
                                    Nous respectons les normes de sécurité et gardons tes données confidentielles.
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}


// --- SOUS-COMPOSANT POUR LA LISIBILITÉ ---
interface InfoFieldProps {
    label: string;
    value: string;
    name?: string;
    isEditing?: boolean;
    isTextarea?: boolean;
    icon?: React.ElementType;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
}

function InfoField({ label, value, name, isEditing, isTextarea, icon: Icon, onChange, placeholder }: InfoFieldProps) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-charcoal-500">{label}</label>
            {isEditing ? (
                isTextarea ? (
                    <textarea
                        name={name}
                        value={value}
                        onChange={onChange}
                        rows={4}
                        placeholder={placeholder}
                        className="w-full rounded-2xl border border-sand-200 bg-white px-4 py-3 text-charcoal-900 shadow-inner focus:border-brand-200 focus:ring-2 focus:ring-brand-200"
                    />
                ) : (
                    <input
                        type="text"
                        name={name}
                        value={value}
                        onChange={onChange}
                        className="w-full rounded-2xl border border-sand-200 bg-white px-4 py-3 text-charcoal-900 shadow-inner focus:border-brand-200 focus:ring-2 focus:ring-brand-200"
                    />
                )
            ) : (
                <div className="flex items-center gap-3 rounded-2xl bg-sand-100/70 px-4 py-3 text-charcoal-900">
                    {Icon && <Icon className="h-5 w-5 text-brand-500" />}
                    <p className="font-semibold">{value || 'Non renseigné'}</p>
                </div>
            )}
        </div>
    );
}

