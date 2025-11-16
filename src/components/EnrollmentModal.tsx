import { useEffect, useMemo, useState } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { AnimatePresence, motion } from 'framer-motion';
import { FiAlertTriangle, FiArrowLeft, FiCheckCircle, FiCreditCard, FiLoader, FiLock } from 'react-icons/fi';
import type { Course, Enrollment, PaymentIntentData } from '../types';
import { createPaymentIntent, confirmPayment } from '../services/paymentApi';

interface EnrollmentModalProps {
    course: Course | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 'confirmation' | 'payment' | 'success';

function formatCurrency(amount: number, currency: string) {
    const normalisedCurrency = currency?.toUpperCase() || 'EUR';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: normalisedCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDateTime(value: string) {
    return new Date(value).toLocaleString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

interface PaymentStepProps {
    paymentDetails: PaymentIntentData;
    onSuccess: (enrollment: Enrollment) => void;
    onBack: () => void;
    onError: (message: string) => void;
}

function PaymentStep({ paymentDetails, onSuccess, onBack, onError }: PaymentStepProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!stripe || !elements) {
            setPaymentError('Le système de paiement n\'est pas encore prêt. Veuillez patienter.');
            return;
        }

        setIsProcessing(true);
        setPaymentError(null);
        onError('');

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href,
            },
            redirect: 'if_required'
        });

        if (error) {
            const message = error.message || 'Le paiement a été refusé.';
            setPaymentError(message);
            onError(message);
            setIsProcessing(false);
            return;
        }

        if (paymentIntent?.status === 'succeeded') {
            try {
                const enrollment = await confirmPayment(paymentDetails.paymentIntentId);
                onSuccess(enrollment);
            } catch (err: any) {
                const message = err?.response?.data?.message || 'Erreur lors de la confirmation du paiement.';
                setPaymentError(message);
                onError(message);
            } finally {
                setIsProcessing(false);
            }
            return;
        }

        if (paymentIntent?.status === 'requires_action') {
            const message = 'Le paiement nécessite une action supplémentaire. Merci de suivre les instructions de Stripe.';
            setPaymentError(message);
            onError(message);
        } else {
            const message = `Statut de paiement inattendu : ${paymentIntent?.status ?? 'inconnu'}`;
            setPaymentError(message);
            onError(message);
        }
        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <FiLock className="text-orange-500" />
                    <h3 className="text-sm font-semibold text-stone-700">Paiement sécurisé par Stripe</h3>
                </div>
                <PaymentElement options={{ layout: 'tabs' }} />
            </div>

            {paymentError && (
                <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
                    <FiAlertTriangle className="mt-0.5" />
                    <span>{paymentError}</span>
                </div>
            )}

            <div className="flex justify-between items-center">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-stone-600 hover:bg-stone-100"
                    disabled={isProcessing}
                >
                    <FiArrowLeft /> Retour
                </button>
                <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                    disabled={isProcessing}
                >
                    {isProcessing ? <FiLoader className="animate-spin" /> : <FiCreditCard />}
                    {isProcessing ? 'Paiement en cours...' : `Payer ${formatCurrency(paymentDetails.amount, paymentDetails.currency)}`}
                </button>
            </div>
        </form>
    );
}

export default function EnrollmentModal({ course, isOpen, onClose, onSuccess }: EnrollmentModalProps) {
    const [step, setStep] = useState<Step>('confirmation');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState<PaymentIntentData | null>(null);
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);

    useEffect(() => {
        if (!paymentDetails) {
            setStripePromise(null);
            return;
        }
        setStripePromise(loadStripe(paymentDetails.publishableKey));
    }, [paymentDetails]);

    useEffect(() => {
        if (!isOpen) {
            setStep('confirmation');
            setError(null);
            setIsSubmitting(false);
            setPaymentDetails(null);
            setEnrollment(null);
        }
    }, [isOpen]);

    const platformFeePreview = useMemo(() => Number((course?.price ?? 0) * 0.1), [course?.price]);
    const teacherAmountPreview = useMemo(() => Number((course?.price ?? 0) - platformFeePreview), [course?.price, platformFeePreview]);

    if (!isOpen || !course) {
        return null;
    }

    const handleStartPayment = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            const intent = await createPaymentIntent(course.id);
            setPaymentDetails(intent);
            setStep('payment');
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Impossible de créer le paiement. Veuillez réessayer.';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePaymentSuccess = (createdEnrollment: Enrollment) => {
        setEnrollment(createdEnrollment);
        setStep('success');
        onSuccess();
    };

    const handleClose = () => {
        if (isSubmitting) {
            return;
        }
        onClose();
    };

    const handleBackToConfirmation = () => {
        setPaymentDetails(null);
        setError(null);
        setStep('confirmation');
    };

    const handleErrorMessage = (message: string) => {
        if (!message) {
            setError(null);
        } else {
            setError(message);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onClick={() => (step === 'payment' && isSubmitting ? undefined : handleClose())}
                >
                    <motion.div
                        className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                        <div className="border-b border-stone-200 px-6 py-4">
                            <h2 className="text-xl font-semibold text-stone-800">
                                {step === 'confirmation' && 'Confirmer votre inscription'}
                                {step === 'payment' && 'Paiement sécurisé'}
                                {step === 'success' && 'Inscription confirmée !'}
                            </h2>
                            <p className="text-sm text-stone-500">
                                {step === 'confirmation' && "Vérifiez les informations du cours avant de procéder au paiement."}
                                {step === 'payment' && "Entrez vos informations de paiement pour finaliser votre inscription."}
                                {step === 'success' && "Votre place est réservée. Nous vous avons envoyé une confirmation."}
                            </p>
                        </div>

                        <div className="px-6 py-6 space-y-4">
                            {error && (
                                <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
                                    <FiAlertTriangle className="mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {step === 'confirmation' && (
                                <div className="space-y-4">
                                    <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                                        <h3 className="text-sm font-semibold text-stone-700">Cours sélectionné</h3>
                                        <p className="mt-1 text-lg font-bold text-stone-900">{course.title}</p>
                                        <p className="text-sm text-stone-600">{course.category} • {course.city}</p>
                                        <p className="text-sm text-stone-600">{formatDateTime(course.courseDateTime)}</p>
                                        <p className="text-sm text-stone-600">Durée : {course.duration} minutes</p>
                                    </div>

                                    <div className="rounded-lg border border-stone-200 bg-white p-4">
                                        <h3 className="text-sm font-semibold text-stone-700">Récapitulatif du paiement</h3>
                                        <div className="mt-3 space-y-2 text-sm text-stone-600">
                                            <div className="flex justify-between">
                                                <span>Prix du cours</span>
                                                <span>{formatCurrency(course.price, 'EUR')}</span>
                                            </div>
                                            <div className="flex justify-between text-stone-500">
                                                <span>Commission HomeWork (10%)</span>
                                                <span>- {formatCurrency(platformFeePreview, 'EUR')}</span>
                                            </div>
                                            <div className="flex justify-between text-stone-500">
                                                <span>Versé au formateur</span>
                                                <span>{formatCurrency(teacherAmountPreview, 'EUR')}</span>
                                            </div>
                                            <div className="flex justify-between border-t border-dashed border-stone-300 pt-2 font-semibold text-stone-900">
                                                <span>Total à payer</span>
                                                <span>{formatCurrency(course.price, 'EUR')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleStartPayment}
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? <FiLoader className="animate-spin" /> : <FiCreditCard />}
                                        {isSubmitting ? 'Création du paiement...' : `Procéder au paiement de ${formatCurrency(course.price, 'EUR')}`}
                                    </button>
                                </div>
                            )}

                            {step === 'payment' && paymentDetails && stripePromise && (
                                <Elements stripe={stripePromise} options={{ clientSecret: paymentDetails.clientSecret }}>
                                    <PaymentStep
                                        paymentDetails={paymentDetails}
                                        onSuccess={handlePaymentSuccess}
                                        onBack={handleBackToConfirmation}
                                        onError={handleErrorMessage}
                                    />
                                </Elements>
                            )}

                            {step === 'success' && paymentDetails && enrollment && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700">
                                        <FiCheckCircle className="text-green-600" size={24} />
                                        <div>
                                            <p className="font-semibold">Paiement confirmé</p>
                                            <p className="text-sm">Vous êtes inscrit au cours. Un email de confirmation vous a été envoyé.</p>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-600">
                                        <div className="flex justify-between">
                                            <span>Cours</span>
                                            <span className="font-semibold text-stone-900">{course.title}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Date</span>
                                            <span>{formatDateTime(course.courseDateTime)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Durée</span>
                                            <span>{course.duration} minutes</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Montant payé</span>
                                            <span className="font-semibold text-stone-900">{formatCurrency(paymentDetails.amount, paymentDetails.currency)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Commission HomeWork</span>
                                            <span>- {formatCurrency(paymentDetails.platformFee, paymentDetails.currency)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleClose}
                                        className="w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
