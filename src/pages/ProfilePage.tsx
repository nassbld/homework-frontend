import {useState, useEffect} from 'react';
import {useAuth} from '../hooks/useAuth';
import {FiUser, FiMail, FiBriefcase, FiLoader, FiEdit3, FiSave, FiAlertCircle} from 'react-icons/fi';
import apiClient from "../services/api.ts";
import ToastNotification from "../components/ToastNotification.tsx";

interface ProfileFormData {
    firstName: string;
    lastName: string;
    bio: string;
}

export default function ProfilePage() {
    const {user, updateUser} = useAuth();

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
            <div className="flex min-h-screen flex-col items-center justify-center bg-orange-50">
                <FiLoader className="h-10 w-10 animate-spin text-orange-500"/>
                <p className="mt-4 text-stone-600">Chargement du profil...</p>
            </div>
        );
    }

    const formattedRole = user.role.charAt(0) + user.role.slice(1).toLowerCase();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
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

            <div className="min-h-screen bg-orange-50 py-12 px-4">
                <main className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div
                                    className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center ring-4 ring-orange-200">
                                    <FiUser className="h-10 w-10 text-orange-600"/>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-extrabold text-stone-800">
                                        {isEditing ? 'Modifier mon profil' : 'Mon Profil'}
                                    </h1>
                                    {!isEditing &&
                                        <p className="text-lg text-stone-600">{user.firstName} {user.lastName}</p>}
                                </div>
                            </div>

                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)}
                                        className="mt-4 sm:mt-0 flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-2 px-4 rounded-lg transition">
                                    <FiEdit3 className="h-4 w-4"/> Modifier
                                </button>
                            ) : null}
                        </div>

                        {error && (
                            <div
                                className="bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-lg p-4 mb-6 flex items-center gap-3">
                                <FiAlertCircle className="h-5 w-5 flex-shrink-0"/>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* --- Champs Prénom et Nom (éditables) --- */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <InfoField label="Prénom" name="firstName" value={formData.firstName}
                                           isEditing={isEditing} onChange={handleInputChange}/>
                                <InfoField label="Nom" name="lastName" value={formData.lastName} isEditing={isEditing}
                                           onChange={handleInputChange}/>
                            </div>

                            {/* --- Champ Email (non éditable) --- */}
                            <InfoField label="Email" value={user.email} icon={FiMail}/>

                            {/* --- Champ Rôle (non éditable) --- */}
                            <InfoField label="Rôle" value={formattedRole} icon={FiBriefcase}/>

                            {/* --- DIFFÉRENCE STUDENT / TEACHER --- */}
                            {user.role === 'TEACHER' && (
                                <div className="pt-4 border-t border-stone-200">
                                    <h2 className="font-semibold text-stone-700 mb-2">Profil Formateur</h2>
                                    <InfoField
                                        label="Biographie"
                                        name="bio"
                                        value={formData.bio}
                                        isEditing={isEditing}
                                        onChange={handleInputChange}
                                        isTextarea={true}
                                        placeholder="Présentez-vous, votre parcours, et ce qui vous passionne..."
                                    />
                                </div>
                            )}

                            {/* Boutons de sauvegarde / annulation */}
                            {isEditing && (
                                <div className="flex justify-end gap-4 pt-6 border-t border-stone-200">
                                    <button onClick={handleCancel} disabled={isSaving}
                                            className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-2 px-4 rounded-lg">
                                        Annuler
                                    </button>
                                    <button onClick={handleSaveChanges}
                                            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg">
                                        <FiSave className="h-5 w-5"/> Sauvegarder
                                    </button>
                                </div>
                            )}
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

function InfoField({label, value, name, isEditing, isTextarea, icon: Icon, onChange, placeholder}: InfoFieldProps) {
    return (
        <div>
            <label className="block text-sm text-stone-500 mb-1">{label}</label>
            {isEditing ? (
                isTextarea ? (
                    <textarea
                        name={name}
                        value={value}
                        onChange={onChange}
                        rows={4}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 border rounded-lg bg-white border-stone-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                    />
                ) : (
                    <input
                        type="text"
                        name={name}
                        value={value}
                        onChange={onChange}
                        className="w-full px-3 py-2 border rounded-lg bg-white border-stone-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                    />
                )
            ) : (
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-5 w-5 text-stone-400"/>}
                    <p className="text-lg font-semibold text-stone-800">{value || 'Non renseigné'}</p>
                </div>
            )}
        </div>
    );
}

