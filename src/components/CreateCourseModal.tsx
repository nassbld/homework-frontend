import { useState } from 'react';
import { useForm } from 'react-hook-form';
import apiClient from '../services/api';
import type {Category, Course} from '../types';
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

interface CreateCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newCourse: Course) => void;
}

const CATEGORIES: { value: Category; label: string }[] = [
    { value: 'CUISINE', label: 'Cuisine' },
    { value: 'COUTURE', label: 'Couture' },
    { value: 'BRICOLAGE', label: 'Bricolage' },
    { value: 'MECANIQUE', label: 'Mécanique' },
    { value: 'JARDINAGE', label: 'Jardinage' },
    { value: 'AUTRE', label: 'Autre' },
];

export default function CreateCourseModal({ isOpen, onClose, onSuccess }: CreateCourseModalProps) {
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<CourseFormData>({
        defaultValues: {
            title: '',
            description: '',
            category: 'AUTRE',
            price: 25,
            courseDateTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString().slice(0, 16),
            city: ''
        }
    });

    const onSubmit = async (data: CourseFormData) => {
        try {
            setError(null);
            const payload = {
                ...data,
                price: Number(data.price),
                duration: Number(data.duration),
                maxStudents: Number(data.maxStudents)
            };
            const response = await apiClient.post('/courses', payload);
            reset();
            onSuccess(response.data);
            onClose();
        } catch (err) {
            setError('Erreur lors de la création du cours.');
            console.log(err);
        }
    };

    const handleClose = () => {
        reset();
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
            <div
                className="bg-stone-50 rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >

                {/* --- MISE À JOUR DU STYLE --- */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-200 flex-shrink-0">
                    <h2 className="text-lg sm:text-xl font-bold text-stone-800">Créer un nouveau cours</h2>
                    <button onClick={handleClose} className="p-1 rounded-full text-stone-400 hover:bg-stone-200 hover:text-stone-600">
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg p-3">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-stone-700 mb-1">Titre *</label>
                        <input
                            id="title"
                            {...register('title', { required: 'Le titre est obligatoire' })}
                            className={`w-full px-3 py-2 border rounded-lg bg-white ${errors.title ? 'border-rose-500' : 'border-stone-300'} focus:ring-orange-500 focus:border-orange-500`}
                            disabled={isSubmitting}
                        />
                        {errors.title && <p className="mt-1 text-sm text-rose-600">{errors.title.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-stone-700 mb-1">Catégorie *</label>
                            <select
                                id="category"
                                {...register('category', { required: 'La catégorie est obligatoire' })}
                                className={`w-full px-3 py-2 border rounded-lg bg-white ${errors.category ? 'border-rose-500' : 'border-stone-300'} focus:ring-orange-500 focus:border-orange-500`}
                                disabled={isSubmitting}
                            >
                                {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-stone-700 mb-1">Prix du cours ({'\u20AC'}) *</label>
                            <input
                                id="price"
                                type="number"
                                step="0.01"
                                {...register('price', { required: 'Le prix est obligatoire', valueAsNumber: true, min: { value: 1, message: 'Le prix doit être positif' }})}
                                className={`w-full px-3 py-2 border rounded-lg bg-white ${errors.price ? 'border-rose-500' : 'border-stone-300'} focus:ring-orange-500 focus:border-orange-500`}
                                disabled={isSubmitting}
                            />
                            <p className="mt-1 text-xs text-stone-500">
                                Une commission de 10% sera retenue par HomeWork sur chaque paiement.
                            </p>
                            {errors.price && <p className="mt-1 text-sm text-rose-600">{errors.price.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="courseDateTime" className="block text-sm font-medium text-stone-700 mb-1">Date et heure du cours *</label>
                        <input
                            id="courseDateTime"
                            type="datetime-local"
                            {...register('courseDateTime', { required: 'La date du cours est obligatoire' })}
                            className={`w-full px-3 py-2 border rounded-lg bg-white ${errors.courseDateTime ? 'border-rose-500' : 'border-stone-300'} focus:ring-orange-500 focus:border-orange-500`}
                            disabled={isSubmitting}
                        />
                        {errors.courseDateTime && <p className="mt-1 text-sm text-rose-600">{errors.courseDateTime.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-stone-700 mb-1">Ville *</label>
                        <input
                            id="city"
                            {...register('city', { required: 'La ville est obligatoire' })}
                            className={`w-full px-3 py-2 border rounded-lg bg-white ${errors.city ? 'border-rose-500' : 'border-stone-300'} focus:ring-orange-500 focus:border-orange-500`}
                            disabled={isSubmitting}
                        />
                        {errors.city && <p className="mt-1 text-sm text-rose-600">{errors.city.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                        <textarea
                            id="description"
                            rows={4}
                            {...register('description')}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg resize-vertical bg-white focus:ring-orange-500 focus:border-orange-500"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-stone-700 mb-1">
                                Durée (en minutes) *
                            </label>
                            <input
                                id="duration"
                                type="number"
                                {...register('duration', { required: 'La durée est obligatoire', valueAsNumber: true, min: { value: 1, message: 'La durée doit être positive' }})}
                                className={`w-full px-3 py-2 border rounded-lg bg-white ${errors.duration ? 'border-rose-500' : 'border-stone-300'} focus:ring-orange-500 focus:border-orange-500`}
                                placeholder="Ex: 90"
                            />
                            {errors.duration && <p className="mt-1 text-sm text-rose-600">{errors.duration.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="maxStudents" className="block text-sm font-medium text-stone-700 mb-1">
                                Élèves maximum *
                            </label>
                            <input
                                id="maxStudents"
                                type="number"
                                {...register('maxStudents', { required: 'La capacité est obligatoire', valueAsNumber: true, min: { value: 1, message: 'Il doit y avoir au moins 1 élève' }})}
                                className={`w-full px-3 py-2 border rounded-lg bg-white ${errors.maxStudents ? 'border-rose-500' : 'border-stone-300'} focus:ring-orange-500 focus:border-orange-500`}
                                placeholder="Ex: 10"
                            />
                            {errors.maxStudents && <p className="mt-1 text-sm text-rose-600">{errors.maxStudents.message}</p>}
                        </div>
                    </div>
                </form>

                <div className="flex justify-end space-x-3 p-4 sm:p-6 border-t border-stone-200 flex-shrink-0">
                    <button type="button" onClick={handleClose} disabled={isSubmitting} className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 bg-white hover:bg-stone-100">Annuler</button>
                    <button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">
                        {isSubmitting ? <FiLoader className="w-5 h-5 animate-spin mr-2" /> : <FiSave className="w-5 h-5 mr-2" />}
                        {isSubmitting ? 'Création...' : 'Créer le cours'}
                    </button>
                </div>
                {/* --- FIN MISE À JOUR --- */}

            </div>
        </div>
    );
}
