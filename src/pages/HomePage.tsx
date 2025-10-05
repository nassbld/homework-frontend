import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiBookOpen, FiUsers, FiStar } from 'react-icons/fi';

const heroImageUrl = '/images/hero-image.jpg';

export default function HomePage() {

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { stiffness: 100 }
        }
    };

    return (
        // --- MISE À JOUR DU STYLE ---
        <div className="bg-orange-50 text-stone-800">
            {/* --- Section Héros --- */}
            <main className="container mx-auto px-6 py-20 md:py-32">
                <motion.div
                    className="grid md:grid-cols-2 gap-12 items-center"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Contenu texte */}
                    <div className="text-center md:text-left">
                        <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-extrabold tracking-tight text-stone-800">
                            Apprenez. Partagez. <span className="text-orange-600">Progressez.</span>
                        </motion.h1>
                        <motion.p variants={itemVariants} className="mt-6 text-lg md:text-xl text-stone-600 max-w-xl mx-auto md:mx-0">
                            HomeWork est la plateforme qui connecte ceux qui veulent apprendre et ceux qui aiment enseigner les savoir-faire du quotidien.
                        </motion.p>
                        <motion.div variants={itemVariants} className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Link to="/courses" className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-orange-700 transition-transform transform hover:scale-105">
                                Trouver un cours
                                <FiArrowRight className="h-5 w-5" />
                            </Link>
                            <Link to="/register" className="inline-flex items-center justify-center rounded-lg bg-stone-200 px-8 py-4 text-base font-semibold text-stone-800 shadow-lg hover:bg-stone-300 transition-transform transform hover:scale-105">
                                Devenir formateur
                            </Link>
                        </motion.div>
                    </div>

                    {/* Image */}
                    <motion.div variants={itemVariants} className="hidden md:block">
                        <img src={heroImageUrl} alt="Personne apprenant à cuisiner via un cours en ligne" className="rounded-xl shadow-2xl"/>
                    </motion.div>
                </motion.div>
            </main>

            {/* --- Section des Bénéfices --- */}
            <section className="bg-orange-50 py-20">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        <div className="flex flex-col items-center">
                            <div className="bg-orange-100 text-orange-600 p-4 rounded-full mb-4">
                                <FiBookOpen className="h-8 w-8"/>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Des milliers de cours</h3>
                            <p className="text-stone-600">De la cuisine au jardin, trouvez le savoir-faire qui vous manque.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="bg-green-100 text-green-600 p-4 rounded-full mb-4">
                                <FiUsers className="h-8 w-8"/>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Des professeurs passionnés</h3>
                            <p className="text-stone-600">Apprenez auprès de formateurs locaux vérifiés et passionnés par leur domaine.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="bg-amber-100 text-amber-600 p-4 rounded-full mb-4">
                                <FiStar className="h-8 w-8"/>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Apprentissage chaleureux</h3>
                            <p className="text-stone-600">Des cours en personne, pour favoriser le lien humain et le partage.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        // --- FIN MISE À JOUR ---
    );
}
