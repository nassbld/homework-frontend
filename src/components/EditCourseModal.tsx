import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import apiClient from '../services/api';
import type { Category, Course } from '../types';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';

interface CourseFormData {
    title: string;
    description: string;
    category: Category;
    price: number;
    courseDateTime: string;
    city: string;
    duration: number;
    maxStudents: number;
}

interface EditCourseModalProps {
    courseId: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedCourse: Course) => void;
}

const CATEGORIES: { value: Category; label: string }[] = [
    { value: 'CUISINE', label: 'Cuisine' },
    { value: 'COUTURE', label: 'Couture' },
    { value: 'BRICOLAGE', label: 'Bricolage' },
    { value: 'MECANIQUE', label: 'Mécanique' },
    { value: 'JARDINAGE', label: 'Jardinage' },
    { value: 'AUTRE', label: 'Autre' },
];

export default function EditCourseModal({ courseId, isOpen, onClose, onSuccess }: EditCourseModalProps) {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty },
        reset,
        setValue
    } = useForm<CourseFormData>();

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            apiClient.get<Course>(`/courses/${courseId}`)
                .then(response => {
                    const course = response.data;
                    setValue('title', course.title);
                    setValue('description', course.description);
                    setValue('category', course.category);
                    setValue('price', course.price);
                    setValue('courseDateTime', course.courseDateTime ? course.courseDateTime.slice(0, 16) : '');
                    setValue('city', course.city);
                    setValue('duration', course.duration);
                    setValue('maxStudents', course.maxStudents ?? 1);
                    setIsLoading(false);
                })
                .catch(err => {
                    setError("Impossible de charger les données du cours.");
                    console.error(err);
                    setIsLoading(false);
                });
        }
    }, [courseId, isOpen, setValue]);

    const onSubmit = async (data: CourseFormData) => {
        try {
            setError(null);
            const payload = {
                ...data,
                price: Number(data.price),
                duration: Number(data.duration),
                maxStudents: Number(data.maxStudents)
            };
            const response = await apiClient.put(`/courses/${courseId}`, payload);
            onSuccess(response.data);
            onClose();
        } catch (_err) {
            setError('Erreur lors de la modification du cours.');
        }
    };

    const handleClose = () => {
        reset();
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        // --- MISE À JOUR DU STYLE ---
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-stone-50 rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] flex flex-col">

                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-200 flex-shrink-0">
                    <h2 className="text-lg sm:text-xl font-bold text-stone-800">Modifier le cours</h2>
                    <button onClick={handleClose} className="p-1 rounded-full text-stone-400 hover:bg-stone-200 hover:text-stone-600">
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center p-10">
                        <FiLoader className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
                            {error && (
                                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg p-3">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="title-edit" className="block text-sm font-medium text-stone-700 mb-1">Titre *</label>
                                <input
                                    id="title-edit"
                                    {...register('title', { required: 'Le titre est obligatoire' })}
                                    className={`w-full px-3 py-2 border rounded-lg bg-white ${errors.title ? 'border-rose-500' : 'border-stone-300'} focus:ring-orange-500 focus:border-orange-500`}
                                />
                                {errors.title && <p className="mt-1 text-sm text-rose-600">{errors.title.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="category-edit" className="block text-sm font-medium text-stone-700 mb-1">Catégorie *</label>
                                    <select
                                        id="category-edit"
                                        {...register('category', { required: 'La catégorie est obligatoire' })}
                                        className={`w-full px-3 py-2 border rounded-lg bg-white ${errors.category ? 'border-rose-500' : 'border-stone-300'} focus:ring-orange-500 focus:border-orange-500`}
                                    >
                                        {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="price-edit" className="block text-sm font-medium text-stone-700 mb-1">Prix du cours ({'\u20AC'}) *</label>
                                    <input
                                        id="price-edit"
                                        type="number"
                                        step="0.01"
                                        {...register('price', { required: 'Le prix est obligatoire', valueAsNumber: true, min: 1 })}
                                        className={`w-full px-3 py-2 border rounded-lg bg-white ${errors.price ? 'border-rose-500' : 'border-stone-300'} focus:ring-orange-500 focus:border-orange-500`}
                                    />
                                    <p className="mt-1 text-xs text-stone-500">
                                        Une commission de 10% sera retenue par HomeWork sur chaque paiement.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="courseDateTime-edit" className="block text-sm font-medium text-stone-700 mb-1">Date et heure du cours *</label>
                                <input
                                    id="courseDateTime-edit"
                                    type="datetime-local"
                                    {...register('courseDateTime', { required: 'La date du cours est obligatoire' })}
                                    className={`w-full px-3 py-2 border rounded-lg bg-white ${errors.courseDateTime ? 'border-rose-500' : 'border-stone-300'} focus:ring-orange-500 focus:border-orange-500`}
                                />
                                {errors.courseDateTime && <p className="mt-1 text-sm text-rose-600">{errors.courseDateTime.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="duration-edit" className="block text-sm font-medium text-stone-700 mb-1">Durée (minutes) *</label>
                                    <input
                                        id="duration-edit"
                                        type="number"
                                        {...register('duration', { required: 'La durée est obligatoire', valueAsNumber: true, min: 1 })}
                                        className={`w-full px-3 py-2 border rounded-lg bg-white ${errors.duration ? 'border-rose-500' : 'border-stone-300'} focus:ring-orange-500 focus:border-orange-500`}
                                    />
                                    {errors.duration && <p className="mt-1 text-sm text-rose-600">{errors.duration.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="maxStudents-edit" className="block text-sm font-medium text-stone-700 mb-1">Élèves maximum *</label>
                                    <input
                                        id="maxStudents-edit"
                                        type="number"
                                        {...register('maxStudents', { required: 'La capacité est obligatoire', valueAsNumber: true, min: 1 })}
                                        className={`w-full px-3 py-2 border rounded-lg bg-white ${errors.maxStudents ? 'border-rose-500' : 'border-stone-300'} focus:ring-orange-500 focus:border-orange-500`}
                                    />
                                    {errors.maxStudents && <p className="mt-1 text-sm text-rose-600">{errors.maxStudents.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="city-edit" className="block text-sm font-medium text-stone-700 mb-1">Ville *</label>
                                <input
                                    id="city-edit"
                                    {...register('city', { required: 'La ville est obligatoire' })}
                                    className={`w-full px-3 py-2 border rounded-lg bg-white ${errors.city ? 'border-rose-500' : 'border-stone-300'} focus:ring-orange-500 focus:border-orange-500`}
                                />
                                {errors.city && <p className="mt-1 text-sm text-rose-600">{errors.city.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="description-edit" className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                                <textarea
                                    id="description-edit"
                                    rows={4}
                                    {...register('description')}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg resize-vertical bg-white focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                        </form>

                        <div className="flex justify-end space-x-3 p-4 sm:p-6 border-t border-stone-200 flex-shrink-0">
                            <button type="button" onClick={handleClose} className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 bg-white hover:bg-stone-100">Annuler</button>
                            <button
                                type="button"
                                onClick={handleSubmit(onSubmit)}
                                disabled={!isDirty || isSubmitting}
                                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <FiLoader className="w-5 h-5 animate-spin mr-2" /> : <FiSave className="w-5 h-5 mr-2" />}
                                Enregistrer
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
        // --- FIN MISE À JOUR ---
    );
}
