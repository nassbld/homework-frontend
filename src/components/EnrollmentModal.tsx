import { useState } from 'react';
import apiClient from '../services/api';
import type { Course } from '../types';
import { FiCheckCircle, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface EnrollmentModalProps {
    course: Course | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EnrollmentModal({ course, isOpen, onClose, onSuccess }: EnrollmentModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'confirmation' | 'success'>('confirmation');

    if (!isOpen || !course) return null;

    const handleEnroll = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            await apiClient.post('/api/enrollments', { courseId: course.id });
            setStep('success');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Une erreur est survenue lors de l'inscription.";
            setError(errorMessage);
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setTimeout(() => {
            setIsSubmitting(false);
            setError(null);
            setStep('confirmation');
            onClose();
        }, 300);
    };

    const handleSuccessAndClose = () => {
        onSuccess();
        handleClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={handleClose}>
                    <motion.div
                        className="bg-white rounded-xl shadow-2xl max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                    >
                        {/* --- MISE À JOUR DU STYLE --- */}
                        {step === 'confirmation' && (
                            <>
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-stone-800">Confirmer l'inscription</h2>
                                    <p className="mt-2 text-stone-600">Vous êtes sur le point de vous inscrire au cours suivant :</p>

                                    <div className="mt-4 bg-stone-50 p-4 rounded-lg border border-stone-200">
                                        <h3 className="font-semibold text-stone-800">{course.title}</h3>
                                        <p className="text-sm text-stone-500">Par {course.teacher.firstName} {course.teacher.lastName}</p>
                                        <p className="mt-2 text-2xl font-bold text-stone-800">{course.pricePerHour}{'\u20AC'}</p>
                                    </div>

                                    {error && (
                                        <div className="mt-4 bg-rose-50 text-rose-700 text-sm p-3 rounded-lg flex items-start gap-2">
                                            <FiAlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3 p-4 bg-stone-50 rounded-b-xl border-t border-stone-200">
                                    <button onClick={handleClose} className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-100">
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleEnroll}
                                        disabled={isSubmitting}
                                        className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                                    >
                                        {isSubmitting ? <FiLoader className="w-5 h-5 animate-spin mr-2" /> : null}
                                        {isSubmitting ? 'Inscription...' : 'Confirmer'}
                                    </button>
                                </div>
                            </>
                        )}

                        {step === 'success' && (
                            <div className="p-8 text-center">
                                <FiCheckCircle className="mx-auto h-16 w-16 text-green-500" />
                                <h2 className="mt-4 text-2xl font-bold text-stone-800">Inscription réussie !</h2>
                                <p className="mt-2 text-stone-600">
                                    Vous pouvez retrouver ce cours dans votre tableau de bord.
                                </p>
                                <button
                                    onClick={handleSuccessAndClose}
                                    className="mt-6 w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                                >
                                    Fermer
                                </button>
                            </div>
                        )}
                        {/* --- FIN MISE À JOUR --- */}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
