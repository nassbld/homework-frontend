import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../services/api';
import {
    FiMapPin,
    FiUser,
    FiCalendar,
    FiUsers,
    FiClock,
    FiMessageCircle,
    FiInfo,
    FiShield
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { CATEGORY_IMAGES, type Course, type Enrollment } from '../types';
import EnrollmentModal from '../components/EnrollmentModal.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import ToastNotification from '../components/ToastNotification.tsx';
import { startOrGetConversation } from "../services/chatApi.ts";

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
                    const myEnrollments: Enrollment[] = response.data;
                    const alreadyEnrolled = myEnrollments.some(
                        (enrollment) =>
                            enrollment.course.id === course.id &&
                            (enrollment.status === 'ACTIVE' || enrollment.status === 'COMPLETED')
                    );
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

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0
        }).format(amount);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-sand-50">
                <div className="container mx-auto px-6 py-24">
                    <div className="mx-auto max-w-5xl space-y-10">
                        <div className="animate-pulse space-y-6">
                            <div className="h-8 w-32 rounded-full bg-sand-200" />
                            <div className="h-12 w-3/4 rounded-full bg-sand-200" />
                            <div className="h-5 w-full rounded-full bg-sand-100" />
                            <div className="h-5 w-5/6 rounded-full bg-sand-100" />
                        </div>
                        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
                            <div className="card-elevated h-72 animate-pulse bg-white/80" />
                            <div className="card-elevated h-72 animate-pulse bg-white/80" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-20 text-rose-600">{error}</div>;
    }

    if (!course) {
        return <div className="text-center py-20">Cours non trouvé.</div>;
    }

    const imageUrl = CATEGORY_IMAGES[course.category] || '/images/default-course.jpg';

    const formattedCourseDateTime = new Date(course.courseDateTime).toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <>
            <ToastNotification
                show={showSuccessToast}
                message={toastMessage || 'Action réussie'}
                onClose={() => setShowSuccessToast(false)}
            />

            <div className="min-h-screen bg-sand-50">
                <section className="relative overflow-hidden bg-hero-gradient pb-24 pt-16 sm:pb-28 sm:pt-20">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-brand-100 opacity-60 blur-3xl" />
                        <div className="absolute -bottom-24 -right-10 h-96 w-96 rounded-full bg-sand-200 opacity-70 blur-3xl" />
                    </div>

                    <div className="container relative mx-auto flex flex-col gap-12 px-6 lg:flex-row lg:items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-6 lg:w-3/5"
                        >
                            <span className="pill bg-white/80 text-brand-600 backdrop-blur">
                                {course.category}
                            </span>
                            <h1 className="font-display text-4xl leading-tight text-charcoal-900 md:text-5xl">
                                {course.title}
                            </h1>
                            <p className="max-w-2xl text-lg text-charcoal-700 md:text-xl">
                                {course.description || "Découvrez un cours unique imaginé par un formateur passionné pour progresser en toute convivialité."}
                            </p>

                            <div className="flex flex-wrap gap-3 text-sm text-charcoal-700">
                                <span className="pill bg-white/80">
                                    <FiCalendar className="mr-2 inline h-4 w-4 text-brand-500" />
                                    {formattedCourseDateTime}
                                </span>
                                {course.duration && (
                                    <span className="pill bg-white/80">
                                        <FiClock className="mr-2 inline h-4 w-4 text-brand-500" />
                                        {course.duration} minutes
                                    </span>
                                )}
                                <span className="pill bg-white/80">
                                    <FiMapPin className="mr-2 inline h-4 w-4 text-brand-500" />
                                    {course.city}
                                </span>
                                {course.maxStudents && (
                                    <span className="pill bg-white/80">
                                        <FiUsers className="mr-2 inline h-4 w-4 text-brand-500" />
                                        {course.enrolledStudentsCount >= (course.maxStudents ?? 0)
                                            ? 'Complet'
                                            : `${(course.maxStudents ?? 0) - course.enrolledStudentsCount} places restantes`}
                                    </span>
                                )}
                                        </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="relative mx-auto w-full max-w-md lg:mx-0 lg:w-2/5"
                        >
                            <div className="card-elevated overflow-hidden">
                                <img
                                    src={imageUrl}
                                    alt={`Illustration pour ${course.category}`}
                                    className="h-64 w-full object-cover"
                                />
                                <div className="space-y-6 p-6">
                                    <div className="text-center">
                                        <p className="font-display text-3xl text-brand-600">
                                            {formatCurrency(course.price)}
                                        </p>
                                        <p className="text-sm text-charcoal-600">
                                            Commission HomeWork déjà incluse
                                        </p>
                                </div>

                                    <div className="space-y-3">
                                        {user?.role === 'STUDENT' ? (
                                            isEnrolled ? (
                                                    <button
                                                        onClick={() => navigate('/student-dashboard')}
                                                    className="btn-primary w-full bg-green-600 hover:bg-green-700"
                                                    >
                                                    Accéder à mes cours
                                                    </button>
                                                ) : (
                                                <div className="space-y-3">
                                                        <button
                                                            onClick={() => setIsModalOpen(true)}
                                                        className="btn-primary w-full"
                                                        >
                                                        Réserver ma place
                                                        </button>
                                                        <button
                                                            onClick={contactTeacher}
                                                        className="btn-secondary w-full"
                                                        >
                                                            Contacter le formateur
                                                        </button>
                                                </div>
                                            )
                                        ) : (
                                            <div className="space-y-3">
                                                    <button
                                                    onClick={() => navigate('/login', { state: { from: location.pathname } })}
                                                    className="btn-primary w-full"
                                                    >
                                                        Se connecter pour s'inscrire
                                                    </button>
                                                    <button
                                                    onClick={() => navigate('/login', { state: { from: location.pathname } })}
                                                    className="btn-secondary w-full"
                                                    >
                                                        Se connecter pour contacter le formateur
                                                    </button>
                                            </div>
                                            )}

                                            {user?.role === 'TEACHER' && (
                                            <div className="rounded-3xl bg-sand-100 px-4 py-3 text-center text-sm text-charcoal-600">
                                                    Vous êtes connecté en tant que formateur.
                                                </div>
                                            )}
                                        </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section className="container mx-auto px-6 py-16 lg:py-20">
                    <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
                        <div className="card-elevated space-y-6 p-8">
                            <h2 className="font-display text-2xl text-charcoal-900">Ce que vous allez vivre</h2>
                            <p className="text-charcoal-700 leading-relaxed">
                                {course.description || `Ce cours est pensé pour offrir une immersion conviviale et humaine autour du savoir-faire ${course.category.toLowerCase()}. Venez avec votre curiosité, repartez avec de nouvelles compétences et de belles rencontres.`}
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-3xl bg-sand-100/60 p-4 text-charcoal-700">
                                    <p className="font-semibold text-charcoal-900">Matériel & lieu</p>
                                    <p className="mt-2 text-sm">Le formateur vous précise la liste du matériel au moment de la confirmation. Le cours se déroule à {course.city}.</p>
                                </div>
                                <div className="rounded-3xl bg-sand-100/60 p-4 text-charcoal-700">
                                    <p className="font-semibold text-charcoal-900">Progression douce</p>
                                    <p className="mt-2 text-sm">Groupes restreints et pédagogie pas-à-pas. L’objectif est que chacun reparte fier de ce qu’il a réalisé.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="card-elevated space-y-4 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 font-display text-lg text-brand-600">
                                        {course.teacher.firstName.charAt(0)}
                                        {course.teacher.lastName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm uppercase tracking-wide text-brand-500">Votre formateur</p>
                                        <p className="font-display text-xl text-charcoal-900">
                                            {course.teacher.firstName} {course.teacher.lastName}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-charcoal-600">
                                    {course.teacher.bio || "Formateur passionné qui aime transmettre son savoir-faire dans une ambiance conviviale et bienveillante."}
                                </p>
                                <button onClick={contactTeacher} className="btn-secondary w-full">
                                    Échanger avec le formateur
                                </button>
                            </div>

                            <div className="card-elevated space-y-4 p-6 text-charcoal-700">
                                <p className="font-display text-lg text-charcoal-900">Infos pratiques</p>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-3">
                                        <FiInfo className="mt-1 h-4 w-4 text-brand-500" />
                                        <p>Adresse exacte communiquée après confirmation de votre inscription.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FiShield className="mt-1 h-4 w-4 text-brand-500" />
                                        <p>Annulation possible jusqu’à 48h avant le cours pour un remboursement complet.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FiMessageCircle className="mt-1 h-4 w-4 text-brand-500" />
                                        <p>Besoin d’informations ? Contactez le formateur directement ou écrivez-nous : support@homework.fr</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

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
