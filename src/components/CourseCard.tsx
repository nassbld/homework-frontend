import { Link } from "react-router-dom";
import { FiArrowRight, FiCalendar, FiMapPin } from "react-icons/fi";
import { type Category, CATEGORY_IMAGES, type Course } from "../types";

export default function CourseCard({ course }: { course: Course }) {
    const imageUrl: string = CATEGORY_IMAGES[course.category as Category] || '/images/default-course.jpg';

    const formattedCourseDate = new Date(course.courseDateTime).toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
    });

    const formattedPrice = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
    }).format(course.price);

    return (
        <Link to={`/courses/${course.id}`} className="group block h-full">
            <article className="card-elevated flex h-full flex-col overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={`Illustration pour la catégorie ${course.category}`}
                        className="h-full w-full object-cover transition-transform duration-500 ease-soft-in-out group-hover:scale-105"
                    />
                    <span className="pill absolute left-4 top-4 bg-white/80 uppercase tracking-wide text-xs font-semibold text-brand-600 backdrop-blur">
                        {course.category}
                    </span>
                </div>

                <div className="flex flex-1 flex-col gap-4 p-6">
                    <div className="space-y-2">
                        <h3 className="font-display text-2xl leading-tight text-charcoal-900 transition-colors duration-200 ease-soft-in-out group-hover:text-brand-500">
                            {course.title}
                        </h3>
                        <p className="text-sm text-charcoal-600">
                            Par <span className="font-medium text-charcoal-800">{course.teacher.firstName} {course.teacher.lastName}</span>
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-charcoal-600">
                        <span className="inline-flex items-center gap-2 rounded-full bg-sand-100 px-3 py-1">
                            <FiMapPin className="h-4 w-4 text-brand-500" />
                            {course.city}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-sand-100 px-3 py-1">
                            <FiCalendar className="h-4 w-4 text-brand-500" />
                            {formattedCourseDate}
                        </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4">
                        <p className="font-display text-xl text-brand-600">{formattedPrice}</p>
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal-700 transition-all duration-200 ease-soft-in-out group-hover:text-brand-500">
                            Voir les détails
                            <FiArrowRight className="h-4 w-4" />
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
