import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../services/api';
import { FiMapPin, FiUser, FiCalendar, FiUsers, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { CATEGORY_IMAGES, type Course } from '../types';
import EnrollmentModal from '../components/EnrollmentModal.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import ToastNotification from '../components/ToastNotification.tsx';
import {startOrGetConversation} from "../services/chatApi.ts";

export default function CourseDetailPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        const fetchCourse = async () => {
            if (!courseId) return;
            setIsLoading(true);
            try {
                const response = await apiClient.get<Course>(`/courses/${courseId}`);
                setCourse(response.data);
            } catch (err) {
                setError('Impossible de charger les détails du cours.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    useEffect(() => {
        if (user?.role === 'STUDENT' && course) {
            apiClient
                .get('/enrollments/my-courses')
                .then((response) => {
                    const myEnrollments = response.data;
                    const alreadyEnrolled = myEnrollments.some((enrollment: any) => enrollment.course.id === course.id);
                    setIsEnrolled(alreadyEnrolled);
                })
                .catch((e) => console.error(e));
        }
    }, [user, course]);

    const handleEnrollSuccess = () => {
        setIsEnrolled(true);
        setToastMessage('Inscription réussie !');
        setShowSuccessToast(true);
    };

    const contactTeacher = async () => {
        if (!course) return;
        if (!user) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        try {
            const { conversationId } = await startOrGetConversation(course.teacher.id);
            setToastMessage('Conversation ouverte, redirection...');
            setShowSuccessToast(true);
            navigate('/chat', { state: { openConversationId: conversationId } });
        } catch (e) {
            setToastMessage("Impossible d'ouvrir la conversation");
            setShowSuccessToast(true);
            console.error(e);
        }
    };

    if (isLoading) {
        return <div className="text-center py-20 text-stone-600">Chargement du cours...</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-rose-600">{error}</div>;
    }

    if (!course) {
        return <div className="text-center py-20">Cours non trouvé.</div>;
    }

    const imageUrl = CATEGORY_IMAGES[course.category] || '/images/default-course.jpg';

    const formattedDate = new Date(course.createdAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <>
            <ToastNotification
                show={showSuccessToast}
                message={toastMessage || 'Action réussie'}
                onClose={() => setShowSuccessToast(false)}
            />

            <div className="bg-orange-50 min-h-screen">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    {/* --- Image d'en-tête --- */}
                    <div className="h-64 md:h-96 bg-stone-300">
                        <img
                            src={imageUrl}
                            alt={`Illustration pour la catégorie ${course.category}`}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="relative -mt-16 md:-mt-24">
                            <div className="bg-white p-6 mb-4 md:p-10 rounded-xl shadow-2xl lg:grid lg:grid-cols-3 lg:gap-12">
                                {/* --- Colonne Principale (Contenu) --- */}
                                <div className="lg:col-span-2">
                                    <p className="text-sm font-bold text-orange-600 uppercase tracking-wider">{course.category}</p>
                                    <h1 className="mt-2 text-3xl md:text-5xl font-extrabold text-stone-800">{course.title}</h1>

                                    <div className="mt-6 border-t border-stone-200 pt-6">
                                        <h2 className="text-2xl font-bold text-stone-800 mb-4">Description du cours</h2>
                                        <div className="prose prose-lg text-stone-600 max-w-none">
                                            <p>{course.description}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* --- Colonne Latérale (Infos clés et CTA) --- */}
                                <div className="mt-8 lg:mt-0">
                                    <div className="bg-stone-100 rounded-lg p-6">
                                        <h2 className="text-3xl font-bold text-center text-stone-800">
                                            {course.pricePerHour}
                                            {'\u20AC'}
                                            <span className="text-lg font-medium text-stone-500">/heure</span>
                                        </h2>

                                        <div className="mt-6 space-y-4">
                                            {user?.role === 'STUDENT' &&
                                                (isEnrolled ? (
                                                    <button
                                                        onClick={() => navigate('/student-dashboard')}
                                                        className="w-full rounded-lg bg-green-600 px-6 py-3 text-lg font-semibold text-white shadow-md hover:bg-green-700 transition"
                                                    >
                                                        Aller à mes cours
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => setIsModalOpen(true)}
                                                            className="w-full rounded-lg bg-orange-600 px-6 py-3 text-lg font-semibold text-white shadow-md hover:bg-orange-700 transition-transform transform hover:scale-105"
                                                        >
                                                            S'inscrire à ce cours
                                                        </button>
                                                        <button
                                                            onClick={contactTeacher}
                                                            className="w-full rounded-lg bg-transparent px-6 py-3 text-lg font-semibold text-orange-600 ring-2 ring-orange-600 hover:bg-orange-50 transition"
                                                        >
                                                            Contacter le formateur
                                                        </button>
                                                    </>
                                                ))}

                                            {!user && (
                                                <>
                                                    <button
                                                        onClick={() => navigate('/login')}
                                                        className="w-full rounded-lg bg-orange-600 px-6 py-3 text-lg font-semibold text-white shadow-md hover:bg-orange-700 transition-transform transform hover:scale-105"
                                                    >
                                                        Se connecter pour s'inscrire
                                                    </button>
                                                    <button
                                                        onClick={() => navigate('/login')}
                                                        className="w-full rounded-lg bg-transparent px-6 py-3 text-lg font-semibold text-orange-600 ring-2 ring-orange-600 hover:bg-orange-50 transition"
                                                    >
                                                        Se connecter pour contacter le formateur
                                                    </button>
                                                </>
                                            )}

                                            {user?.role === 'TEACHER' && (
                                                <div className="text-center text-sm text-stone-600 p-3 bg-stone-200 rounded-md">
                                                    Vous êtes connecté en tant que formateur.
                                                </div>
                                            )}
                                        </div>

                                        <ul className="mt-6 space-y-4 text-stone-700">
                                            {course.duration && (
                                                <li className="flex items-center gap-3">
                                                    <FiClock className="h-5 w-5 text-stone-400" />
                                                    <span>
                            Durée : <strong>{course.duration} minutes</strong>
                          </span>
                                                </li>
                                            )}

                                            {course.maxStudents && (
                                                <li className="flex items-center gap-3">
                                                    <FiUsers className="h-5 w-5 text-stone-400" />
                                                    <span>
                            {course.enrolledStudentsCount >= course.maxStudents ? (
                                <strong className="text-rose-600">Complet</strong>
                            ) : (
                                <>
                                    <strong>{course.maxStudents - course.enrolledStudentsCount}</strong>
                                    &nbsp;places restantes sur {course.maxStudents}
                                </>
                            )}
                          </span>
                                                </li>
                                            )}

                                            <li className="flex items-center gap-3">
                                                <FiUser className="h-5 w-5 text-stone-400" />
                                                <span>
                          Proposé par <strong>{course.teacher.firstName} {course.teacher.lastName}</strong>
                        </span>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <FiMapPin className="h-5 w-5 text-stone-400" />
                                                <span>{course.city}</span>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <FiCalendar className="h-5 w-5 text-stone-400" />
                                                <span>Publié le {formattedDate}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                {/* Fin colonne latérale */}
                            </div>
                        </div>
                    </div>
                    {/* --- FIN MISE À JOUR --- */}
                </motion.div>

                <EnrollmentModal
                    course={course}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleEnrollSuccess}
                />
            </div>
        </>
    );
}
