import type { Category } from '../types';

interface FilterBarProps {
    selectedCategory: Category | null;
    onSelectCategory: (category: Category | null) => void;
}

const CATEGORIES: Category[] = ["CUISINE", "COUTURE", "BRICOLAGE", "MECANIQUE", "JARDINAGE", "AUTRE"];

export default function FilterBar({ selectedCategory, onSelectCategory }: FilterBarProps) {

    return (
        // Le conteneur principal reste un flex pour le centrage
        <div className="flex items-center justify-center mb-8 md:mb-12">

            {/* --- NOUVELLE STRUCTURE --- */}
            {/* Conteneur du groupe de boutons : blanc, arrondi, avec une légère ombre */}
            <div className="inline-flex items-center bg-white rounded-full shadow-md p-1.5 gap-1">

                <button
                    onClick={() => onSelectCategory(null)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 outline-none ${
                        selectedCategory === null
                            ? 'bg-orange-600 text-white shadow' // Style ACTIF
                            : 'text-stone-600 hover:text-orange-600' // Style INACTIF
                    }`}
                >
                    Toutes
                </button>

                {CATEGORIES.map((category) => (
                    <button
                        key={category}
                        onClick={() => onSelectCategory(category)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 hover outline-none ${
                            selectedCategory === category
                                ? 'bg-orange-600 text-white shadow' // Style ACTIF
                                : 'text-stone-600 hover:text-orange-600' // Style INACTIF
                        }`}
                    >
                        {/* Met la première lettre en majuscule, le reste en minuscule */}
                        {category.charAt(0) + category.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>
            {/* --- FIN DE LA NOUVELLE STRUCTURE --- */}
        </div>
    );
}

