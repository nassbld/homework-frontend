import { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { FiLoader, FiBookOpen } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type {Enrollment} from "../types";

export default function StudentDashboardPage() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl md:text-4xl font-extrabold text-stone-800 mb-8">Mes Cours</h1>

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
                        {enrollments.map(({ course }) => (
                            <div key={course.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-xl">
                                <div className="p-6">
                                    <p className="text-sm font-semibold text-orange-600">{course.category}</p>
                                    <h3 className="text-xl font-bold text-stone-800 mt-1">{course.title}</h3>
                                    <p className="text-stone-600 mt-2">Par {course.teacher.firstName} {course.teacher.lastName}</p>
                                    <Link to={`/courses/${course.id}`} className="mt-4 inline-block text-orange-600 font-semibold">
                                        Voir les détails &rarr;
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
