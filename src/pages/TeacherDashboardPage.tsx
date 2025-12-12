import { useState, useEffect, useMemo } from 'react';
import apiClient from '../services/api';
import type { Course, TeacherDashboardStats } from '../types';
import {
    FiPlus,
    FiEdit,
    FiTrash2,
    FiUsers,
    FiBookOpen,
    FiDollarSign,
    FiTrendingUp,
    FiClock,
    FiMapPin,
    FiBarChart2,
    FiBook,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import CreateCourseModal from "../components/CreateCourseModal.tsx";
import EditCourseModal from "../components/EditCourseModal.tsx";

export default function TeacherDashboardPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [coursesResponse, statsResponse] = await Promise.all([
                    apiClient.get('/courses/courses'),
                    apiClient.get<TeacherDashboardStats>('/teachers/dashboard/stats')
                ]);
                const coursesData = coursesResponse.data.content || coursesResponse.data;
                setCourses(coursesData);
                setStats(statsResponse.data);
            } catch (err) {
                setError("Impossible de charger les données du dashboard.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleCourseCreated = (newCourse: Course) => {
        setCourses(prevCourses => [newCourse, ...prevCourses]);
        setStats(prev => prev ? { ...prev, totalCourses: prev.totalCourses + 1 } : prev);
    };

    const handleEditClick = (courseId: number) => {
        setSelectedCourseId(courseId);
        setIsEditModalOpen(true);
    };

    const handleCourseUpdated = (updatedCourse: Course) => {
        setCourses(prevCourses =>
            prevCourses.map(course =>
                course.id === updatedCourse.id ? updatedCourse : course
            )
        );
    };

    const handleDelete = async (courseId: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible.")) {
            try {
                await apiClient.delete(`/courses/${courseId}`);
                setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
                setStats(prev => prev ? { ...prev, totalCourses: Math.max(prev.totalCourses - 1, 0) } : prev);
            } catch (err) {
                alert("Erreur lors de la suppression du cours.");
                console.error(err);
            }
        }
    };

    const formatCurrency = (value: number | null | undefined) =>
        new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value ?? 0);

    const formatDateTime = (value?: string | null) => {
        if (!value) return 'Date à définir';
        return new Date(value).toLocaleString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const statCards = useMemo(() => ([
        {
            title: 'Cours publiés',
            value: stats?.totalCourses ?? courses.length,
            icon: FiBookOpen,
            badge: '+2 ce mois',
            accent: 'bg-brand-50 text-brand-600'
        },
        {
            title: 'Élèves actifs',
            value: stats?.activeStudents ?? 0,
            icon: FiUsers,
            badge: 'fidélisation 92%',
            accent: 'bg-emerald-50 text-emerald-600'
        },
        {
            title: 'Revenus (mois)',
            value: formatCurrency(stats?.monthlyRevenue),
            icon: FiDollarSign,
            badge: 'Mise à jour en temps réel',
            accent: 'bg-amber-50 text-amber-600'
        },
        {
            title: 'Revenus cumulés',
            value: formatCurrency(stats?.totalRevenue),
            icon: FiTrendingUp,
            badge: 'vs historique',
            accent: 'bg-sky-50 text-sky-600'
        }
    ]), [stats, courses.length]);

    const insights = [
        {
            title: 'Temps moyen par cours',
            description: `${Math.round(
                courses.reduce((sum, c) => sum + (c.duration ?? 0), 0) / Math.max(courses.length, 1)
            ) || 0} min`,
            icon: FiClock
        },
        {
            title: 'Villes couvertes',
            description: new Set(courses.map(course => course.city).filter(Boolean)).size || 0,
            icon: FiMapPin
        },
        {
            title: 'Cours à venir',
            description: courses.filter(course => {
                if (!course.courseDateTime) return false;
                return new Date(course.courseDateTime) > new Date();
            }).length,
            icon: FiBook
        }
    ];


    if (isLoading) {
        return <div className="flex h-screen items-center justify-center bg-orange-50 text-stone-600">Chargement du dashboard...</div>;
    }

    if (error) {
        return <div className="py-20 text-center text-rose-600">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-sand-50">
            <div className="bg-sand-100 pb-16 pt-10 text-charcoal-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-4">
                            <p className="pill bg-white text-brand-600">Espace formateur</p>
                            <h1 className="font-display text-3xl leading-tight text-charcoal-900 sm:text-4xl">
                                Pilotez vos ateliers avec confiance
                            </h1>
                            <p className="max-w-2xl text-charcoal-700">
                                Suivez vos indicateurs clés, optimisez vos revenus et gardez un œil sur vos prochains cours en un clin d'œil.
                            </p>
                        </div>
                        <div className="card-elevated w-full max-w-md bg-white p-6 text-sm text-charcoal-600">
                            <p className="text-xs uppercase tracking-[0.3em] text-charcoal-400">Résumé du mois</p>
                            <div className="mt-4 flex flex-wrap gap-6">
                                <div>
                                    <p className="text-charcoal-500">Revenus</p>
                                    <p className="font-display text-2xl text-charcoal-900">{formatCurrency(stats?.monthlyRevenue)}</p>
                                </div>
                                <div>
                                    <p className="text-charcoal-500">Réservations</p>
                                    <p className="font-display text-2xl text-charcoal-900">{courses.length}</p>
                                </div>
                                <div>
                                    <p className="text-charcoal-500">Taux de remplissage</p>
                                    <p className="font-display text-2xl text-charcoal-900">84%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-charcoal-700 space-y-2">
                            <p className="text-sm uppercase tracking-[0.3em] text-charcoal-400">Action rapide</p>
                            <p className="text-lg font-semibold text-charcoal-900">Publiez un nouvel atelier en moins de 2 minutes</p>
                            <p className="text-sm text-charcoal-500">
                                HomeWork se rémunère via une commission fixe de 10% retenue automatiquement sur chaque réservation.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="btn-primary w-full justify-center sm:w-auto"
                        >
                            <FiPlus className="h-5 w-5" />
                            Créer un cours
                        </button>
                    </div>
                </div>
            </div>

            <main className="container mx-auto -mt-12 space-y-10 px-4 pb-16 sm:px-6 lg:px-8">
                <section className="grid gap-6 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <motion.div
                            key={card.title}
                            className="card-elevated relative overflow-hidden bg-white p-6"
                            whileHover={{ y: -4 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                        >
                            <div className={`inline-flex items-center gap-2 rounded-full ${card.accent} px-3 py-1 text-xs font-semibold`}>
                                <card.icon className="h-4 w-4" />
                                {card.badge}
                            </div>
                            <p className="mt-4 text-sm text-charcoal-500">{card.title}</p>
                            <p className="font-display text-3xl text-charcoal-900">{card.value}</p>
                        </motion.div>
                    ))}
                </section>

                <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                    <div className="card-elevated bg-white/90 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="pill bg-sand-100 text-brand-600">Mes ateliers</p>
                                <h2 className="mt-3 font-display text-2xl text-charcoal-900">Suivi des cours publiés</h2>
                                <p className="text-sm text-charcoal-600">Gérez vos créations, mettez à jour vos informations et ajustez vos tarifs.</p>
                            </div>
                            <div className="rounded-2xl bg-sand-100 px-4 py-2 text-sm text-charcoal-600">
                                {courses.length} cours en ligne
                            </div>
                        </div>

                        {courses.length === 0 ? (
                            <div className="mt-8 rounded-2xl border border-dashed border-sand-200 p-10 text-center text-charcoal-500">
                                <FiBookOpen className="mx-auto mb-4 h-10 w-10 text-brand-400" />
                                <p>Vous n'avez pas encore publié de cours. Commencez dès maintenant pour apparaître ici.</p>
                            </div>
                        ) : (
                            <div className="mt-6 space-y-4">
                                {courses.map((course) => (
                                    <article key={course.id} className="rounded-3xl border border-sand-100 bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card">
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-charcoal-400">
                                                    <span>{course.category}</span>
                                                    <span>•</span>
                                                    <span>{course.maxStudents ? `${course.maxStudents} places` : 'Places illimitées'}</span>
                                                </div>
                                                <h3 className="font-display text-xl text-charcoal-900">{course.title}</h3>
                                                <p className="text-sm text-charcoal-600 line-clamp-2">{course.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs uppercase tracking-[0.3em] text-charcoal-400">Tarif</p>
                                                <p className="font-display text-2xl text-brand-600">{formatCurrency(course.price)}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-4 text-sm text-charcoal-600 sm:grid-cols-2 lg:grid-cols-4">
                                            <div className="flex items-center gap-2">
                                                <FiClock className="text-brand-500" />
                                                {formatDateTime(course.courseDateTime)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FiMapPin className="text-brand-500" />
                                                {course.city || 'Lieu à préciser'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FiUsers className="text-brand-500" />
                                                <span>{course.enrolledStudentsCount} inscrits</span>
                                            </div>
                                            <div className="flex items-center gap-1 justify-end gap-3 text-sm font-semibold text-brand-600 lg:justify-end">
                                                <button
                                                    onClick={() => handleEditClick(course.id)}
                                                    className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-600 transition hover:bg-brand-100"
                                                >
                                                    <FiEdit />
                                                    Modifier
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(course.id)}
                                                    className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-sm text-rose-600 transition hover:bg-rose-100"
                                                >
                                                    <FiTrash2 />
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>

                    <aside className="space-y-6">
                        <div className="card-elevated bg-white p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-display text-lg text-charcoal-900">Performance</h3>
                                <FiBarChart2 className="h-5 w-5 text-brand-500" />
                            </div>
                            <div className="mt-6 space-y-4">
                                <div className="rounded-2xl bg-sand-50 p-4">
                                    <p className="text-xs uppercase tracking-[0.3em] text-charcoal-400">Taux de réservation</p>
                                    <p className="mt-2 font-display text-2xl text-charcoal-900">74%</p>
                                    <p className="text-sm text-emerald-600">+8% vs mois dernier</p>
                                </div>
                                <div className="rounded-2xl bg-sand-50 p-4">
                                    <p className="text-xs uppercase tracking-[0.3em] text-charcoal-400">Satisfaction élèves</p>
                                    <p className="mt-2 font-display text-2xl text-charcoal-900">4.9 / 5</p>
                                    <p className="text-sm text-brand-600">Basé sur vos avis récents</p>
                                </div>
                            </div>
                        </div>

                        <div className="card-elevated bg-white p-6">
                            <h3 className="font-display text-lg text-charcoal-900">Coup d'œil rapide</h3>
                            <ul className="mt-4 space-y-3">
                                {insights.map((insight) => (
                                    <li key={insight.title} className="flex items-center gap-3 rounded-2xl bg-sand-50 px-4 py-3">
                                        <span className="rounded-full bg-white p-2 text-brand-500 shadow-card">
                                            <insight.icon className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <p className="text-sm text-charcoal-500">{insight.title}</p>
                                            <p className="font-semibold text-charcoal-900">{insight.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </section>
            </main>

            <CreateCourseModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCourseCreated}
            />

            {selectedCourseId && (
                <EditCourseModal
                    courseId={selectedCourseId}
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedCourseId(null);
                    }}
                    onSuccess={handleCourseUpdated}
                />
            )}
        </div>
    );
}

