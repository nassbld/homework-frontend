import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiBookOpen, FiUsers, FiStar, FiHeart, FiMapPin } from 'react-icons/fi';

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

    const stats = [
        { label: 'Cours disponibles', value: '320+' },
        { label: 'Formateurs passionnés', value: '180' },
        { label: 'Évaluations 5★', value: '2 400' },
    ];

    const features = [
        {
            icon: <FiBookOpen className="h-6 w-6" />,
            title: 'Des parcours variés',
            description: 'Cuisine, couture, bricolage… explorez des savoir-faire accessibles près de chez vous.',
            color: 'bg-brand-100 text-brand-600'
        },
        {
            icon: <FiUsers className="h-6 w-6" />,
            title: 'Des rencontres humaines',
            description: 'Apprenez auprès de passionnés, en petits groupes ou en tête-à-tête pour un lien authentique.',
            color: 'bg-sand-200 text-charcoal-900'
        },
        {
            icon: <FiStar className="h-6 w-6" />,
            title: 'Une communauté ravie',
            description: '98 % de satisfaction et des retours élogieux après chaque cours partagé.',
            color: 'bg-amber-100 text-amber-600'
        },
    ];

    return (
        <div className="min-h-screen bg-sand-50 text-charcoal-900">
            <main>
                {/* Hero */}
                <section className="relative overflow-hidden bg-hero-gradient">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-brand-100 opacity-60 blur-3xl" />
                        <div className="absolute -bottom-16 -right-10 h-80 w-80 rounded-full bg-sand-200 opacity-70 blur-3xl" />
                    </div>

                    <div className="relative container mx-auto flex flex-col gap-16 px-6 py-20 md:flex-row md:items-center md:py-28 lg:py-32">
                        <motion.div
                            className="flex-1 space-y-6 text-center md:text-left"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div variants={itemVariants} className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-brand-600 shadow-card backdrop-blur">
                                <span className="pill bg-white/70 text-brand-500">
                                    <FiMapPin className="mr-1 inline h-4 w-4" />
                                    Partout en France
                                </span>
                                Une communauté qui grandit chaque semaine
                            </motion.div>

                            <motion.h1 variants={itemVariants} className="font-display text-4xl leading-tight md:text-6xl">
                                Apprenez. Partagez. <span className="text-brand-500">Progressez.</span>
                            </motion.h1>
                            <motion.p variants={itemVariants} className="mx-auto max-w-xl text-lg text-charcoal-700 md:mx-0 md:text-xl">
                                HomeWork connecte celles et ceux qui veulent transmettre leurs savoir-faire à des élèves motivés.
                                Découvrez des cours chaleureux, personnalisés et proches de chez vous.
                            </motion.p>

                            <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 sm:flex-row md:items-start">
                                <Link to="/courses" className="btn-primary">
                                    Trouver un cours
                                    <FiArrowRight className="h-5 w-5" />
                                </Link>
                                <Link to="/register" className="btn-secondary">
                                    Devenir formateur
                                </Link>
                            </motion.div>

                            <motion.ul variants={itemVariants} className="mt-8 grid gap-4 text-left sm:grid-cols-3">
                                {stats.map((stat) => (
                                    <li key={stat.label} className="rounded-3xl bg-white/70 p-4 shadow-card backdrop-blur">
                                        <p className="font-display text-2xl text-brand-500">{stat.value}</p>
                                        <p className="text-sm text-charcoal-600">{stat.label}</p>
                                    </li>
                                ))}
                            </motion.ul>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="relative flex-1"
                        >
                            <div className="card-elevated relative mx-auto max-w-md overflow-hidden rounded-4xl">
                                <img
                                    src={heroImageUrl}
                                    alt="Personnes partageant un cours HomeWork"
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-full bg-white/85 px-4 py-2 text-sm text-charcoal-800 shadow-soft backdrop-blur">
                                    <FiHeart className="h-4 w-4 text-brand-500" />
                                    <span>“Un moment chaleureux et inspirant”</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Features */}
                <section className="container mx-auto px-6 py-20">
                    <div className="mb-12 text-center">
                        <span className="pill mx-auto bg-brand-50 text-brand-600">Pourquoi HomeWork ?</span>
                        <h2 className="mt-4 font-display text-3xl md:text-4xl">Un apprentissage humain et accessible</h2>
                        <p className="mx-auto mt-3 max-w-2xl text-charcoal-600">
                            Une sélection de cours pensés pour favoriser la progression, le partage et la convivialité, que vous soyez débutant ou passionné confirmé.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {features.map((feature) => (
                            <div key={feature.title} className="card-elevated flex flex-col gap-4 p-8 text-left">
                                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${feature.color}`}>
                                    {feature.icon}
                                </span>
                                <h3 className="font-display text-2xl">{feature.title}</h3>
                                <p className="text-charcoal-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
