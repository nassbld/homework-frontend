import { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { FiLoader, FiBookOpen, FiCalendar, FiClock, FiMapPin, FiXCircle, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type {Enrollment} from "../types";
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
            <div className="flex h-screen items-center justify-center bg-orange-50">
                <FiLoader className="h-10 w-10 animate-spin text-orange-500" />
            </div>
        );
    }

    if (error) {
        return <div className="py-20 text-center text-rose-600">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-orange-50">
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-stone-800">Mes Cours</h1>

                {feedback && (
                    <div className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
                        {feedback.type === 'success' ? <FiCheckCircle className="mt-0.5" /> : <FiAlertTriangle className="mt-0.5" />}
                        <span>{feedback.message}</span>
                    </div>
                )}

                {enrollments.length === 0 ? (
                    <div className="text-center bg-white p-12 rounded-xl shadow-lg">
                        <FiBookOpen className="mx-auto h-12 w-12 text-stone-400" />
                        <h3 className="mt-4 text-xl font-semibold text-stone-800">Aucun cours pour le moment</h3>
                        <p className="mt-2 text-stone-500">Vous n'êtes inscrit à aucun cours.</p>
                        <Link to="/courses" className="mt-6 inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 font-semibold">
                            Parcourir les cours
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrollments.map((enrollment) => {
                            const { course } = enrollment;
                            const courseDate = new Date(course.courseDateTime);
                            const hoursUntilCourse = (courseDate.getTime() - Date.now()) / 36e5;
                            const canCancel = enrollment.status === 'ACTIVE' && hoursUntilCourse >= HOURS_BEFORE_REFUND;

                            return (
                                <div key={enrollment.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-orange-600">{course.category}</p>
                                            {renderStatusBadge(enrollment.status)}
                                        </div>
                                        <h3 className="text-xl font-bold text-stone-800">{course.title}</h3>
                                        <p className="text-sm text-stone-600">Par {course.teacher.firstName} {course.teacher.lastName}</p>

                                        <div className="space-y-2 rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
                                            <div className="flex items-center justify-between">
                                                <span className="inline-flex items-center gap-2"><FiCalendar /> Date</span>
                                                <span>{formatDateTime(course.courseDateTime)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="inline-flex items-center gap-2"><FiClock /> Durée</span>
                                                <span>{course.duration} minutes</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="inline-flex items-center gap-2"><FiMapPin /> Ville</span>
                                                <span>{course.city}</span>
                                            </div>
                                            <div className="flex items-center justify-between font-semibold text-stone-900">
                                                <span>Montant payé</span>
                                                <span>{formatCurrency(course.price)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-stone-500">
                                            <span>Annulation possible jusqu'à 48h avant le début du cours.</span>
                                            <Link to={`/courses/${course.id}`} className="font-semibold text-orange-600 hover:text-orange-500 text-sm">
                                                Détails &rarr;
                                            </Link>
                                        </div>

                                        {enrollment.status === 'ACTIVE' ? (
                                            <button
                                                onClick={() => handleRefund(enrollment)}
                                                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                                                disabled={!canCancel || cancellingId === enrollment.id}
                                            >
                                                {cancellingId === enrollment.id ? <FiLoader className="animate-spin" /> : <FiXCircle />}
                                                {cancellingId === enrollment.id ? 'Annulation en cours...' : canCancel ? 'Annuler et rembourser' : 'Annulation indisponible'}
                                            </button>
                                        ) : (
                                            <p className="text-sm text-stone-500">Cette inscription est {enrollment.status === 'CANCELLED' ? 'annulée' : 'terminée'}.</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
