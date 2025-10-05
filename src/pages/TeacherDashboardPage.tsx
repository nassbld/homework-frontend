import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { type Course } from '../types';
import { FiPlus, FiEdit, FiTrash2, FiUsers, FiBook, FiDollarSign } from 'react-icons/fi';
import { motion } from 'framer-motion';
import CreateCourseModal from "../components/CreateCourseModal.tsx";
import EditCourseModal from "../components/EditCourseModal.tsx";

export default function TeacherDashboardPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [stats, _setStats] = useState({ totalStudents: 0, monthlyRevenue: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const coursesResponse = await apiClient.get('/courses/courses');
                setCourses(coursesResponse.data.content || coursesResponse.data);
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
            } catch (err) {
                alert("Erreur lors de la suppression du cours.");
                console.error(err);
            }
        }
    };


    if (isLoading) {
        return <div className="flex h-screen items-center justify-center bg-orange-50 text-stone-600">Chargement du dashboard...</div>;
    }

    if (error) {
        return <div className="py-20 text-center text-rose-600">{error}</div>;
    }

    return (
        // --- MISE À JOUR DU STYLE ---
        <div className="min-h-screen bg-orange-50">
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between mb-8 md:mb-12">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-stone-800">Votre Dashboard</h1>
                        <p className="mt-1 text-lg text-stone-600">Gérez vos cours et suivez votre progression.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 text-base font-semibold text-white shadow-lg hover:bg-orange-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                        <FiPlus className="h-5 w-5" />
                        Créer un cours
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 md:mb-12">
                    <StatCard icon={FiBook} title="Total des Cours" value={courses.length} color="orange" />
                    <StatCard icon={FiUsers} title="Total des Élèves" value={stats.totalStudents || '123'} color="green" />
                    <StatCard icon={FiDollarSign} title="Revenus (ce mois)" value={`${stats.monthlyRevenue || 456}${'\u20AC'}`} color="amber" />
                </div>

                <div className="bg-white rounded-xl shadow-lg">
                    <div className="px-6 py-4 border-b border-stone-200">
                        <h2 className="text-xl font-bold text-stone-800">Mes Cours</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-stone-200">
                            <thead className="bg-stone-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Cours</th>
                                <th scope="col" className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Catégorie</th>
                                <th scope="col" className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Prix</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-200">
                            {courses.map((course) => (
                                <tr key={course.id} className="hover:bg-orange-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-stone-800">{course.title}</div>
                                        <div className="text-sm text-stone-500 lg:hidden">{course.category}</div>
                                    </td>
                                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-stone-500">{course.category}</td>
                                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-stone-500">{course.pricePerHour}{'\u20AC'} / heure</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEditClick(course.id)} className="text-orange-600 hover:text-orange-900 mr-4"><FiEdit className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(course.id)} className="text-rose-600 hover:text-rose-900"><FiTrash2 className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

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
        // --- FIN MISE À JOUR ---
    );
}

interface StatCardProps {
    icon: React.ElementType;
    title: string;
    value: string | number;
    color: 'orange' | 'green' | 'amber';
}

function StatCard({ icon: Icon, title, value, color }: StatCardProps) {
    const colors = {
        orange: 'text-orange-600 bg-orange-100',
        green: 'text-green-600 bg-green-100',
        amber: 'text-amber-600 bg-amber-100',
    };

    return (
        <motion.div
            className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-6"
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <div className={`p-4 rounded-full ${colors[color]}`}>
                <Icon className="h-8 w-8" />
            </div>
            <div>
                <p className="text-sm font-medium text-stone-500">{title}</p>
                <p className="text-3xl font-bold text-stone-800">{value}</p>
            </div>
        </motion.div>
    );
}
