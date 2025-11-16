import type { Category } from '../types';

interface FilterBarProps {
    selectedCategory: Category | null;
    onSelectCategory: (category: Category | null) => void;
}

const CATEGORIES: Category[] = ["CUISINE", "COUTURE", "BRICOLAGE", "MECANIQUE", "JARDINAGE", "AUTRE"];

function formatLabel(category: Category | null) {
    if (!category) return 'Toutes';
    return category.charAt(0) + category.slice(1).toLowerCase();
}

export default function FilterBar({ selectedCategory, onSelectCategory }: FilterBarProps) {

    return (
        <div className="sticky top-4 z-30 mb-10 flex justify-center px-4">
            <div className="mx-auto flex w-full max-w-full flex-wrap items-center justify-center gap-2 rounded-full bg-white/85 px-4 py-2 shadow-card backdrop-blur sm:max-w-max">
                {[null, ...CATEGORIES].map((category) => {
                    const isActive = selectedCategory === category;
                    return (
                        <button
                            key={category ?? 'all'}
                            onClick={() => onSelectCategory(category)}
                            className={`pill border border-transparent px-4 py-2 text-sm font-semibold transition-all duration-200 ease-soft-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 ${
                                isActive
                                    ? 'bg-brand-500 text-white shadow-soft'
                                    : 'bg-transparent text-charcoal-700 hover:bg-brand-50 hover:text-brand-600'
                            }`}
                        >
                            {formatLabel(category)}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

