import {Link} from "react-router-dom";
import {type Category, CATEGORY_IMAGES, type Course} from "../types";

export default function CourseCard({course}: { course: Course }) {
    const imageUrl: string = CATEGORY_IMAGES[course.category as Category] || '/images/default-course.jpg';

    return (
        <Link to={`/courses/${course.id}`} className="group block">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                <div className="h-40 bg-stone-200 flex items-center justify-center">
                    <img
                        src={imageUrl}
                        alt={`Illustration pour la catégorie ${course.category}`}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="p-6">
                    <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-1">{course.category}</p>
                    <h3 className="text-2xl font-bold text-stone-800 truncate group-hover:text-orange-700 transition-colors">{course.title}</h3>
                    <p className="text-stone-600 mt-2">Par {course.teacher.firstName} {course.teacher.lastName}</p>
                    <p className="text-stone-500 text-sm mt-1">{course.city}</p>

                    <div className="mt-4 flex justify-between items-center">
                        <p className="text-xl font-bold text-stone-800">{course.pricePerHour}{'\u20AC'}<span
                            className="text-sm font-normal text-stone-500">/h</span></p>
                        <div
                            className="bg-stone-100 text-stone-800 font-semibold py-2 px-4 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-all">
                            Voir les détails
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
