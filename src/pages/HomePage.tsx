import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { FiArrowRight, FiHeart, FiStar, FiUsers, FiCoffee, FiSun } from 'react-icons/fi';

const images = {
    hero: '/images/hero-image.jpg',
    cuisine: '/images/cuisine.jpg',
    couture: '/images/couture.jpg',
    bricolage: '/images/bricolage.jpg',
    jardinage: '/images/jardinage.jpg',
};

export default function HomePage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 50, damping: 20 }
        }
    };

    const categories = [
        { title: 'Cuisine & Pâtisserie', image: images.cuisine, color: 'bg-orange-100' },
        { title: 'Bricolage & Maison', image: images.bricolage, color: 'bg-blue-100' },
        { title: 'Arts du fil', image: images.couture, color: 'bg-rose-100' },
        { title: 'Jardinage', image: images.jardinage, color: 'bg-green-100' },
    ];

    return (
        <div className="min-h-screen bg-sand-50 text-charcoal-900 selection:bg-brand-200 selection:text-brand-900">
            <main className="overflow-x-hidden">
                {/* Hero Section */}
                <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[600px] bg-gradient-to-b from-brand-50/80 to-transparent rounded-[50%] blur-3xl -z-10 pointer-events-none" />
                    
                    <div className="container mx-auto px-6">
                        <motion.div 
                            className="flex flex-col lg:flex-row items-center gap-16"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Text Content */}
                            <motion.div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
                                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-brand-100 text-brand-700 text-sm font-medium mb-8">
                                    <FiSun className="text-brand-500" />
                                    <span>L'apprentissage, côté humain</span>
                                </motion.div>
                                
                                <motion.h1 variants={itemVariants} className="font-display text-5xl lg:text-7xl leading-[1.1] mb-6 text-charcoal-900">
                                    Partagez plus qu'un <span className="text-brand-500 italic">savoir-faire</span>.
                                </motion.h1>
                                
                                <motion.p variants={itemVariants} className="text-xl text-charcoal-600 mb-10 leading-relaxed">
                                    HomeWork connecte voisins et passionnés pour des moments d'apprentissage conviviaux. 
                                    Découvrez des ateliers chaleureux, juste à côté de chez vous.
                                </motion.p>
                                
                                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                    <Link to="/courses" className="w-full sm:w-auto btn-primary px-8 py-4 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 bg-brand-600 text-white rounded-full font-medium transition-all flex items-center justify-center gap-2">
                                        Trouver un atelier
                                        <FiArrowRight />
                                    </Link>
                                    <Link to="/register" className="w-full sm:w-auto px-8 py-4 text-lg rounded-full bg-white text-charcoal-700 font-medium border border-sand-200 hover:border-brand-300 hover:bg-brand-50 transition-colors flex items-center justify-center">
                                        Devenir formateur
                                    </Link>
                                </motion.div>

                                <motion.div variants={itemVariants} className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-charcoal-500 text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-3">
                                            {[1,2,3].map(i => (
                                                <div key={i} className="w-10 h-10 rounded-full bg-sand-200 border-2 border-white" />
                                            ))}
                                        </div>
                                        <span className="ml-2">+2 400 membres</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FiStar className="fill-brand-400 text-brand-400" />
                                        <span>4.9/5 de satisfaction</span>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Hero Images - Collage */}
                            <motion.div variants={itemVariants} className="flex-1 relative w-full max-w-[600px] lg:max-w-none">
                                <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square">
                                    <motion.div 
                                        className="absolute top-4 right-4 w-2/3 h-2/3 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white rotate-3 z-10"
                                        whileHover={{ scale: 1.02, rotate: 1 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <img src={images.hero} alt="Atelier convivial" className="w-full h-full object-cover" />
                                    </motion.div>
                                    <motion.div 
                                        className="absolute bottom-4 left-4 w-1/2 h-1/2 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white -rotate-3 z-20"
                                        whileHover={{ scale: 1.05, rotate: -1 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <img src={images.cuisine} alt="Cuisine" className="w-full h-full object-cover" />
                                    </motion.div>
                                    
                                    {/* Decorative elements */}
                                    <div className="absolute top-0 left-10 w-24 h-24 bg-brand-100 rounded-full blur-xl opacity-60 -z-10" />
                                    <div className="absolute bottom-10 right-10 w-32 h-32 bg-sand-300 rounded-full blur-2xl opacity-50 -z-10" />
                                    
                                    <div className="absolute top-1/2 left-0 -translate-x-6 -translate-y-1/2 z-30 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-card max-w-[200px]">
                                        <p className="text-sm font-display text-charcoal-800 italic">"Super moment d'échange, merci pour ce cours !"</p>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-charcoal-500">
                                            <div className="w-6 h-6 rounded-full bg-brand-200" />
                                            <span>Sophie, Paris</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Categories / Envies */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="font-display text-3xl md:text-4xl text-charcoal-900 mb-4">Vos envies du moment</h2>
                            <p className="text-charcoal-600 max-w-2xl mx-auto">Explorez les thématiques qui passionnent notre communauté cette semaine.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {categories.map((cat, idx) => (
                                <Link key={idx} to="/courses" className="group block relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer">
                                    <img src={cat.image} alt={cat.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />
                                    <div className="absolute bottom-0 left-0 p-6 text-white">
                                        <h3 className="font-display text-xl font-medium mb-2 translate-y-0 group-hover:-translate-y-1 transition-transform">{cat.title}</h3>
                                        <span className="inline-flex items-center gap-1 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                            Découvrir <FiArrowRight />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Values / Why Us */}
                <section className="py-20 bg-sand-50">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-3 gap-10">
                            {[
                                {
                                    icon: <FiCoffee className="w-6 h-6" />,
                                    title: "Ambiance Cosy",
                                    desc: "Fini les salles de classe froides. Apprenez dans des salons, des ateliers ou des jardins accueillants."
                                },
                                {
                                    icon: <FiUsers className="w-6 h-6" />,
                                    title: "Petits Groupes",
                                    desc: "Des sessions en petit comité pour faciliter les échanges, les questions et les rencontres."
                                },
                                {
                                    icon: <FiHeart className="w-6 h-6" />,
                                    title: "Passion Partagée",
                                    desc: "Nos formateurs ne sont pas juste des experts, ce sont des voisins passionnés qui veulent transmettre."
                                }
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-sand-100 hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6">
                                        {item.icon}
                                    </div>
                                    <h3 className="font-display text-xl text-charcoal-900 mb-3">{item.title}</h3>
                                    <p className="text-charcoal-600 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="py-20 px-6">
                    <div className="container mx-auto">
                        <div className="bg-brand-900 rounded-[3rem] p-8 md:p-16 text-center text-white relative overflow-hidden">
                            {/* Background patterns */}
                            <div className="absolute top-0 left-0 w-64 h-64 bg-brand-700 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50" />
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-50" />

                            <div className="relative z-10 max-w-3xl mx-auto">
                                <h2 className="font-display text-3xl md:text-5xl mb-6">Prêt à rejoindre l'aventure ?</h2>
                                <p className="text-brand-100 text-lg md:text-xl mb-10">
                                    Que vous ayez un talent à partager ou une soif d'apprendre, il y a une place pour vous chez HomeWork.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link to="/courses" className="btn-primary bg-white text-brand-900 hover:bg-brand-50 px-8 py-4 rounded-full font-medium">
                                        Explorer les cours
                                    </Link>
                                    <Link to="/register" className="px-8 py-4 rounded-full border border-brand-700 text-white hover:bg-brand-800 transition-colors">
                                        Créer un compte
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
