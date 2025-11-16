import { useState, useEffect } from 'react';
import apiClient from '../services/api';
import CourseCard from '../components/CourseCard';
import FilterBar from '../components/FilterBar';
import Pagination from "../components/Pagination.tsx";
import { useDebounce } from '../hooks/useDebounce';
import { type Course, type Category } from '../types';
import { FiLoader, FiSearch, FiSliders } from 'react-icons/fi';

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
                    params.append('keyword', debouncedSearchQuery);
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

    const loadingSkeletons = Array.from({ length: 6 });

    return (
        <div className="min-h-screen bg-sand-50">
            <main className="pb-20">
                <section className="relative overflow-hidden bg-hero-gradient">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-brand-100 opacity-60 blur-3xl" />
                        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sand-200 opacity-70 blur-3xl" />
                    </div>

                    <div className="relative container mx-auto px-6 py-16 md:py-20">
                        <div className="mx-auto max-w-3xl text-center">
                            <span className="pill mx-auto bg-white/70 text-brand-600 backdrop-blur">
                                <FiSliders className="mr-2 inline h-4 w-4" />
                                Trouvez votre prochain cours
                            </span>
                            <h1 className="mt-5 font-display text-4xl leading-tight md:text-5xl">
                                Explorez nos cours chaleureux et humains
                            </h1>
                            <p className="mt-4 text-lg text-charcoal-700 md:text-xl">
                                Affinez votre recherche selon vos envies : une communauté de formateurs passionnés vous attend
                                partout en France.
                            </p>
                        </div>

                        <div className="relative mx-auto mt-10 max-w-2xl">
                            <FiSearch className="pointer-events-none absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal-600" />
                            <input
                                type="text"
                                placeholder="Rechercher un savoir-faire, un formateur, une ville…"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full rounded-full border-none bg-white/90 px-14 py-4 text-base text-charcoal-800 shadow-soft outline-none transition focus:bg-white focus:ring-2 focus:ring-brand-200"
                            />
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-6 pt-12">
                    <FilterBar
                        selectedCategory={selectedCategory}
                        onSelectCategory={handleCategorySelect}
                    />

                    {isLoading ? (
                        <div className="grid gap-8 pt-6 sm:grid-cols-2 xl:grid-cols-3">
                            {loadingSkeletons.map((_, index) => (
                                <div
                                    key={`skeleton-${index}`}
                                    className="card-elevated h-full animate-pulse overflow-hidden bg-white/80"
                                >
                                    <div className="h-48 w-full bg-sand-100" />
                                    <div className="space-y-4 p-6">
                                        <div className="h-4 w-24 rounded-full bg-sand-200" />
                                        <div className="h-6 w-3/4 rounded-full bg-sand-200" />
                                        <div className="h-4 w-2/3 rounded-full bg-sand-200" />
                                        <div className="flex gap-3">
                                            <div className="h-8 w-20 rounded-full bg-sand-200" />
                                            <div className="h-8 w-24 rounded-full bg-sand-200" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {courses.length > 0 ? (
                                <div className="grid gap-8 pt-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {courses.map((course) => (
                                        <CourseCard key={course.id} course={course} />
                                    ))}
                                </div>
                            ) : (
                                <div className="card-elevated mx-auto mt-12 max-w-xl bg-white p-10 text-center">
                                    <h3 className="font-display text-2xl text-charcoal-900">Aucun cours trouvé</h3>
                                    <p className="mt-3 text-charcoal-600">
                                        Ajustez vos filtres ou essayez un autre mot-clé pour découvrir de nouveaux savoir-faire.
                                    </p>
                                </div>
                            )}

                            {totalPages > 1 && (
                                <div className="mt-12 flex justify-center">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}
