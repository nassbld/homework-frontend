import { useState, useEffect } from 'react';
import apiClient from '../services/api';
import CourseCard from '../components/CourseCard';
import FilterBar from '../components/FilterBar';
import Pagination from "../components/Pagination.tsx";
import { useDebounce } from '../hooks/useDebounce';
import { type Course, type Category } from '../types';
import { FiSearch, FiSliders, FiMapPin } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-sand-50 selection:bg-brand-200 selection:text-brand-900">
            <main className="pb-20">
                {/* Hero Section with organic blobs */}
                <section className="relative pt-24 pb-12 lg:pt-32 overflow-hidden">
                     {/* Decorative background elements */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[500px] bg-gradient-to-b from-white to-transparent rounded-[100%] -z-10 pointer-events-none opacity-60" />
                    <div className="absolute top-20 left-10 w-72 h-72 bg-brand-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />
                    <div className="absolute top-40 right-10 w-96 h-96 bg-sand-200 rounded-full blur-[100px] opacity-40 pointer-events-none" />

                    <div className="container mx-auto px-6 relative z-10">
                        <div className="mx-auto max-w-3xl text-center">
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-brand-100 text-brand-700 text-sm font-medium mb-6"
                            >
                                <FiSliders className="w-4 h-4" />
                                <span>Trouvez votre atelier idéal</span>
                            </motion.div>
                            
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="font-display text-4xl md:text-6xl text-charcoal-900 mb-6"
                            >
                                Explorez nos cours <span className="italic text-brand-500">chaleureux</span>.
                            </motion.h1>
                            
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-lg text-charcoal-600 mb-10 leading-relaxed max-w-2xl mx-auto"
                            >
                                Une communauté de passionnés vous attend pour partager leur savoir-faire, 
                                dans une ambiance conviviale et bienveillante.
                            </motion.p>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="relative mx-auto max-w-2xl"
                        >
                            <div className="relative group">
                                <div className="absolute inset-0 bg-brand-200 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                                <div className="relative bg-white rounded-full shadow-soft p-2 flex items-center transition-transform focus-within:scale-[1.01]">
                                    <div className="pl-6 pr-4 text-charcoal-400">
                                        <FiSearch className="w-6 h-6" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Rechercher un savoir-faire, une ville..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        className="w-full bg-transparent border-none text-lg placeholder:text-charcoal-400 text-charcoal-800 focus:ring-0 focus:outline-none py-3"
                                    />
                                    <button className="bg-brand-600 text-white p-3 rounded-full hover:bg-brand-500 transition-colors shadow-md">
                                        <FiMapPin className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section className="container mx-auto px-6">
                    <div className="mb-10">
                         <FilterBar
                            selectedCategory={selectedCategory}
                            onSelectCategory={handleCategorySelect}
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div 
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3"
                            >
                                {loadingSkeletons.map((_, index) => (
                                    <div
                                        key={`skeleton-${index}`}
                                        className="card-elevated h-full bg-white p-0 overflow-hidden"
                                    >
                                        <div className="h-56 w-full bg-sand-100 animate-pulse" />
                                        <div className="space-y-4 p-6">
                                            <div className="flex justify-between">
                                                 <div className="h-4 w-24 rounded-full bg-sand-100 animate-pulse" />
                                                 <div className="h-4 w-16 rounded-full bg-sand-100 animate-pulse" />
                                            </div>
                                            <div className="h-8 w-3/4 rounded-full bg-sand-100 animate-pulse" />
                                            <div className="h-4 w-1/2 rounded-full bg-sand-100 animate-pulse" />
                                            <div className="pt-4 flex gap-3">
                                                <div className="h-8 w-20 rounded-full bg-sand-100 animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="content"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {courses.length > 0 ? (
                                    <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                                        {courses.map((course) => (
                                            <motion.div key={course.id} variants={itemVariants} layout>
                                                <CourseCard course={course} />
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <motion.div 
                                        variants={itemVariants}
                                        className="flex flex-col items-center justify-center py-20 text-center"
                                    >
                                        <div className="w-24 h-24 bg-sand-100 rounded-full flex items-center justify-center mb-6 text-sand-400">
                                            <FiSearch className="w-10 h-10" />
                                        </div>
                                        <h3 className="font-display text-2xl text-charcoal-900 mb-2">Aucun atelier trouvé</h3>
                                        <p className="text-charcoal-600 max-w-md">
                                            Nous n'avons pas trouvé de cours correspondant à votre recherche. Essayez d'élargir vos critères ou de changer de catégorie.
                                        </p>
                                        <button 
                                            onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                                            className="mt-6 text-brand-600 font-medium hover:text-brand-500 underline decoration-2 underline-offset-4"
                                        >
                                            Effacer tous les filtres
                                        </button>
                                    </motion.div>
                                )}

                                {totalPages > 1 && (
                                    <motion.div variants={itemVariants} className="mt-16 flex justify-center">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                        />
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </main>
        </div>
    );
}
