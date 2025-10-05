import { useState, useEffect } from 'react';
import apiClient from '../services/api';
import CourseCard from '../components/CourseCard';
import FilterBar from '../components/FilterBar';
import Pagination from "../components/Pagination.tsx";
import { useDebounce } from '../hooks/useDebounce';
import { type Course, type Category } from '../types';
import { FiLoader } from 'react-icons/fi'; // Pour une icône de chargement plus moderne

interface Page<T> {
    content: T[];
    totalPages: number;
    number: number;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const debouncedSearchQuery = useDebounce(searchQuery, 400);

    useEffect(() => {
        const fetchCourses = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (debouncedSearchQuery) {
                    params.append('query', debouncedSearchQuery);
                }
                if (selectedCategory) {
                    params.append('category', selectedCategory);
                }
                params.append('page', currentPage.toString());
                params.append('size', '9');

                const response = await apiClient.get<Page<Course>>(`/courses?${params.toString()}`);

                setCourses(response.data.content);
                setTotalPages(response.data.totalPages);

            } catch (error) {
                console.error("Erreur lors de la récupération des cours:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, [currentPage, debouncedSearchQuery, selectedCategory]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        setCurrentPage(0);
    };

    const handleCategorySelect = (category: Category | null) => {
        setSelectedCategory(category);
        setCurrentPage(0);
    };

    return (
        // --- MISE À JOUR DU STYLE ---
        <div className="bg-orange-50 min-h-screen">
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <header className="text-center mb-10 md:mb-14">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-800 mb-3">
                        Explorez nos Cours
                    </h1>
                    <p className="max-w-2xl mx-auto text-base md:text-lg text-stone-600">
                        Trouvez le savoir-faire qui vous passionne, dispensé par des experts près de chez vous.
                    </p>
                </header>

                <div className="mb-8 max-w-lg mx-auto bg-white">
                    <input
                        type="text"
                        placeholder="Rechercher par mot-clé..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>

                <FilterBar
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleCategorySelect}
                />

                {isLoading ? (
                    <div className="text-center py-16 flex justify-center">
                        <FiLoader className="h-10 w-10 animate-spin text-orange-500" />
                    </div>
                ) : (
                    <>
                        {courses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                                {courses.map((course) => (
                                    <CourseCard key={course.id} course={course} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-lg shadow">
                                <h3 className="text-xl font-semibold text-stone-800">Aucun cours trouvé</h3>
                                <p className="mt-2 text-stone-500">Essayez d'ajuster vos critères de recherche.</p>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </>
                )}
            </main>
        </div>
        // --- FIN MISE À JOUR ---
    );
}
