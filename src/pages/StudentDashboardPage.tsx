import { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { FiLoader, FiBookOpen, FiCalendar, FiClock, FiMapPin, FiXCircle, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { Enrollment } from "../types";
import { requestRefund } from '../services/paymentApi';

const HOURS_BEFORE_REFUND = 48;

function formatCurrency(amount: number, currency = 'EUR') {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDateTime(value: string) {
    return new Date(value).toLocaleString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export default function StudentDashboardPage() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const response = await apiClient.get('/enrollments/my-courses');
                setEnrollments(response.data);
            } catch (err) {
                setError("Impossible de charger vos cours.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyCourses();
    }, []);

    const handleRefund = async (enrollment: Enrollment) => {
        const { course, id, status } = enrollment;
        if (status !== 'ACTIVE') return;

        const courseDate = new Date(course.courseDateTime);
        const hoursUntilCourse = (courseDate.getTime() - Date.now()) / 36e5;
        if (hoursUntilCourse < HOURS_BEFORE_REFUND) {
            setFeedback({ type: 'error', message: "Vous ne pouvez plus annuler ce cours à moins de 48 heures du début." });
            return;
        }

        const confirm = window.confirm('Voulez-vous annuler cette inscription et demander un remboursement ?');
        if (!confirm) return;

        setCancellingId(id);
        setFeedback(null);
        try {
            await requestRefund(id);
            setEnrollments((current) => current.map((item) => item.id === id ? { ...item, status: 'CANCELLED' } : item));
            setFeedback({ type: 'success', message: 'Inscription annulée et remboursée avec succès.' });
        } catch (err: any) {
            const message = err?.response?.data?.message || "Impossible d'annuler cette inscription.";
            setFeedback({ type: 'error', message });
        } finally {
            setCancellingId(null);
        }
    };

    const renderStatusBadge = (status: Enrollment['status']) => {
        switch (status) {
            case 'ACTIVE':
                return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"><FiCheckCircle /> Active</span>;
            case 'CANCELLED':
                return <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700"><FiXCircle /> Annulée</span>;
            case 'COMPLETED':
                return <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600"><FiCheckCircle /> Terminée</span>;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-sand-50">
                <div className="space-y-3 text-center">
                    <FiLoader className="mx-auto h-10 w-10 animate-spin text-brand-500" />
                    <p className="text-charcoal-600">Chargement de vos cours...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="py-20 text-center text-rose-600">{error}</div>;
    }

    const learningTips = [
        { title: 'Pense à vérifier le lieu', description: 'L’adresse exacte est envoyée après confirmation.' },
        { title: 'Échange avec le formateur', description: 'Pose tes questions en amont pour venir serein.' },
        { title: 'Annulation 48h', description: 'Tu peux annuler jusqu’à 48h avant et être remboursé.' },
    ];

    return (
        <div className="min-h-screen bg-sand-50">
            <header className="bg-hero-gradient px-6 py-12">
                <div className="container mx-auto">
                    <p className="pill bg-white/80 text-brand-600 backdrop-blur">Mes ateliers réservés</p>
                    <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="font-display text-3xl text-charcoal-900 md:text-4xl">Mes cours</h1>
                            <p className="text-charcoal-700">Retrouve tes réservations, annule si besoin et suis ta progression.</p>
                        </div>
                        <Link to="/courses" className="btn-primary w-full md:w-auto">
                            Découvrir de nouveaux cours
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto space-y-8 px-4 py-12 sm:px-6 lg:px-8">
                {feedback && (
                    <div className={`flex items-start gap-2 rounded-3xl border px-4 py-3 text-sm ${
                        feedback.type === 'success'
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}>
                        {feedback.type === 'success' ? <FiCheckCircle className="mt-0.5" /> : <FiAlertTriangle className="mt-0.5" />}
                        <span>{feedback.message}</span>
                    </div>
                )}

                {enrollments.length === 0 ? (
                    <div className="card-elevated mx-auto max-w-3xl space-y-4 bg-white/90 p-10 text-center">
                        <FiBookOpen className="mx-auto h-12 w-12 text-charcoal-300" />
                        <h3 className="font-display text-2xl text-charcoal-900">Aucun cours pour le moment</h3>
                        <p className="text-charcoal-600">Parcourez nos ateliers et réservez celui qui vous inspire.</p>
                        <Link to="/courses" className="btn-primary inline-flex items-center justify-center">
                            Parcourir les cours
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                        <div className="grid gap-6">
                            {enrollments.map((enrollment) => {
                                const { course } = enrollment;
                                const courseDate = new Date(course.courseDateTime);
                                const hoursUntilCourse = (courseDate.getTime() - Date.now()) / 36e5;
                                const canCancel = enrollment.status === 'ACTIVE' && hoursUntilCourse >= HOURS_BEFORE_REFUND;

                                return (
                                    <div key={enrollment.id} className="card-elevated overflow-hidden bg-white">
                                        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="pill bg-sand-100 text-brand-500">{course.category}</span>
                                                    {renderStatusBadge(enrollment.status)}
                                                </div>
                                                <h3 className="font-display text-2xl text-charcoal-900">{course.title}</h3>
                                                <p className="text-sm text-charcoal-600">Par {course.teacher.firstName} {course.teacher.lastName}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs uppercase tracking-[0.3em] text-charcoal-500">Montant payé</p>
                                                <p className="font-display text-xl text-brand-600">{formatCurrency(course.price)}</p>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 border-t border-sand-200 px-6 py-4 text-sm text-charcoal-700 sm:grid-cols-2">
                                            <div className="flex items-center gap-2">
                                                <FiCalendar className="text-brand-500" />
                                                {formatDateTime(course.courseDateTime)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FiClock className="text-brand-500" />
                                                {course.duration} minutes
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FiMapPin className="text-brand-500" />
                                                {course.city}
                                            </div>
                                            <Link to={`/courses/${course.id}`} className="text-right font-semibold text-brand-500 hover:text-brand-600">
                                                Voir le détail →
                                            </Link>
                                        </div>

                                        <div className="border-t border-sand-200 px-6 py-4">
                                            {enrollment.status === 'ACTIVE' ? (
                                                <button
                                                    onClick={() => handleRefund(enrollment)}
                                                    className="btn-secondary w-full border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                                                    disabled={!canCancel || cancellingId === enrollment.id}
                                                >
                                                    {cancellingId === enrollment.id ? <FiLoader className="animate-spin" /> : <FiXCircle />}
                                                    {cancellingId === enrollment.id
                                                        ? 'Annulation en cours...'
                                                        : canCancel ? 'Annuler et rembourser' : 'Annulation indisponible'}
                                                </button>
                                            ) : (
                                                <p className="text-center text-sm text-charcoal-500">
                                                    Cette inscription est {enrollment.status === 'CANCELLED' ? 'annulée' : 'terminée'}.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <aside className="space-y-6">
                            <div className="card-elevated space-y-4 bg-white/90 p-6">
                                <p className="font-display text-lg text-charcoal-900">Conseils pour ton prochain cours</p>
                                <ul className="space-y-3 text-sm text-charcoal-600">
                                    {learningTips.map((tip) => (
                                        <li key={tip.title}>
                                            <p className="font-semibold text-charcoal-900">{tip.title}</p>
                                            <p>{tip.description}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="card-elevated space-y-3 bg-white/90 p-6 text-sm text-charcoal-600">
                                <p className="font-display text-lg text-charcoal-900">Besoin d’aide ?</p>
                                <p>Support HomeWork : support@homework.fr</p>
                                <p>Annulation possible jusqu’à 48h avant pour remboursement complet.</p>
                            </div>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}
